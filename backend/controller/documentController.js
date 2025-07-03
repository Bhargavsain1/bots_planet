const mongoose = require("mongoose");
 
const documentSchema = require("../models/DocumentSchema");
 
exports.getDocumentList = async (req, res) => {
  try {
    console.log("halooo-------------------------------------------");
    const documentList = await documentSchema.find({});
    if (!documentList.length) {
      res.status(400).send("There are  no records");
    }
    console.log("documentList", documentList);
    res.status(200).send(documentList);
  } catch (err) {
    console.log(err);
    res.send("Internal server error");
  }
};
exports.saveDocument = async (req, res) => {
  try {
    let documentdata = req.body;
    const createdDocument = await documentSchema.insertMany(documentdata);
    if (!createdDocument) {
      res.status(400).send("There is an error while creating the documents");
    }
    res.status(200).send(createdDocument);
  } catch (err) {
    console.log(err);
    res.send("Internal server error");
  }
};
 
exports.updateDocumets = async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
 
    let updatedDocuments = await documentSchema.findByIdAndUpdate(
      { _id: id },
      {
        $set: documentData,
      },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!updatedDocuments) {
      res.status(404).send("Document not found");
    }
    res.status(200).json({
      message: "Document updated successfully!",
      module: updatedDocuments,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Internal server Error");
  }
};
 