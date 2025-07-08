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
// exports.getDataByCollection = async (req, res) => {
//   try {
//     console.log("data", req.params);
//     const { collectionName } = req.params;
//     let documents = await documentSchema.findOne({
//       collectionName: collectionName,
//     });
//     console.log("111");

//     if (!documents) {
//       return res.status(404).json({
//         message: "Document schema not found for the requested collection.",
//       });
//     }
//     console.log("122");

//     // 2. Fetch documentTemplate records associated with the documentSchema ID
//     const documentTemplates = await documentTemplate.find({
//       docId: documents._id,
//     });

//     console.log("133");

//     const dynamicModel = getDynamicCollectionModel(collectionName);
//     console.log("dynamicrecords", dynamicModel);

//     const fecthRecords = await dynamicModel.find({});
//     for (const record of fecthRecords) {
//       let changedFieldLabel;
//       for (const template of documentTemplates) {
//         const { fieldLabel, foreignDocument, displayList } = template;
//         console.log("hsdkskdks", fieldLabel, foreignDocument, displayList);
//         if (!record[fieldLabel]) {
//           console.log("dosenot exist fields", fieldLabel, foreignDocument);
//           let camelCaseWord = toCamelCaseWithoutSpaces(foreignDocument);
//           changedFieldLabel = `${camelCaseWord}Id`;
//           console.log("changedFieldLabel", changedFieldLabel);
//           let idField = record[changedFieldLabel];
//           console.log("idField", record, idField, "----", foreignDocument);
//           if (idField) {
//             let foreignDocumentValue = foreignDocument
//               .replace(/\s/g, "")
//               .toLowerCase();
//             console.log("forigndocument", foreignDocumentValue);
//             const dynamicModel =
//               getDynamicCollectionModel(foreignDocumentValue);
//             console.log("dynamicrecords", dynamicModel, displayList);

//             const fecthedRecord = await dynamicModel.findOne({
//               _id: idField,
//             });
//             let displyItem = fecthedRecord[displayList];
//             record[fieldLabel] = displyItem;

//             console.log(
//               "displayItem",
//               fieldLabel,
//               fecthedRecord,
//               displyItem,
//               "---",
//               record,
//               record[fieldLabel]
//             );
//             delete record[changedFieldLabel];
//             console.log("records", record);
//           }
//         }
//       }
//     }
//   } catch (err) {
//     console.log("Internal server error", err);
//   }
// };

// exports.getDataByCollection = async (req, res) => {
//   try {
//     const { collectionName } = req.params; // Get collectionName from req.query
//     console.log("collectionName in fetch", collectionName);
//     if (!collectionName) {
//       return res
//         .status(400)
//         .send(
//           "Collection name is required in query parameters (e.g., ?collectionName=modules)."
//         );
//     }

//     switch (collectionName) {
//       case "functionalAreas":
//         try {
//           const functionAreaDataArray = await functionalAreaSchema.find({});

//           const moduleIds = [
//             ...new Set(
//               functionAreaDataArray.map((item) => item.moduleId).filter(Boolean)
//             ),
//           ];

//           let modulesMap = new Map();

//           if (moduleIds.length > 0) {
//             const modules = await moduleSchema.find({
//               _id: { $in: moduleIds },
//             });
//             modules.forEach((module) => {
//               modulesMap.set(module._id.toString(), module.moduleName);
//             });
//           }

//           const enrichedFunctionAreas = functionAreaDataArray.map((item) => {
//             const itemObject = item.toObject();
//             if (
//               itemObject.moduleId &&
//               modulesMap.has(itemObject.moduleId.toString())
//             ) {
//               itemObject["Module Name"] = modulesMap.get(
//                 itemObject.moduleId.toString()
//               );
//             } else {
//               itemObject.moduleName = null;
//             }
//             return itemObject;
//           });

//           res.send(enrichedFunctionAreas);
//         } catch (error) {
//           console.error(
//             "Error in getAllFunctionAreas (within getDataByCollection):",
//             error
//           );
//           res.status(500).send({
//             message: "Error fetching functional areas and module names",
//             error: error.message,
//           });
//         }
//         break;

//       case "modules":
//         try {
//           const modules = await moduleSchema.find({});
//           if (!modules.length) {
//             return res.status(200).send("There are no records in modules"); // Use return to prevent further execution
//           }
//           res.status(200).send(modules);
//         } catch (err) {
//           console.error(
//             "Error in getModulesDetails (within getDataByCollection):",
//             err
//           );
//           res.status(500).send("Internal server error while fetching modules");
//         }
//         break;

//       case "documents":
//         try {
//           const documentDataArray = await documentSchema.find({});
//           const moduleIds = [
//             ...new Set(
//               documentDataArray.map((item) => item.moduleId).filter(Boolean)
//             ),
//           ];
//           const faIds = [
//             ...new Set(
//               documentDataArray.map((item) => item.faId).filter(Boolean)
//             ),
//           ];
//           let modulesMap = new Map();
//           if (moduleIds.length > 0) {
//             const modules = await moduleSchema.find({
//               _id: { $in: moduleIds },
//             });
//             modules.forEach((module) => {
//               modulesMap.set(module._id.toString(), module.moduleName);
//             });
//           }

