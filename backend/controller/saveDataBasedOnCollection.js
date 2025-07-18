const moduleSchema = require("../models/moduleSchema");
const functionalAreaSchema = require("../models/functionalAreaSchema");
const Document = require("../models/DocumentSchema");
const DocumentTemplate = require("../models/DocumentTemplateSchema");
const mongoose = require("mongoose");

const genericDataSchema = require("../models/genericSchema");
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
exports.saveDataBasedOnCollection = async (req, res) => {
  try {
    const { docName, requestBody } = req.body;
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

        if (
          requestData[fieldLabel] !== undefined &&
          foreignDocument &&
          displayList
        ) {
          const testValue = requestData[fieldLabel]; // The value from the current requestData object
          let foreignDocumentValue = foreignDocument
            .replace(/ /g, "_")
            .toLowerCase();
          const DynamicModel = getDynamicCollectionModel(foreignDocumentValue);

          const fecthRecord = await DynamicModel.findOne({
            [displayList]: testValue,
          });
          let camelCaseWord = toCamelCaseWithoutSpaces(foreignDocument);
          changedFieldLabel = `${camelCaseWord}Id`;
          requestData[changedFieldLabel] = fecthRecord._id.toString();
          delete requestData[fieldLabel];
        }
      }
      dynamicCollection = getDynamicCollectionModel(formateData(docName));
      let response = await dynamicCollection.insertMany(requestData);
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
