// Make sure to import your Mongoose schemas
const moduleSchema = require("../models/moduleSchema"); // Adjust path as needed
const functionalAreaSchema = require("../models/functionalAreaSchema"); // Adjust path as needed
const documentSchema = require("../models/DocumentSchema"); // Adjust path as needed
const mongoose = require("mongoose");
const documentTemplate = require("../models/DocumentTemplateSchema");

// Helper function to get a dynamic Mongoose model for arbitrary collections
// This assumes you have a genericSchema defined for collections without specific joins/enrichment.
// If you don't have a generic schema, you might need to adjust this.
const genericDataSchema = require("../models/genericSchema"); // Path to your generic schema
const {
  getDynamicCollectionModel,
} = require("../utils/getDynamicCollectionModel");
function formateData(name) {
  let formatted = name.trim().toLowerCase().replace(/\s+/g, "_");
  if (!formatted.endsWith("s")) {
    formatted += "s";
  }

  return formatted;
}

function toCamelCaseWithoutSpaces(str) {
  // 1. Convert to lowercase and split by space
  const words = str.toLowerCase().split(" ");

  // 2. Capitalize the first letter of each word (except the first)
  const camelCaseWords = words.map((word, index) => {
    if (index === 0) {
      return word; // First word remains as is (lowercase)
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // 3. Join the words back together without spaces
  let result = camelCaseWords.join("");

  // 4. Remove 's' at the very end of the string if it exists
  if (result.endsWith("s")) {
    result = result.slice(0, -1); // Remove the last character
  }

  return result;
}

exports.getDataByCollection = async (req, res) => {
  try {
    const { docName } = req.params;
    console.log(`[INFO] Request received for doc Name: ${docName}`);

    const documentConfig = await documentSchema.findOne({
      docName,
    });

    if (!documentConfig) {
      return res.status(404).json({
        message: `Configuration not found for docName: ${docName}.`,
      });
    }

    const fieldTemplates = await documentTemplate
      .find({
        docId: documentConfig._id,
      })
      .lean();

    const PrimaryCollectionModel = getDynamicCollectionModel(
      formateData(documentConfig.docName)
    );

    const primaryRecords = await PrimaryCollectionModel.find({}).lean();
    const transformedRecords = await Promise.all(
      primaryRecords.map(async (record) => {
        // Create a mutable copy of the record to add/remove properties
        const modifiedRecord = { ...record };

        // Iterate through each field template to apply transformations
        for (const template of fieldTemplates) {
          const { fieldLabel, foreignDocument, displayList } = template;

          // Check if it's a foreign document lookup that needs processing
          // A lookup is needed if fieldLabel doesn't exist and foreignDocument/displayList are provided
          if (foreignDocument && displayList && !modifiedRecord[fieldLabel]) {
            console.log(
              `[DEBUG] Attempting lookup for fieldLabel: '${fieldLabel}' from foreignDocument: '${foreignDocument}'`
            );

            // Derive the expected foreign key field name (e.g., 'userId' from 'User')
            const foreignModelBaseName =
              toCamelCaseWithoutSpaces(foreignDocument);
            const foreignKeyFieldName = `${foreignModelBaseName}Id`; // Assumes foreign key naming convention

            const idToLookup = modifiedRecord[foreignKeyFieldName];
          
            if (idToLookup) {
              // Convert ObjectId to string if necessary, as .lean() might not do it for `_id` in some contexts,
              // and the lookup needs a string or a specific ObjectId instance depending on driver.
              // Mongoose's findOne with _id usually handles both string and ObjectId gracefully.
              const foreignId = idToLookup.toString();

              // Get the Mongoose model for the foreign collection
              const foreignCollectionModel = getDynamicCollectionModel(
                formateData(foreignDocument)
              );
              // console.log(
              //   `[DEBUG] Looking up ID '${foreignId}' in foreign collection: '${ForeignCollectionModel.modelName}' for display field: '${displayList}'`
              // );

              // Fetch the foreign record
              const foreignRecord = await foreignCollectionModel
                .findOne({
                  _id: foreignId,
                })
                .lean();
              if (foreignRecord) {
                modifiedRecord[fieldLabel] = foreignRecord[displayList];
                // console.log(
                //   `[DEBUG] Successfully mapped '${fieldLabel}' to '${modifiedRecord[fieldLabel]}'.`
                // );
              } else {
                modifiedRecord[fieldLabel] = null;
                // console.warn(
                //   `[WARN] Foreign record with ID '${foreignId}' not found in collection '${ForeignCollectionModel.modelName}'.`
                // );
              }

              delete modifiedRecord[foreignKeyFieldName];
            }
            //  else {
            //   console.log(
            //     `[DEBUG] No foreign key field '${foreignKeyFieldName}' found in record for lookup.`
            //   );
            // }
          }
        }
        return modifiedRecord;
      })
    );

    res.status(200).json(transformedRecords);
    // console.log(
    //   `[INFO] Successfully processed and sent ${transformedRecords.length} records.`
    // );
  } catch (error) {
    console.error(
      `[ERROR] Internal server error in getDataByCollection:`,
      error
    );
    // Send a 500 status with a more detailed error message in development, or generic in production
    res.status(500).json({
      message: "An internal server error occurred while fetching data.",
      error: process.env.NODE_ENV === "production" ? null : error.message, // Hide detailed error in production
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  }
};
exports.fetchDocRecords = async (req, res) => {
  try {
    const { docName } = req.params;
    let record = await documentSchema.findOne({
      docName,
    });

    const PrimaryCollectionModel = getDynamicCollectionModel(
      record.collectionName
    );
    const primaryRecords = await PrimaryCollectionModel.find({});
    if (!primaryRecords) {
      res.status(404).send("records not found");
    }
    res.status(200).send(primaryRecords);
  } catch (err) {
    console.log(err);
  }
};
