const mongoose = require("mongoose");
const botTypeSchema = require("../models/BotTypeSchema");
exports.getBotDetails = async (req, res) => {
  try {
    const botTypes = await botTypeSchema.find({});
    if (!botTypes) {
      res.status(400).send(" No records are available");
    }
    res.status(200).send(botTypes);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
