const mongoose = require("mongoose");

const documentTemplate = require("../models/DocumentTemplateSchema");
const documentSchema = require("../models/DocumentSchema");

const Modules = require("../models/moduleSchema");
let { addNewFieldtoCollection } = require("../controller/collectionController");

function removeTrailingS(str) {
  if (str.endsWith("s")) {
    return str.slice(0, -1); // Remove the last character if it's 's'
  }
  return str; // Return the original string if it doesn't end with 's'
}
exports.saveDocumentTemplateList = async (req, res) => {
  try {
    const documentTemplateArray = req.body;
    // console.log("documentTemplate", documentTemplateArray);
    if (
      !Array.isArray(documentTemplateArray) ||
      documentTemplateArray.length === 0
    ) {
      return res.status(400).json({
        message:
          "Request body must be a non-empty array of document template objects.",
      });
    }
    let document = await documentSchema.findOne({
      docName: documentTemplateArray[0].documentName,
    });
    if (!document) {
      return res.status(404).json({
        message: "Document is not found .",
      });
    }
    for (const item of documentTemplateArray) {
      item.docId = document._id;
      if (!item.documentName || !item.fieldLabel || !item.fieldType) {
        return res.status(400).json({
          message:
            "Missing required fields (documetName, fieldLabel, fieldType) in one or more template entries.",
          missingItem: item,
        });
      }
    }
    const insertedDocuments = await documentTemplate.insertMany(
      documentTemplateArray
    );

    let documentId = await addNewFieldtoCollection(documentTemplateArray);

    const responseData = insertedDocuments.map((doc) => {
      const { created_at, updated_at, __v, ...rest } = doc.toObject();
      return rest;
    });

    res.status(201).json({
      message: "Document templates saved successfully!",
      data: responseData,
    });
  } catch (error) {
    console.error("Error saving document templates:", error);

    res.status(500).json({
      message: "Failed to save document templates",
      error: error.message,
    });
  }
};

exports.getEachDocumentData = async (req, res) => {
  try {
    const requestedDocName = req.params.docName;

    let document = await documentSchema.findOne({
      docName: requestedDocName,
    });
    if (!document) {
      res.status(404).send(`There is no document with ${requestedDocName} `);
    }
    const documents = await documentTemplate
      .find({ docId: document._id })
      .lean();

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      documentName: req.params.docName,
      id: doc._id.toString(),
    }));

    const finalDocuments = formattedDocuments.map(
      ({ _id, __v, docName, ...rest }) => rest
    );

    res.status(200).json(finalDocuments);
  } catch (err) {
    console.error("Error fetching document data:", err);
    res.status(500).json({ message: "Failed to fetch document data." });
  }
};

exports.getDocumentByCollection = async (req, res) => {
  try {
    const requestedDocName = req.params.docName;

    let document = await documentSchema.findOne({
      docName: requestedDocName,
    });
    // console.log("document", document);
    if (!document) {
      return res.status(404).json({
        message: "Document is not Found .",
      });
    }
    const documents = await documentTemplate
      .find({ docId: document._id })
      .lean();
    res.status(200).json(documents);
  } catch (err) {
    console.error("Error fetching document data:", err);
    res.status(500).json({ message: "Failed to fetch document data." });
  }
};

exports.getDocumentTemplate = async (req, res) => {
  try {
    const documentTemplateDataArray = await documentTemplate.find({});
    if (documentTemplateDataArray) {
      res.status(404).send("Records are not found");
    }
    res.status(200).send(documentTemplateDataArray);
  } catch (err) {
    console.log("err", err);
  }
};