//           let functionalAreasMap = new Map();
//           if (faIds.length > 0) {
//             const functionalAreas = await functionalAreaSchema.find({
//               _id: { $in: faIds },
//             });
//             functionalAreas.forEach((fa) => {
//               functionalAreasMap.set(fa._id.toString(), fa.faName);
//             });
//           }

//           const enrichedDocumentData = documentDataArray.map((item) => {
//             const itemObject = item.toObject();

//             if (
//               itemObject.moduleId &&
//               modulesMap.has(itemObject.moduleId.toString())
//             ) {
//               itemObject["Module Name"] = modulesMap.get(
//                 itemObject.moduleId.toString()
//               );
//             } else {
//               itemObject["Module Name"] = null;
//             }

//             if (
//               itemObject.faId &&
//               functionalAreasMap.has(itemObject.faId.toString())
//             ) {
//               itemObject["Functional Area"] = functionalAreasMap.get(
//                 itemObject.faId.toString()
//               );
//             } else {
//               itemObject["Functional Area"] = null;
//             }
//             return itemObject;
//           });

//           res.send(enrichedDocumentData);
//         } catch (error) {
//           console.error(
//             "Error in getDocumentList (within getDataByCollection):",
//             error
//           );
//           res.status(500).send({
//             message: "Error fetching documents and related data",
//             error: error.message,
//           });
//         }
//         break;

//       // --- Default case for any other collection name ---
//       // If you have other simple collections that don't require complex joins/enrichment,
//       // you can fetch them generically here.
//       default:
//         try {
//           const DynamicModel = getDynamicCollectionModel(collectionName);
//           const data = await DynamicModel.find({});
//           if (!data.length) {
//             return res
//               .status(200)
//               .send(`No records found in '${collectionName}' collection`);
//           }
//           res.status(200).send(data);
//         } catch (error) {
//           console.error(
//             `Error fetching from dynamic collection '${collectionName}':`,
//             error
//           );
//           res.status(500).send({
//             message: `Error fetching data from '${collectionName}' collection`,
//             error: error.message,
//           });
//         }
//         break;
//     }
//   } catch (error) {
//     console.error("Unexpected error in getDataByCollection:", error);
//     res.status(500).send("Internal server error");
//   }
// };

// Make sure to import your toCamelCaseWithoutSpaces function
//main
// exports.getDataByCollection = async (req, res) => {
//   try {
//     console.log("data", req.params);
//     const { collectionName } = req.params;

//     let documents = await documentSchema.findOne({
//       collectionName: collectionName,
//     });
//     console.log("111");

//     if (!documents) {
//       return res.status(404).json({
//         message: "Document schema not found for the requested collection.",
//       });
//     }
//     console.log("122");

//     // 2. Fetch documentTemplate records associated with the documentSchema ID
//     const documentTemplates = await documentTemplate
//       .find({
//         docId: documents._id,
//       })
//       .lean(); // Keep .lean() here, it's good for templates
//     console.log("133");

//     const DynamicModel = getDynamicCollectionModel(collectionName); // Renamed to PascalCase for convention
//     console.log("dynamicrecords Model:", DynamicModel.modelName); // Log model name for clarity

//     // *** IMPORTANT CHANGE HERE: Use .lean() to get plain JavaScript objects ***
//     const fetchedRecords = await DynamicModel.find({}).lean();
//     console.log("Fetched records count:", fetchedRecords.length);

//     // Use Promise.all to handle asynchronous lookups efficiently
//     const transformedRecords = await Promise.all(
//       fetchedRecords.map(async (record) => {
//         // Create a mutable copy of the record for modifications
//         const modifiedRecord = { ...record };

//         for (const template of documentTemplates) {
//           const { fieldLabel, foreignDocument, displayList } = template;
//           console.log(
//             "Processing template:",
//             fieldLabel,
//             foreignDocument,
//             displayList
//           );

//           // Check if the fieldLabel already exists in the record
//           // or if it's supposed to be replaced by a foreign document lookup
//           if (!modifiedRecord[fieldLabel] && foreignDocument && displayList) {
//             console.log(
//               "Field not found or needs lookup:",
//               fieldLabel,
//               foreignDocument
//             );

//             let camelCaseWord = toCamelCaseWithoutSpaces(foreignDocument);
//             let changedFieldLabel = `${camelCaseWord}Id`; // Assumes foreign key format is camelCaseId

//             console.log("Looking for ID field:", changedFieldLabel);
//             let idFieldValue = modifiedRecord[changedFieldLabel];

//             if (idFieldValue) {
//               console.log("Found ID field value:", idFieldValue);

//               let foreignCollectionName =
//                 toCamelCaseWithoutSpaces(foreignDocument);
//               // Ensure foreignCollectionName doesn't end with 's' if the function does that
//               // If your toCamelCaseWithoutSpaces already handles plural 's' removal, this is fine.
//               // If not, you might need to add it:
//               // if (foreignCollectionName.endsWith('s')) {
//               //   foreignCollectionName = foreignCollectionName.slice(0, -1);
//               // }

