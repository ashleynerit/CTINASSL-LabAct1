import { MongoClient } from "mongodb";

let client;
let database;

export async function connectToDatabase(uri, databaseName) {
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(databaseName);
  return { client, database };
}

export function getDatabase() {
  if (!database) {
    throw new Error("MongoDB has not been connected.");
  }
  return database;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}
