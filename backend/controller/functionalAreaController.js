const mongoose = require("mongoose");
const functionalAreaSchema = require("../models/functionalAreaSchema");
const documentSchema = require("../models/DocumentSchema");
const moduleSchema = require("../models/moduleSchema");
exports.getFuntinalAreaDetails = async (req, res) => {
  try {
    const functionalAreas = await functionalAreaSchema.find({
      moduleId: req.params.id,
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
    const functionAreaDataArray = await functionalAreaSchema.find({});

    const moduleIds = [
      ...new Set(
        functionAreaDataArray.map((item) => item.moduleId).filter(Boolean)
      ),
    ];

    let modulesMap = new Map();

    if (moduleIds.length > 0) {
      const modules = await moduleSchema.find({ _id: { $in: moduleIds } });
      modules.forEach((module) => {
        modulesMap.set(module._id.toString(), module.moduleName);
      });
    }

    const enrichedFunctionAreas = functionAreaDataArray.map((item) => {
      const itemObject = item.toObject();
      if (
        itemObject.moduleId &&
        modulesMap.has(itemObject.moduleId.toString())
      ) {
        itemObject["Module Name"] = modulesMap.get(
          itemObject.moduleId.toString()
        );
      } else {
        itemObject.moduleName = null;
      }
      return itemObject;
    });

    res.send(enrichedFunctionAreas);
  } catch (error) {
    console.error("Error in getAllFunctionAreas:", error);
    res.status(500).send({
      message: "Error fetching functional areas and module names",
      error: error.message,
    });
  }
};
exports.saveFunctionArea = async (req, res) => {
  try {
    const functionAreaDataArray = req.body;

    if (
      !Array.isArray(functionAreaDataArray) ||
      functionAreaDataArray.length === 0
    ) {
      return res
        .status(400)
        .send(
          "Request body must be a non-empty array of functional area data."
        );
    }
    const processedFunctionAreas = [];

    for (const item of functionAreaDataArray) {
      const moduleNameFromUI = item["Module Name"];

      if (!moduleNameFromUI) {
        return res
          .status(400)
          .send(`Missing 'Module Name' for one or more functional areas.`);
      }

      const moduleRecord = await moduleSchema.findOne({
        moduleName: moduleNameFromUI,
      });

      if (!moduleRecord) {
        return res
          .status(404)
          .send(
            `Module not found for name: '${moduleNameFromUI}'. Cannot save functional area.`
          );
      }
      const newFunctionalArea = {
        ...item,
        moduleId: moduleRecord._id,
      };

      delete newFunctionalArea["Module Name"];

      processedFunctionAreas.push(newFunctionalArea);
    }

    const createdNewFunctionArea = await functionalAreaSchema.insertMany(
      processedFunctionAreas
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
    const { id } = req.params;
    const eachFunctionItems = await documentSchema.find({
      faId: id,
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

    let targetModel = null;

    for (const modelName in mongoose.models) {
      const Model = mongoose.models[modelName];

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

exports.updateFunctionArea = async (req, res) => {
  try {
    const { id } = req.params;
    const functionalAreaData = req.body;

    let updatedFunctionalArea = await functionalAreaSchema.findByIdAndUpdate(
      { _id: id },
      {
        $set: functionalAreaData,
      },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!updatedFunctionalArea) {
      res.status(404).send("FunctionalArea not found");
    }
    res.status(200).json({
      message: "FunctionalArea updated successfully!",
      module: updatedFunctionalArea,
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).send("Internal server Error");
  }
};
