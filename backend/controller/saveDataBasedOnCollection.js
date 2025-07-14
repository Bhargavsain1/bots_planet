const moduleSchema = require("../models/moduleSchema");
const functionalAreaSchema = require("../models/functionalAreaSchema");
const Document = require("../models/DocumentSchema");
const DocumentTemplate = require("../models/DocumentTemplateSchema");
const mongoose = require("mongoose");

const genericDataSchema = require("../models/genericSchema");
const {
  getDynamicCollectionModel,
} = require("../utils/getDynamicCollectionModel");

// exports.saveDataBasedOnCollection = async (req, res) => {
//   try {
//     const { collectionName, data } = req.body;
//     console.log("collectionName, data", collectionName, data);

//     if (!collectionName) {
//       return res.status(400).send("Collection name is required in req.body.");
//     }
//     if (!data) {
//       return res.status(400).send("Data array is required in req.body.");
//     }
//     if (!Array.isArray(data) || data.length === 0) {
//       return res
//         .status(400)
//         .send("Request body 'data' must be a non-empty array.");
//     }

//     switch (collectionName) {
//       case "modules":
//         try {
//           const createdNewModule = await moduleSchema.insertMany(data);
//           if (!createdNewModule) {
//             return res
//               .status(400)
//               .send("Error while inserting the module records");
//           }
//           res.status(200).send(createdNewModule);
//         } catch (err) {
//           console.error("Error saving module:", err);
//           res.status(500).send("Internal server error while saving module");
//         }
//         break;

//       case "functionalAreas":
//         try {
//           const functionAreaDataArray = data;

//           const processedFunctionAreas = [];
//           for (const item of functionAreaDataArray) {
//             const moduleNameFromUI = item["Module Name"];
//             if (!moduleNameFromUI) {
//               return res
//                 .status(400)
//                 .send(
//                   `Missing 'Module Name' for one or more functional areas.`
//                 );
//             }

//             const moduleRecord = await moduleSchema.findOne({
//               moduleName: moduleNameFromUI,
//             });
//             if (!moduleRecord) {
//               return res
//                 .status(404)
//                 .send(
//                   `Module not found for name: '${moduleNameFromUI}'. Cannot save functional area.`
//                 );
//             }
//             const newFunctionalArea = { ...item, moduleId: moduleRecord._id };
//             delete newFunctionalArea["Module Name"];
//             processedFunctionAreas.push(newFunctionalArea);
//           }

//           const createdNewFunctionArea = await functionalAreaSchema.insertMany(
//             processedFunctionAreas
//           );
//           if (!createdNewFunctionArea) {
//             return res
//               .status(400)
//               .send("Error while creating the functionArea records");
//           }
//           res.status(200).send(createdNewFunctionArea);
//         } catch (err) {
//           console.error("Error saving functional area:", err);
//           res
//             .status(500)
//             .send("Internal server error while saving functional area");
//         }
//         break;

//       case "documents":
//         try {
//           let documentdataArray = data;

//           const processedDocuments = [];
//           for (const item of documentdataArray) {
//             const moduleNameFromUI = item["Module Name"];
//             const faNameFromUI = item["Functional Area"];
//             if (!moduleNameFromUI || !faNameFromUI) {
//               return res
//                 .status(400)
//                 .send(
//                   `Missing 'Module Name' or 'Functional Area' for one or more documents.`
//                 );
//             }

//             const moduleRecord = await moduleSchema.findOne({
//               moduleName: moduleNameFromUI,
//             });
//             const functionAreaRecord = await functionalAreaSchema.findOne({
//               faName: faNameFromUI,
//             });

//             if (!moduleRecord || !functionAreaRecord) {
//               return res.status(404).send("Module /Functional Area not found ");
//             }
//             const newDocument = {
//               ...item,
//               moduleId: moduleRecord._id,
//               faId: functionAreaRecord._id,
//             };

//             delete newDocument["Module Name"];
//             delete newDocument["Functional Area"];

