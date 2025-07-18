const mongoose = require("mongoose"); // Make sure mongoose is imported
const genericDataSchema = require("../models/genericSchema"); // Import your generic schema

const moduleSchema = require("../models/moduleSchema");
const functionalAreaSchema = require("../models/functionalAreaSchema");
const documentSchema = require("../models/DocumentSchema");
function getDynamicCollectionModel(collectionName) {
  // Check if a model with this name already exists to prevent OverwriteModelError
  // This is important because you might have already defined moduleSchema, etc.
  if (mongoose.models[collectionName]) {
    return mongoose.model(collectionName);
  } else {
    // For arbitrary collections, use the generic schema.
    // Mongoose will create a collection with this name if it doesn't exist.
    return mongoose.model(collectionName, genericDataSchema, collectionName);
  }
}
module.exports = { getDynamicCollectionModel };
