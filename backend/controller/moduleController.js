const mongoose = require("mongoose");
const functionalAreaSchema = require("../models/functionalAreaSchema");
const documentSchema = require("../models/DocumentSchema");
const moduleSchema = require("../models/moduleSchema");

exports.saveModule = async (req, res) => {
  try {
    let moduleData = req.body;
    const createdNewModule = await moduleSchema.insertMany(moduleData);
    if (!createdNewModule) {
      res.status(400).send("Error while inserting the module records");
    }
    res.status(200).send(createdNewModule);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.getEachModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const response = await moduleSchema.findById({
      _id: moduleId,
    });
    if (!response) {
      res.status(404).send("There are no records");
    }

    res.status(200).send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};
exports.getModulesDetails = async (req, res) => {
  try {
    const modules = await moduleSchema.find({});
    if (!modules.length) {
      res.send("There are no records in modules");
    }
    res.status(200).send(modules);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server errror");
  }
};
exports.updateModuleDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const moduleData = req.body;

    let updatedModule = await moduleSchema.findByIdAndUpdate(
      { _id: id },
      {
        $set: moduleData,
      },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!updatedModule) {
      res.status(404).send("Module not found");
    }
    res.status(200).json({
      message: "Module updated successfully!",
      module: updatedModule,
    });
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Internal server Error");
  }
};
