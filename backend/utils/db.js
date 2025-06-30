const mongoose = require("mongoose");

// --- Configuration for your Main Database ---
const MAIN_DB_URI = `mongodb://localhost:27017/HOST`; // Your main DB name
const MAIN_COLLECTION_NAME = "main_collection"; // Collection name for your main DB

// --- Configuration for your Tenant Databases ---
const TENANT_DB_HOST = "localhost"; // MongoDB host for tenant DBs
const TENANT_DB_PORT = 27017; // MongoDB port for tenant DBs
const TENANT_COLLECTION_NAME = "tenant_data_collection"; // Constant collection name within each tenant DB

// Map to store active tenant connections for reuse
const tenantConnections = new Map(); // Key: tenantId, Value: mongoose.Connection instance

// 1. Connect to the Main Database (Default Mongoose Connection)
const connectMainDB = async () => {
  try {
    await mongoose.connect(MAIN_DB_URI);
    console.log("Main MongoDB connected successfully!");

    // Optional: Listen for main connection events
    mongoose.connection.on("error", (err) => {
      console.error("Main DB Connection Error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("Main DB Connection Disconnected.");
      // Implement re-connection logic if needed
    });
    mongoose.connection.on("reconnected", () => {
      console.log("Main DB Connection Reconnected.");
    });
  } catch (err) {
    console.error("Failed to connect to Main MongoDB:", err.message);
    process.exit(1); // Exit process on main DB connection failure
  }
};

// 2. Get or Create a Tenant Database Connection
const getTenantConnection = async (tenantId) => {
  const tenantDbName = "T" + `${tenantId}`; // Example naming: tenant_user123_db
  const tenantUri = `mongodb://${TENANT_DB_HOST}:${TENANT_DB_PORT}/${tenantDbName}`;

  // Check if connection already exists and is healthy
  if (tenantConnections.has(tenantId)) {
    const existingConnection = tenantConnections.get(tenantId);
    // Check readyState: 1 = connected, 2 = connecting, 0 = disconnected
    if (
      existingConnection.readyState === 1 ||
      existingConnection.readyState === 2
    ) {
      console.log(`Reusing existing connection for tenant: ${tenantId}`);
      return existingConnection;
    } else {
      console.warn(
        `Existing connection for tenant ${tenantId} is not ready (${existingConnection.readyState}), attempting to re-establish.`
      );
      // Remove the stale connection
      tenantConnections.delete(tenantId);
    }
  }

  try {
    console.log(
      `Establishing new connection for tenant: ${tenantId} to ${tenantDbName}`
    );
    const newConnection = mongoose.createConnection(tenantUri); // AWAIT HERE!
    console.log("newwconnection in db level");
    // Optional: Listen for individual tenant connection events
    newConnection.on("connected", () =>
      console.log(`Tenant ${tenantId} connected to ${tenantDbName} db`)
    );
    newConnection.on("error", (err) =>
      console.error(`Tenant ${tenantId} connection error:`, err)
    );
    newConnection.on("disconnected", () =>
      console.warn(`Tenant ${tenantId} connection disconnected.`)
    );
    newConnection.on("reconnected", () =>
      console.log(`Tenant ${tenantId} connection reconnected.`)
    );

    tenantConnections.set(tenantId, newConnection);
    console.log(`Connection for tenant ${tenantId} established and stored.`);
    return newConnection;
  } catch (error) {
    console.error(
      `Failed to establish connection for tenant ${tenantId}:`,
      error.message
    );
    throw error; // Propagate the error
  }
};

// 3. Close ALL Database Connections (important for graceful shutdown)
const closeAllDBConnections = async () => {
  console.log("Attempting to close all database connections...");
  try {
    // Close the main connection
    if (
      mongoose.connection.readyState === 1 ||
      mongoose.connection.readyState === 2
    ) {
      await mongoose.disconnect();
      console.log("Main MongoDB connection disconnected.");
    }

    // Close all tenant connections
    for (const [tenantId, conn] of tenantConnections.entries()) {
      if (conn.readyState === 1 || conn.readyState === 2) {
        await conn.close();
        console.log(`Tenant ${tenantId} connection disconnected.`);
      }
      tenantConnections.delete(tenantId); // Remove from map
    }
    console.log("All database connections closed.");
  } catch (err) {
    console.error("Error closing database connections:", err.message);
    process.exit(1);
  }
};

module.exports = {
  connectMainDB,
  getTenantConnection,
  closeAllDBConnections,
  MAIN_COLLECTION_NAME,
  TENANT_COLLECTION_NAME,
};