//             // If the item.collectionName within a document is meant to override
//             // the *main* collectionName for that specific document, you might do this:
//             // let dynamicDocCollection = item.collectionName ? getDynamicCollectionModel(item.collectionName) : documentSchema;
//             // await dynamicDocCollection.insertOne(newDocument); // If you're saving one by one
//             let collection = await getDynamicCollectionModel(
//               item.collectionName
//             );
//             console.log("collections", collection);

//             processedDocuments.push(newDocument);
//           }

//           // Assuming 'documentSchema' is the model for all documents,
//           // regardless of what item.collectionName might have suggested internally.
//           const createdDocument = await documentSchema.insertMany(
//             processedDocuments
//           );
//           if (!createdDocument) {
//             return res
//               .status(400)
//               .send("There is an error while creating the documents");
//           }
//           res.status(200).send(createdDocument);
//         } catch (err) {
//           console.error("Error saving document:", err);
//           res.status(500).send("Internal server error while saving document");
//         }
//         break;

//       // --- DEFAULT CASE: Handle any other collection name dynamically ---
//       default:
//         try {
//           const DynamicModel = getDynamicCollectionModel(collectionName);
//           const createdRecords = await DynamicModel.insertMany(data);
//           console.log("createdRecord", createdRecords);
//           if (!createdRecords) {
//             return res
//               .status(400)
//               .send(
//                 `Error while inserting records into '${collectionName}' collection`
//               );
//           }
//           res.status(200).send(createdRecords);
//         } catch (err) {
//           console.error(
//             `Error saving to dynamic collection '${collectionName}':`,
//             err
//           );
//           res
//             .status(500)
//             .send(`Internal server error while saving to '${collectionName}'`);
//         }
//         break;
//     }
//   } catch (error) {
//     console.error("Unexpected error in saveDataBasedOnCollection:", error);
//     res.status(500).send("Internal server error");
//   }
// };

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
exports.saveDataBasedOnCollection = async (req, res) => {
  try {
    const { docName, requestBody } = req.body;
    console.log("collectionname", req.body);
    // 1. Find the document in documentSchema
    let document = await Document.findOne({
      docName,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document schema not found for the requested collection.",
      });
    }

    // 2. Fetch documentTemplate records associated with the documentSchema ID
    const documentTemplates = await DocumentTemplate.find({
      docId: document._id,
    }).lean();

    // Stores results for ALL input objects
    let dynamicCollection;
    for (const [index, requestData] of requestBody.entries()) {
      for (const template of documentTemplates) {
        const { fieldLabel, foreignDocument, displayList } = template;
        console.log(
          "hsdkskdks",
          fieldLabel,
          foreignDocument,
          displayList,
          requestData[fieldLabel] !== undefined
        );
        if (
          requestData[fieldLabel] !== undefined &&
          foreignDocument &&
          displayList
        ) {
          console.log("1111");
          const testValue = requestData[fieldLabel]; // The value from the current requestData object
          let foreignDocumentValue = foreignDocument
            .replace(/\s/g, "")
            .toLowerCase();
          const DynamicModel = getDynamicCollectionModel(foreignDocumentValue);
          console.log("dynamicrecords", DynamicModel, displayList, testValue);

          const fecthRecord = await DynamicModel.findOne({
            [displayList]: testValue,
          });
          console.log("fecthRecord", fecthRecord);
          let camelCaseWord = toCamelCaseWithoutSpaces(foreignDocument);
          changedFieldLabel = `${camelCaseWord}Id`;
          requestData[changedFieldLabel] = fecthRecord._id.toString();
          console.log("requestData", requestData);
          delete requestData[fieldLabel];
        }
      }
      // if (requestData.collectionName) {
      //   getDynamicCollectionModel(requestData.collectionName);
      // }
      console.log("rwqwqqw", requestData);
      dynamicCollection = getDynamicCollectionModel(document.collectionName);
      let response = await dynamicCollection.insertMany(requestData);
      console.log("response", response);
      res.status(200).send(response);
    }
  } catch (error) {
    console.error("Error in dynamic query endpoint:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
      error: error.message,
    });
  }
};
