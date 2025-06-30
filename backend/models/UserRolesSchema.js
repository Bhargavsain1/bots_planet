const mongoose = require("mongoose");
const userRolesBaseSchema = require("./userRolesBaseSchema");
const { getNextSequence } = require("../utils/sequenceGenerator");

// --- 1. Define the Host-Specific User Schema ---
// We clone the base schema to add specific hooks for the host user
const hostUserSchema = new mongoose.Schema();
hostUserSchema.add(userRolesBaseSchema.paths); // Copy all fields from base schema
hostUserSchema.methods = userRolesBaseSchema.methods;
hostUserSchema.statics = userRolesBaseSchema.statics;
hostUserSchema.query = userRolesBaseSchema.query;

// Add the userId auto-increment pre-save hook ONLY to this hostUserSchema
hostUserSchema.pre("save", async function (next) {
  // Check if it's a new document AND userId hasn't been set manually
  if (this.isNew && typeof this.userId === "undefined") {
    const nextSerial = await getNextSequence("UserRoles", 200001); // Use "UserRoles" as the counter identifier
    this.userId = nextSerial; // Assign the generated serial to the userId field
  }
  next();
});

// --- 2. Define the Model for the Host Database ---
// This model will use the default Mongoose connection and the `hostUserSchema`
const hostUser = mongoose.model("UserRoles", hostUserSchema);

// --- 3. Define the Function for Dynamic Tenant Models ---
// This function returns a model bound to a specific connection instance (tenant DB)
const getTenantDataModel = (connection) => {
  try {
    console.log("Attempting to get UserRoles model for tenant connection.");
    // Avoid re-registering the model on the same connection
    if (connection.models["UserRoles"]) {
      console.log(
        "Model 'UserRoles' already registered on this tenant connection. Returning existing model."
      );
      return connection.models["UserRoles"];
    }
    // IMPORTANT: Use the userRolesBaseSchema here, which *does not* have the auto-increment hook
    return connection.model("UserRoles", userRolesBaseSchema);
  } catch (err) {
    console.error("Error in getTenantDataModel:", err);
    throw err;
  }
};

module.exports = {
  hostUser: hostUser, // Export the host-specific model
  getDynamicUser: getTenantDataModel, // Export the function to get tenant-specific models
};
