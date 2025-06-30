const mongoose = require("mongoose");

const documentTemplate = require("../models/DocumentTemplateSchema");
const documentSchema = require("../models/DocumentSchema");

const Modules = require("../models/moduleSchema");
let { addNewFieldtoCollection } = require("../controller/collectionController");

exports.saveDocumentTemplateList = async (req, res) => {
  try {
    const documentTemplateArray = req.body;

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
      return res.status(400).json({
        message: "Document is not available .",
      });
    }
    for (const item of documentTemplateArray) {
      item.docId = document.docId;
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
    // save the data in other collection
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
      res.status(400).send(`There is no document with ${requestedDocName} `);
    }
    const documents = await documentTemplate
      .find({ docId: document.docId })
      .lean();

    const formattedDocuments = documents.map((doc) => ({
      ...doc,
      documentName: req.params.docName,
      id: doc._id.toString(),
    }));

    // Remove the original _id and __v if you don't want them
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
    const requestedCollectionName = req.params.collectionName;

    let document = await documentSchema.findOne({
      collectionName: requestedCollectionName,
    });
    if (!document) {
      return res.status(400).json({
        message: "Document is not available .",
      });
    }
    console.log("documentid", document);
    const documents = await documentTemplate
      .find({ docId: document.docId })
      .lean();
    res.status(200).json(documents);
  } catch (err) {
    console.error("Error fetching document data:", err); // Use console.error for errors
    res.status(500).json({ message: "Failed to fetch document data." }); // Send a proper error response
  }
};
