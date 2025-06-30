const mongoose = require("mongoose");
const functionalAreaSchema = require("../models/functionalAreaSchema");
const documentSchema = require("../models/DocumentSchema");

exports.getFuntinalAreaDetails = async (req, res) => {
  try {
    const functionalAreas = await functionalAreaSchema.find({
      moduleId: parseInt(req.params.id),
    });
    if (!functionalAreas.length) {
      res
        .status(404)
        .send(`There are no record with moduleId ${req.params.id}`);
    }

    res.status(200).send(functionalAreas);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllFunctionAreas = async (req, res) => {
  try {
    const functionalAreas = await functionalAreaSchema.find(
      {},
      {
        created_at: 0,
        updated_at: 0,
        created_by: 0,
        updated_by: 0,
        _id: 0,
        __v: 0,
        faId: 0,
      }
    );
    if (!functionalAreas.length) {
      res.status(404).send(`There are no record `);
    }
    res.status(200).send(functionalAreas);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.saveFunctionArea = async (req, res) => {
  try {
    const functionAreaData = req.body;
    const createdNewFunctionArea = await functionalAreaSchema.insertMany(
      functionAreaData
    );
    if (!createdNewFunctionArea) {
      res.status(400).send("Error while creating the functionArea records");
    }
    res.status(200).send(createdNewFunctionArea);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.getEachFuntinalAreaDetails = async (req, res) => {
  try {
    const { faId } = req.params;

    if (isNaN(faId)) {
      return res.status(400).json({ error: "Invalid faId. Must be a number." });
    }

    const eachFunctionItems = await documentSchema.find({
      faId: parseInt(faId),
    });
    if (!eachFunctionItems) {
      res.status(404).send("There are no records");
    }

    res.status(200).send(eachFunctionItems);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.schemaDeatils = async (req, res) => {
  try {
    let collectionName = req.params.collectionName;
    console.log("collectionName", collectionName);
    let targetModel = null;

    // Iterate through all registered Mongoose models
    for (const modelName in mongoose.models) {
      const Model = mongoose.models[modelName];
      console.log("Model", Model);
      // Check if the model's collection name matches the provided collectionName
      if (Model.collection.name === collectionName) {
        targetModel = Model;
        break;
      }
    }

    if (targetModel) {
      console.log(`\n--- Schema for Collection: "${collectionName}" ---`);
      const schemaPaths = targetModel.schema.paths;

      for (const pathName in schemaPaths) {
        if (schemaPaths.hasOwnProperty(pathName)) {
          const schemaType = schemaPaths[pathName];
          const typeInstance = schemaType.caster // For arrays
            ? `Array of ${schemaType.caster.instance}`
            : schemaType.instance;

          // Exclude virtuals and methods if you only want actual fields
          console.log(`  Field Name: ${pathName}, Field Type: ${typeInstance}`);
        }
      }
      console.log("--- End of Schema Details ---");
      return schemaPaths; // Return the full schema paths object if needed
    } else {
      console.log(
        `\nNo Mongoose model found for collection: "${collectionName}".`
      );
      console.log(
        "Ensure the collection name matches the name defined in your Mongoose models."
      );
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  } finally {
    // Ensure connection is closed after operation if not a long-running server
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};
