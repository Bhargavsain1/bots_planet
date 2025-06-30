const mongoose = require("mongoose");

const documentSchema = require("../models/DocumentSchema");

exports.getDocumentList = async (req, res) => {
  try {
    const documentList = await documentSchema.find(
      {},
      {
        created_at: 0,
        updated_at: 0,
        created_by: 0,
        updated_by: 0,
        _id: 0,
        __v: 0,
      }
    );
    if (!documentList.length) {
      res.status(400).send("There are  no records");
    }
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
