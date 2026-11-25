import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import { ObjectId } from "mongodb";
import { initialProducts } from "../shared/initialProducts.js";
import { connectToDatabase } from "./db.js";

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(serverDirectory, "..");
dotenv.config({ path: resolve(projectDirectory, ".env.local") });

const app = express();
const port = Number(process.env.PORT || 3001);
const databaseName = process.env.MONGODB_DB || "garden_of_daffodils";
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/garden_of_daffodils";
const isProduction = process.env.NODE_ENV === "production";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  profilePicture: user.profilePicture || null
});

const serializeProduct = (product) => ({
  id: product._id,
  name: product.name,
  category: product.category,
  series: product.series,
  price: product.price,
  stock: product.stock,
  image: product.image
});

const serializeOrder = (order) => ({
  id: order._id.toString(),
  customerId: order.customerId,
  customerName: order.customerName,
  email: order.email,
  items: order.items,
  total: order.total,
  status: order.status,
  date: order.createdAt
});

const validateProduct = (values) => {
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const category = values.category;
  const price = Number(values.price);
  const stock = Number(values.stock);
  const image = typeof values.image === "string" ? values.image.trim() : "";

  if (!name || name.length > 200) {
    throw new HttpError(400, "Product name is required and must be 200 characters or fewer.");
  }
  if (!["Books", "Merchandise"].includes(category)) {
    throw new HttpError(400, "Choose a valid product category.");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new HttpError(400, "Product price must be a non-negative number.");
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new HttpError(400, "Stock must be a whole number of zero or more.");
  }
  if (image.length > 2048) {
    throw new HttpError(400, "Product image URL is too long.");
  }

  const product = { name, category, price, stock, image };
  if (category === "Books") {
    const series = typeof values.series === "string" ? values.series.trim() : "";
    if (!series || series.length > 100) {
      throw new HttpError(400, "Choose a valid book series.");
    }
    product.series = series;
  }
  return product;
};

const validateEmail = (email) => {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "Enter a valid email address.");
  }
  return email.trim().toLowerCase();
};

const normalizeCartItems = async (requestedItems) => {
  if (!Array.isArray(requestedItems) || requestedItems.length > 200) {
    throw new HttpError(400, "A cart can contain at most 100 different items.");
  }

  const quantities = new Map();
  for (const item of requestedItems) {
    const id = String(item?.id || "").trim();
    const quantity = Number(item?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      throw new HttpError(400, "Each cart item needs a valid product ID and quantity.");
    }
    const total = (quantities.get(id) || 0) + quantity;
    if (total > 1000) {
      throw new HttpError(400, "A product quantity cannot exceed 1000.");
    }
    quantities.set(id, total);
  }
  if (quantities.size > 100) {
    throw new HttpError(400, "A cart can contain at most 100 different items.");
  }

  const products = database.collection("products");
  const items = [];
  for (const [id, quantity] of quantities) {
    const product = await products.findOne({ _id: id });
    if (!product) {
      throw new HttpError(409, "A product in your cart is no longer available.");
    }
    items.push({
      id,
      name: product.name,
      category: product.category,
      series: product.series,
      price: product.price,
      stock: product.stock,
      image: product.image,
      quantity
    });
  }
  return items;
};

const cartOwnerId = (request) => request.session.userId
  ? `user:${request.session.userId}`
  : `guest:${request.sessionID}`;

let database;
let mongoClient;
let sessionMiddleware;

