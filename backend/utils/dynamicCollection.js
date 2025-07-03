const mongoose = require("mongoose");

function getDynamicCollectionModel(collectionName) {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  const dynamicSchema = new mongoose.Schema(
    {},
    {
      strict: false,
      timestamps: true,
      collection: collectionName,
    }
  );

  return mongoose.model(collectionName, dynamicSchema);
}
module.exports = { getDynamicCollectionModel };
