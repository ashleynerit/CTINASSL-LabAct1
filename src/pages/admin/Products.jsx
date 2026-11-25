import { useState } from "react";
import {
  bookSeries,
  createProductId,
  getProductIdLabel,
  UNASSIGNED_SERIES
} from "../../Data/products";
import { apiRequest } from "../../utils/api";

const EMPTY_FORM = {
  name: "",
  category: "Books",
  series: "",
  price: "",
  stock: "",
  image: ""
};

const DEFAULT_IMAGE =
  "https://placehold.co/400x500/F5EED8/497510?text=AGNIFIED";
const MAX_IMAGE_SIZE = 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif"
]);

const formatCurrency = (amount) =>
  `₱${Number(amount || 0).toFixed(2)}`;

export default function AdminProducts({ products, setProducts }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImagePreview("");
  };

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!IMAGE_TYPES.has(file.type)) {
      setMessage("Choose a PNG, JPEG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMessage("Choose an image smaller than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setMessage("Unable to read the selected image.");
        return;
      }
      setForm((current) => ({ ...current, image: reader.result }));
      setImagePreview(reader.result);
      setMessage("");
    };
    reader.onerror = () => setMessage("Unable to read the selected image.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (saving) return;
    const name = form.name.trim();
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!name || !Number.isFinite(price) || price < 0 ||
      !Number.isInteger(stock) || stock < 0) {
      setMessage("Enter a product name, valid price, and whole-number stock count.");
      return;
    }

    if (form.category === "Books" && !form.series) {
      setMessage("Choose a series for this book.");
      return;
    }

    const productDetails = {
      name,
      category: form.category,
      price,
      stock,
      ...(editingId === null
        ? { image: form.image || DEFAULT_IMAGE }
        : form.image
          ? { image: form.image }
          : {}),
      ...(form.category === "Books" && {
        series: form.series || UNASSIGNED_SERIES
      })
    };

    setSaving(true);
    setMessage("");
    try {
      if (editingId !== null) {
        const result = await apiRequest(
          `/api/admin/products/${encodeURIComponent(editingId)}`,
          { method: "PATCH", body: productDetails }
        );
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingId ? result.product : product
          )
        );
        setMessage(`${name} updated.`);
      } else {
        const id = createProductId(form.category, form.series, products);
        const result = await apiRequest("/api/admin/products", {
          method: "POST",
          body: { id, ...productDetails }
        });
        setProducts((currentProducts) => [...currentProducts, result.product]);
        setMessage(`${name} added.`);
      }
      resetForm();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      series: product.series || "",
      price: String(product.price),
      stock: String(product.stock),
      image: ""
    });
    setImagePreview(product.image || "");
    setMessage("");
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}" from the catalog?`)) return;

    setMessage("");
    try {
      await apiRequest(
        `/api/admin/products/${encodeURIComponent(product.id)}`,
        { method: "DELETE" }
      );
      setProducts((currentProducts) =>
        currentProducts.filter((item) => item.id !== product.id)
      );
      if (editingId === product.id) resetForm();
      setMessage(`${product.name} deleted.`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <main className="section">
      <div className="admin-page-heading">
        <div>
          <p className="accent">CATALOG MANAGEMENT</p>
          <h1>Products</h1>
          <p>Add, edit, and remove items available in the store.</p>
        </div>
        <div className="admin-summary-chip">
          Products: <strong>{products.length}</strong>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>{editingId !== null ? "Edit product" : "Add a product"}</h2>
        </div>
        <form className="admin-product-form" onSubmit={saveProduct}>
          <label>
            Product name
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                  series: event.target.value === "Books" ? current.series : ""
                }))
              }
            >
              <option>Books</option>
              <option>Merchandise</option>
            </select>
          </label>
          {form.category === "Books" && (
            <label>
              Series
              <select
                value={form.series}
                onChange={(event) =>
                  setForm((current) => ({ ...current, series: event.target.value }))
                }
                required
              >
                <option value="">Choose a series</option>
                {bookSeries.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
                <option value={UNASSIGNED_SERIES}>{UNASSIGNED_SERIES}</option>
              </select>
            </label>
          )}
          <label>
            Price (₱)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Stock quantity
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) =>
                setForm((current) => ({ ...current, stock: event.target.value }))
              }
              required
            />
          </label>
          <label className="admin-product-image-field">
            Upload product image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={selectImage}
            />
            <span className="admin-image-hint">
              {form.image
                ? "New image selected."
                : editingId !== null
                  ? "Choose a file to replace the current image."
                  : "Optional. PNG, JPEG, WEBP, or GIF up to 1 MB."}
            </span>
          </label>
          {imagePreview && (
            <img
              className="admin-product-image-preview"
              src={imagePreview}
              alt="Product image preview"
            />
          )}
          <div className="admin-form-actions">
            <button className="primary-btn" type="submit" disabled={saving}>
              {saving
                ? "SAVING..."
                : editingId !== null
                  ? "SAVE CHANGES"
                  : "ADD PRODUCT"}
            </button>
            {editingId !== null && (
              <button
                className="admin-button admin-button-secondary"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && <p className="admin-feedback" role="status">{message}</p>}
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>All products</h2>
          <span>{products.length} item(s)</span>
        </div>
        {products.length === 0 ? (
          <p className="admin-empty">No products in the catalog yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Product</th>
                  <th scope="col">Category / Series</th>
                  <th scope="col">Price</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{getProductIdLabel(product)}</td>
                    <td>{product.name}</td>
                    <td>
                      {product.category}
                      {product.series ? ` · ${product.series}` : ""}
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stock}</td>
                    <td className="admin-row-actions">
                      <button
                        className="admin-button"
                        type="button"
                        onClick={() => editProduct(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-button admin-button-danger"
                        type="button"
                        onClick={() => deleteProduct(product)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