const requireAuth = asyncRoute(async (request, response, next) => {
  if (!request.session.userId || !ObjectId.isValid(request.session.userId)) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  const user = await database.collection("users").findOne({
    _id: new ObjectId(request.session.userId)
  });
  if (!user) {
    request.session.destroy(() => {});
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  request.user = user;
  next();
});

const requireAdmin = asyncRoute(async (request, response, next) => {
  if (!request.session.userId || !ObjectId.isValid(request.session.userId)) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  const user = await database.collection("users").findOne({
    _id: new ObjectId(request.session.userId)
  });
  if (!user || user.role !== "admin") {
    return response.status(403).json({ error: "Administrator access is required." });
  }

  request.user = user;
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Try again later." }
});

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use("/product-images", express.static(
  resolve(projectDirectory, "src", "Data", "product_images")
));
app.use(express.json({ limit: "2mb" }));
app.use((request, response, next) => {
  if (!sessionMiddleware) {
    return next(new Error("Session middleware is not ready."));
  }
  sessionMiddleware(request, response, next);
});

app.get("/api/health", (request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/cart", asyncRoute(async (request, response) => {
  const cart = await database.collection("carts").findOne({
    _id: cartOwnerId(request)
  });
  response.json({ items: cart?.items || [] });
}));

app.put("/api/cart", asyncRoute(async (request, response) => {
  const items = await normalizeCartItems(request.body?.items);
  const ownerId = cartOwnerId(request);
  const carts = database.collection("carts");

  if (await carts.findOne({ _id: ownerId, checkoutToken: { $exists: true } })) {
    throw new HttpError(409, "Your cart is being checked out. Try again shortly.");
  }

  if (items.length === 0) {
    await carts.deleteOne({
      _id: ownerId,
      checkoutToken: { $exists: false }
    });
  } else {
    try {
      await carts.replaceOne(
        { _id: ownerId, checkoutToken: { $exists: false } },
        { _id: ownerId, items, updatedAt: new Date() },
        { upsert: true }
      );
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpError(409, "Your cart is being checked out. Try again shortly.");
      }
      throw error;
    }
  }

  request.session.cartUpdatedAt = Date.now();
  response.json({ items });
}));

//log in route
app.post("/api/auth/login", loginLimiter, asyncRoute(async (request, response) => {
  const email = validateEmail(request.body?.email);
  const password = request.body?.password;
  if (typeof password !== "string" || !password) {
    throw new HttpError(400, "Email and password are required.");
  }

  const user = await database.collection("users").findOne({ email });
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;
  if (!user || !passwordMatches) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const carts = database.collection("carts");
  const guestCartId = `guest:${request.sessionID}`;
  const guestCart = await carts.findOne({ _id: guestCartId });
  if (guestCart?.items?.length) {
    const userCartId = `user:${user._id.toString()}`;
    const userCart = await carts.findOne({ _id: userCartId });
    const items = await normalizeCartItems([
      ...(userCart?.items || []),
      ...guestCart.items
    ]);
    await carts.replaceOne(
      { _id: userCartId },
      { _id: userCartId, items, updatedAt: new Date() },
      { upsert: true }
    );
    await carts.deleteOne({ _id: guestCartId });
  }

  await new Promise((resolvePromise, rejectPromise) => {
    request.session.regenerate((error) =>
      error ? rejectPromise(error) : resolvePromise()
    );
  });
  request.session.userId = user._id.toString();
  response.json({ user: publicUser(user) });
}));

//sign up route
app.post("/api/auth/signup", loginLimiter, asyncRoute(async (request, response) => {
  const email = validateEmail(request.body?.email);
  const name = typeof request.body?.name === "string"
    ? request.body.name.trim()
    : "";
  const password = request.body?.password;

  if (!name || name.length > 100) {
    throw new HttpError(400, "Enter a name of 100 characters or fewer.");
  }
  if (typeof password !== "string" || password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72) {
    throw new HttpError(400, "Password must be at least 8 characters and no more than 72 bytes.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = {
    name,
    email,
    passwordHash,
    role: "user",
    createdAt: new Date()
  };

  try {
    const result = await database.collection("users").insertOne(user);
    response.status(201).json({ user: publicUser({ ...user, _id: result.insertedId }) });
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(409, "An account with that email already exists.");
    }
    throw error;
  }
}));

app.get("/api/auth/me", asyncRoute(async (request, response) => {
  if (!request.session.userId || !ObjectId.isValid(request.session.userId)) {
    return response.json({ user: null });
  }

  const user = await database.collection("users").findOne({
    _id: new ObjectId(request.session.userId)
  });
  if (!user) {
    request.session.destroy(() => {});
    return response.json({ user: null });
  }
  response.json({ user: publicUser(user) });
}));

