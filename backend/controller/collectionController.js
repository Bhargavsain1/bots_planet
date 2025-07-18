const documentSchema = require("../models/DocumentSchema");
const mongoose = require("mongoose");

function transformString(str) {
  const words = str.trim().split(/\s+/);
  if (words.length === 0) {
    return "";
  }

  return words
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

function getDefaultValue(fieldType) {
  switch (fieldType.toLowerCase()) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "date":
      return new Date();
    case "array":
      return [];
    case "object":
      return {};
    default:
      throw new Error(`Unsupported field type: '${fieldType}'.`);
  }
}

const addNewFieldtoCollection = async (fieldDefinitions) => {
  console.log(
    "Received request to add fields to collection. Request body:",
    fieldDefinitions
  );

  const results = [];
  const errors = [];
  if (
    !fieldDefinitions ||
    !Array.isArray(fieldDefinitions) ||
    fieldDefinitions.length === 0
  ) {
    console.warn("Validation Error: Request body is not a non-empty array.");
  }

  for (const item of fieldDefinitions) {
    try {
      if (!item.fieldLabel || !item.fieldType || !item.documentName) {
        const errorMessage =
          "Missing required fields (fieldLabel, fieldType, or documentName) for one of the entries.";
        console.warn(
          `Validation Error for item: ${JSON.stringify(item)}. ${errorMessage}`
        );

        continue;
      }
      const document = await documentSchema.findOne({
        docName: item.documentName,
      });

      if (!document) {
        const errorMessage = `No collection found for document name: '${item.documentName}'. Please check the document name.`;
        console.warn(
          `Document Not Found Error for item: ${JSON.stringify(
            item
          )}. ${errorMessage}`
        );

        continue;
      }
      const db = mongoose.connection.db;
      const collection = db.collection(
        document.docName.replace(/ /g, "_").toLowerCase() + "s"
      );
      console.log("collection", collection);
      console.log(
        `Successfully identified collection: '${document.docName
          .replace(/ /g, "_")
          .toLowerCase()}' for document '${item.documentName}'.`
      );
      const defaultValue = getDefaultValue(item.fieldType);
      const fieldName = transformString(item.fieldLabel);
      console.log(
        `Preparing to add field: '${fieldName}' of type '${
          item.fieldType
        }' with default value: ${JSON.stringify(defaultValue)}.`
      );

      const updateResult = await collection.updateMany(
        { [fieldName]: { $exists: false } },
        { $set: { [fieldName]: defaultValue } }
      );

      console.log(
        `Field '${fieldName}' added/updated in ${
          updateResult.modifiedCount
        } documents in collection '${document.docName
          .replace(/ /g, "_")
          .toLowerCase()}'.`
      );
      results.push({
        item: item,
        status: "success",
        modifiedCount: updateResult.modifiedCount,
        message: `Field '${fieldName}' added/updated in ${updateResult.modifiedCount} documents.`,
      });
    } catch (error) {
      const errorMessage = `Failed to process field '${item.fieldLabel}' for document '${item.documentName}': ${error.message}`;
      console.error(
        `Processing Error for item: ${JSON.stringify(item)}. ${errorMessage}`,
        error
      );
    }
  }
};

module.exports = { addNewFieldtoCollection };
