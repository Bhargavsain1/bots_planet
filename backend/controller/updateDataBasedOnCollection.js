const mongoose = require("mongoose");
const Document = require("../models/DocumentSchema");
const DocumentTemplate = require("../models/DocumentTemplateSchema");
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
exports.updateDataBasedOnCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, docName } = req.body;
    console.log("req.body", req.body, id);

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
    for (const template of documentTemplates) {
      const { fieldLabel, foreignDocument, displayList } = template;
      console.log("hsdkskdks", fieldLabel, foreignDocument, displayList);
      if (data[fieldLabel] !== undefined && foreignDocument && displayList) {
        const testValue = data[fieldLabel]; // The value from the current requestData object
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
        data[changedFieldLabel] = fecthRecord._id.toString();
        console.log("requestData", data);
        delete data[fieldLabel];
      }
    }
    dynamicCollection = getDynamicCollectionModel(document.collectionName);
    let updatedRecord = await dynamicCollection.findByIdAndUpdate(
      { _id: id },
      {
        $set: data,
      },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!updatedRecord) {
      res.status(404).send("Record not found");
    }
    res.status(200).json({
      message: "Record updated successfully!",
      module: updatedRecord,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Internal server Error");
  }
};