app.post("/api/auth/logout", (request, response, next) => {
  request.session.destroy((error) => {
    if (error) return next(error);
    response.clearCookie("garden.sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction
    });
    response.status(204).end();
  });
});

app.patch("/api/auth/profile", requireAuth, asyncRoute(async (request, response) => {
  const updates = {};
  if (request.body?.name !== undefined) {
    const name = typeof request.body.name === "string" ? request.body.name.trim() : "";
    if (!name || name.length > 100) {
      throw new HttpError(400, "Name must be between 1 and 100 characters.");
    }
    updates.name = name;
  }
  if (request.body?.profilePicture !== undefined) {
    const picture = request.body.profilePicture;
    if (picture !== null && (
      typeof picture !== "string" ||
      !picture.startsWith("data:image/") ||
      picture.length > 1_500_000
    )) {
      throw new HttpError(400, "Choose an image smaller than 1 MB.");
    }
    updates.profilePicture = picture;
  }
  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, "No profile changes were provided.");
  }

  await database.collection("users").updateOne(
    { _id: request.user._id },
    { $set: updates }
  );
  response.json({ user: publicUser({ ...request.user, ...updates }) });
}));

app.get("/api/products", asyncRoute(async (request, response) => {
  const products = await database.collection("products")
    .find({})
    .sort({ name: 1 })
    .toArray();
  response.json({ products: products.map(serializeProduct) });
}));

