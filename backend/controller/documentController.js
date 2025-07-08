const mongoose = require("mongoose");
const functionalAreaSchema = require("../models/functionalAreaSchema");
const documentSchema = require("../models/DocumentSchema");
const moduleSchema = require("../models/moduleSchema");
const {
  getDynamicCollectionModel,
} = require("../utils/getDynamicCollectionModel");
exports.getDocumentList = async (req, res) => {
  try {
    const documentDataArray = await documentSchema.find({});
    const moduleIds = [
      ...new Set(
        documentDataArray.map((item) => item.moduleId).filter(Boolean)
      ),
    ];
    const faIds = [
      ...new Set(documentDataArray.map((item) => item.faId).filter(Boolean)),
    ];
    let modulesMap = new Map();
    if (moduleIds.length > 0) {
      const modules = await moduleSchema.find({ _id: { $in: moduleIds } });
      modules.forEach((module) => {
        modulesMap.set(module._id.toString(), module.moduleName);
      });
    }

    let functionalAreasMap = new Map();
    if (faIds.length > 0) {
      const functionalAreas = await functionalAreaSchema.find({
        _id: { $in: faIds },
      });
      functionalAreas.forEach((fa) => {
        functionalAreasMap.set(fa._id.toString(), fa.faName);
      });
    }

    const enrichedDocumentData = documentDataArray.map((item) => {
      const itemObject = item.toObject();

      if (
        itemObject.moduleId &&
        modulesMap.has(itemObject.moduleId.toString())
      ) {
        itemObject["Module Name"] = modulesMap.get(
          itemObject.moduleId.toString()
        );
      } else {
        itemObject["Module Name"] = null;
      }

      if (
        itemObject.faId &&
        functionalAreasMap.has(itemObject.faId.toString())
      ) {
        itemObject["Functional Area"] = functionalAreasMap.get(
          itemObject.faId.toString()
        );
      } else {
        itemObject["Functional Area"] = null;
      }
      return itemObject;
    });

    res.send(enrichedDocumentData);
  } catch (error) {
    console.error("Error in getDocumentList:", error);
    res.status(500).send({
      message: "Error fetching documents and related data",
      error: error.message,
    });
  }
};

exports.saveDocument = async (req, res) => {
  try {
    let documentdataArray = req.body;

    if (!Array.isArray(documentdataArray) || documentdataArray.length === 0) {
      return res
        .status(400)
        .send("Request body must be a non-empty array of document  data.");
    }
    const processedDocuments = [];

    for (const item of documentdataArray) {
      const moduleNameFromUI = item["Module Name"];
      const faNameFromUI = item["Functional Area"];
      if (!moduleNameFromUI || !faNameFromUI) {
        return res
          .status(400)
          .send(
            `Missing 'Module Name' or Functional Area  for one or more documents.`
          );
      }

      const moduleRecord = await moduleSchema.findOne({
        moduleName: moduleNameFromUI,
      });
      const functionAreaRecord = await functionalAreaSchema.findOne({
        faName: faNameFromUI,
      });

      if (!moduleRecord || !functionAreaRecord) {
        return res.status(404).send("Module /Functional Area not found ");
      }
      const newFunctionalArea = {
        ...item,
        moduleId: moduleRecord._id,
        faId: functionAreaRecord._id,
      };

      delete newFunctionalArea["Module Name"];
      delete newFunctionalArea["Functional Area"];
      let collection = await getDynamicCollectionModel(item.collectionName);
      processedDocuments.push(newFunctionalArea);
    }

    const createdDocument = await documentSchema.insertMany(processedDocuments);
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
    console.log("update", req.body);

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
