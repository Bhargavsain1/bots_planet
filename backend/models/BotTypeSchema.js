
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const botTypeSchema = new mongoose.Schema({
  botTypeId: {
    type: Number,
    unique: true,
  },
  functionalArea: {
    type: String,
    required: true,
  },
  botType: {
    type: String,
  },
  created_at: {
    type: Date,
    default: new Date().toISOString(),
  },
  updated_at: {
    type: Date,
    default: new Date().toISOString(),
  },
  created_by: {
    type: String,
    default: "admin",
  },
  updated_by: {
    type: String,
    default: "admin",
  },
});

module.exports = mongoose.model("bot_types", botTypeSchema);