app.post("/api/admin/products", requireAdmin, asyncRoute(async (request, response) => {
  const id = String(request.body?.id || "").trim();
  if (!id || id.length > 100) {
    throw new HttpError(400, "A valid product ID is required.");
  }

  const product = validateProduct(request.body);
  try {
    await database.collection("products").insertOne({
      _id: id,
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(409, "A product with that ID already exists.");
    }
    throw error;
  }
  response.status(201).json({ product: { id, ...product } });
}));

app.patch("/api/admin/products/:id", requireAdmin, asyncRoute(async (request, response) => {
  const productCollection = database.collection("products");
  const currentProduct = await productCollection.findOne({ _id: request.params.id });
  if (!currentProduct) {
    throw new HttpError(404, "Product not found.");
  }

  const updates = validateProduct({ ...currentProduct, ...request.body });
  await productCollection.updateOne(
    { _id: currentProduct._id },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  response.json({ product: { id: currentProduct._id, ...updates } });
}));

app.delete("/api/admin/products/:id", requireAdmin, asyncRoute(async (request, response) => {
  const productId = request.params.id;
  const activeOrder = await database.collection("orders").findOne({
    status: { $ne: "Cancelled" },
    "items.id": productId
  });
  if (activeOrder) {
    throw new HttpError(409, "This product is part of an active order and cannot be deleted.");
  }

  const result = await database.collection("products").deleteOne({ _id: productId });
  if (result.deletedCount === 0) {
    throw new HttpError(404, "Product not found.");
  }
  response.status(204).end();
}));

app.get("/api/admin/orders", requireAdmin, asyncRoute(async (request, response) => {
  const orders = await database.collection("orders")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  response.json({ orders: orders.map(serializeOrder) });
}));

app.get("/api/orders/mine", requireAuth, asyncRoute(async (request, response) => {
  const orders = await database.collection("orders")
    .find({ customerId: request.user._id.toString() })
    .sort({ createdAt: -1 })
    .toArray();
  response.json({ orders: orders.map(serializeOrder) });
}));

app.post("/api/orders", requireAuth, asyncRoute(async (request, response) => {
  const cartCollection = database.collection("carts");
  const cartId = `user:${request.user._id.toString()}`;
  const checkoutToken = randomBytes(16).toString("hex");
  const cart = await cartCollection.findOneAndUpdate(
    { _id: cartId, checkoutToken: { $exists: false } },
    { $set: { checkoutToken } },
    { returnDocument: "after" }
  );
  if (!cart) {
    throw new HttpError(409, "Your cart is empty or is already being checked out.");
  }

  const requestedItems = cart.items;
  if (!Array.isArray(requestedItems) || requestedItems.length === 0 ||
    requestedItems.length > 100) {
    await cartCollection.updateOne(
      { _id: cartId, checkoutToken },
      { $unset: { checkoutToken: "" } }
    );
    throw new HttpError(400, "Your cart must contain between 1 and 100 items.");
  }

  const quantities = new Map();
  for (const item of requestedItems) {
    const id = String(item?.id || "").trim();
    const quantity = Number(item?.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      await cartCollection.updateOne(
        { _id: cartId, checkoutToken },
        { $unset: { checkoutToken: "" } }
      );
      throw new HttpError(400, "Each order item needs a valid product ID and quantity.");
    }
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  const productCollection = database.collection("products");
  const reservedItems = [];
  const orderItems = [];
  let createdOrderId;

  try {
    for (const [id, quantity] of quantities) {
      const product = await productCollection.findOneAndUpdate(
        { _id: id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { returnDocument: "after" }
      );
      if (!product) {
        throw new HttpError(409, "One or more items no longer have enough stock.");
      }

      reservedItems.push({ id, quantity });
      orderItems.push({
        id,
        name: product.name,
        category: product.category,
        series: product.series,
        price: product.price,
        quantity,
        image: product.image
      });
    }

    const order = {
      customerId: request.user._id.toString(),
      customerName: request.user.name,
      email: request.user.email,
      items: orderItems,
      total: orderItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
      ),
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await database.collection("orders").insertOne(order);
    createdOrderId = result.insertedId;
    const clearedCart = await cartCollection.deleteOne({
      _id: cartId,
      checkoutToken
    });
    if (clearedCart.deletedCount !== 1) {
      throw new Error("Order was created but the checked-out cart could not be cleared.");
    }
    response.status(201).json({
      order: serializeOrder({ ...order, _id: result.insertedId })
    });
  } catch (error) {
    const rollbackErrors = [];
    if (createdOrderId) {
      try {
        await database.collection("orders").deleteOne({ _id: createdOrderId });
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    for (const item of reservedItems) {
      try {
        const result = await productCollection.updateOne(
          { _id: item.id },
          { $inc: { stock: item.quantity } }
        );
        if (result.matchedCount !== 1) {
          throw new Error(`Could not restore stock for ${item.id}.`);
        }
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (rollbackErrors.length) {
      console.error("Inventory rollback failed after order creation error.", rollbackErrors);
      throw new Error("Order failed and inventory could not be fully restored.");
    }
    await cartCollection.updateOne(
      { _id: cartId, checkoutToken },
      { $unset: { checkoutToken: "" } }
    );
    throw error;
  }
}));

app.patch("/api/admin/orders/:id/status", requireAdmin, asyncRoute(async (request, response) => {
  if (!ObjectId.isValid(request.params.id)) {
    throw new HttpError(400, "Invalid order ID.");
  }

  const nextStatus = request.body?.status;
  const orderCollection = database.collection("orders");
  const orderId = new ObjectId(request.params.id);
  const order = await orderCollection.findOne({ _id: orderId });
  if (!order) {
    throw new HttpError(404, "Order not found.");
  }

  const allowedNextStatuses = {
    Pending: ["Processing", "Shipped", "Completed", "Cancelled"],
    Processing: ["Shipped", "Completed", "Cancelled"],
    Shipped: ["Completed", "Cancelled"],
    Completed: ["Cancelled"],
    Cancelled: []
  };
  if (!allowedNextStatuses[order.status]?.includes(nextStatus)) {
    throw new HttpError(400, "That order status transition is not allowed.");
  }

  const updateResult = await orderCollection.updateOne(
    { _id: orderId, status: order.status },
    { $set: { status: nextStatus, updatedAt: new Date() } }
  );
  if (updateResult.modifiedCount !== 1) {
    throw new HttpError(409, "The order changed; refresh and try again.");
  }

  if (nextStatus === "Cancelled") {
    const restoredItems = [];
    try {
      for (const item of order.items || []) {
        const quantity = Number(item.quantity || 0);
        const result = await database.collection("products").updateOne(
          { _id: String(item.id) },
          { $inc: { stock: quantity } }
        );
        if (result.matchedCount !== 1) {
          throw new Error(`Could not restore stock for ${item.id}.`);
        }
        restoredItems.push({ id: String(item.id), quantity });
      }
    } catch (error) {
      const compensationErrors = [];
      for (const item of restoredItems.reverse()) {
        try {
          const result = await database.collection("products").updateOne(
            { _id: item.id },
            { $inc: { stock: -item.quantity } }
          );
          if (result.matchedCount !== 1) {
            throw new Error(`Could not reverse stock restoration for ${item.id}.`);
          }
        } catch (compensationError) {
          compensationErrors.push(compensationError);
        }
      }

      if (compensationErrors.length) {
        console.error("Order cancellation compensation failed.", {
          error,
          compensationErrors
        });
        throw new Error("Order cancellation failed; inventory recovery requires manual review.");
      }

      const statusReset = await orderCollection.updateOne(
        { _id: orderId, status: "Cancelled" },
        { $set: { status: order.status, updatedAt: new Date() } }
      );
      if (statusReset.modifiedCount !== 1) {
        throw new Error("Stock was restored, but the order status could not be reverted.");
      }
      throw error;
    }
  }

  const updatedOrder = await orderCollection.findOne({ _id: orderId });
  response.json({ order: serializeOrder(updatedOrder) });
}));

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  if (error instanceof SyntaxError && "body" in error) {
    return response.status(400).json({ error: "Request body must be valid JSON." });
  }
  if (error.status) {
    return response.status(error.status).json({ error: error.message });
  }
  console.error("Request failed.", error);
  response.status(500).json({ error: "The server could not complete the request." });
});

const buildDirectory = resolve(projectDirectory, "dist");
const indexPath = resolve(buildDirectory, "index.html");
app.use(express.static(buildDirectory));
app.use((request, response, next) => {
  if (request.method === "GET" && !request.path.startsWith("/api/")) {
    if (existsSync(indexPath)) return response.sendFile(indexPath);
  }
  next();
});

async function seedInitialProducts() {
  const migrations = database.collection("migrations");
  const migrationId = "initial-products-v1";
  if (await migrations.findOne({ _id: migrationId })) return;

  const products = database.collection("products");
  await products.bulkWrite(initialProducts.map((product) => ({
    updateOne: {
      filter: { _id: String(product.id) },
      update: {
        $setOnInsert: {
          _id: String(product.id),
          name: product.name,
          category: product.category,
          series: product.series,
          price: product.price,
          stock: product.stock,
          image: product.image,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  })));
  await migrations.insertOne({ _id: migrationId, appliedAt: new Date() });
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at most 72 bytes in .env.local.");
  }

  const users = database.collection("users");
  const existingAdmin = await users.findOne({ email });
  if (existingAdmin) {
    await users.updateOne(
      { _id: existingAdmin._id },
      { $set: { role: "admin" } }
    );
    return;
  }

  await users.insertOne({
    name: "Store Administrator",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    createdAt: new Date()
  });
}

async function startServer() {
  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  const connection = await connectToDatabase(mongoUri, databaseName);
  mongoClient = connection.client;
  database = connection.database;

  await database.collection("users").createIndex({ email: 1 }, { unique: true });
  await database.collection("orders").createIndex({ customerId: 1, createdAt: -1 });
  await seedInitialProducts();
  await seedAdmin();

  if (isProduction) app.set("trust proxy", 1);
  sessionMiddleware = session({
    name: "garden.sid",
    secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongoClient,
      dbName: database.databaseName,
      collectionName: "sessions"
    }),
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 8 * 60 * 60 * 1000
    }
  });

  app.listen(port, () => {
    console.log(`Garden of Daffodils API listening on port ${port}.`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start the API server.", error);
  process.exitCode = 1;
});

process.on("SIGINT", async () => {
  await mongoClient?.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoClient?.close();
  process.exit(0);
});