//               console.log("Foreign collection name:", foreignCollectionName);
//               const ForeignDynamicModel = getDynamicCollectionModel(
//                 foreignCollectionName
//               );
//               console.log(
//                 "Foreign dynamic model:",
//                 ForeignDynamicModel.modelName
//               );

//               const fetchedForeignRecord = await ForeignDynamicModel.findOne({
//                 _id: idFieldValue,
//               }).lean(); // Use .lean() for foreign records too

//               if (fetchedForeignRecord) {
//                 console.log("Fetched foreign record:", fetchedForeignRecord);
//                 // Assign the displayList value to the original fieldLabel
//                 modifiedRecord[fieldLabel] = fetchedForeignRecord[displayList];
//                 console.log(
//                   `Set ${fieldLabel} to:`,
//                   modifiedRecord[fieldLabel]
//                 );

//                 // Delete the original foreign key field
//                 delete modifiedRecord[changedFieldLabel];
//                 console.log(`Deleted ${changedFieldLabel}`);
//               } else {
//                 console.log(
//                   `Foreign record not found for ID: ${idFieldValue} in collection ${foreignCollectionName}`
//                 );
//                 // Optionally, set fieldLabel to null or a default value if foreign record not found
//                 modifiedRecord[fieldLabel] = null;
//               }
//             } else {
//               console.log(`ID field ${changedFieldLabel} not found in record.`);
//             }
//           }
//         }
//         return modifiedRecord; // Return the transformed record
//       })
//     );

//     // Send the transformed records in the response
//     res.status(200).json(transformedRecords);
//   } catch (err) {
//     console.error("Internal server error:", err); // Use console.error for errors
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// };
// Assuming these are imported from other files
// const documentSchema = require('../models/documentSchema'); // Adjust path as needed
// const documentTemplate = require('../models/documentTemplate'); // Adjust path as needed
// const getDynamicCollectionModel = require('../utils/getDynamicCollectionModel'); // Adjust path as needed
// const toCamelCaseWithoutSpaces = require('../utils/toCamelCaseWithoutSpaces'); // Adjust path as needed

exports.getDataByCollection = async (req, res) => {
  try {
    const { collectionName } = req.params;
    console.log(`[INFO] Request received for collection: ${collectionName}`);

    // 1. Fetch the document schema configuration for the requested collection
    const documentConfig = await documentSchema.findOne({
      collectionName: collectionName,
    });

    if (!documentConfig) {
      console.warn(
        `[WARN] Document schema not found for collection: ${collectionName}`
      );
      return res.status(404).json({
        message: `Configuration not found for collection: ${collectionName}.`,
      });
    }

    // 2. Fetch documentTemplate records associated with the documentConfig ID
    // These templates define how fields should be transformed/looked up
    const fieldTemplates = await documentTemplate
      .find({
        docId: documentConfig._id,
      })
      .lean(); // Use .lean() for performance when not modifying Mongoose documents

    // console.log(
    //   `[INFO] Found ${fieldTemplates.length} field templates for ${collectionName}.`
    // );

    // 3. Get the Mongoose model for the primary collection
    const PrimaryCollectionModel = getDynamicCollectionModel(collectionName);
    // console.log(
    //   `[INFO] Fetched model for primary collection: ${PrimaryCollectionModel.modelName}`
    // );

    // 4. Fetch all records from the primary collection
    // Use .lean() to get plain JavaScript objects for easier manipulation
    const primaryRecords = await PrimaryCollectionModel.find({}).lean();
    // console.log(
    //   `[INFO] Fetched ${primaryRecords.length} records from ${collectionName}.`
    // );

    // 5. Transform each primary record based on the field templates
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
              const ForeignCollectionModel =
                getDynamicCollectionModel(foreignModelBaseName);
              console.log(
                `[DEBUG] Looking up ID '${foreignId}' in foreign collection: '${ForeignCollectionModel.modelName}' for display field: '${displayList}'`
              );

              // Fetch the foreign record
              const foreignRecord = await ForeignCollectionModel.findOne({
                _id: foreignId,
              }).lean();

              if (foreignRecord) {
                modifiedRecord[fieldLabel] = foreignRecord[displayList];
                console.log(
                  `[DEBUG] Successfully mapped '${fieldLabel}' to '${modifiedRecord[fieldLabel]}'.`
                );
              } else {
                modifiedRecord[fieldLabel] = null;
                console.warn(
                  `[WARN] Foreign record with ID '${foreignId}' not found in collection '${ForeignCollectionModel.modelName}'.`
                );
              }

              delete modifiedRecord[foreignKeyFieldName];
            } else {
              console.log(
                `[DEBUG] No foreign key field '${foreignKeyFieldName}' found in record for lookup.`
              );
            }
          }
        }
        return modifiedRecord;
      })
    );

    res.status(200).json(transformedRecords);
    console.log(
      `[INFO] Successfully processed and sent ${transformedRecords.length} records.`
    );
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
