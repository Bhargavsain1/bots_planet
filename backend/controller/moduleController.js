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
    const response = await moduleSchema.find({
      moduleId: parseInt(moduleId),
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
// get modules list
exports.getModulesDetails = async (req, res) => {
  try {
    const modules = await moduleSchema.find(
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
    if (!modules.length) {
      res.send("There are no records in modules");
    }
    res.status(200).send(modules);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server errror");
  }
};
