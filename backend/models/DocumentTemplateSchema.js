const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const documentTemplateSchema = new mongoose.Schema({
  documetName: {
    type: String,
  },
  seqNumber: {
    type: Number,
  },
  fieldLabel: {
    type: String,
  },
  fieldType: {
    type: String,
  },
  fieldDescription: {
    type: String,
  },
  displayFlag: {
    type: String,
  },
  updatebleFlag: {
    type: String,
  },
  defaultValue: {
    type: String,
  },
  foreignDocument: {
    type: String,
  },
  displayList: {
    type: String,
  },
  fieldName: {
    type: String,
  },
  created_by: {
    type: String,
    default: "admin",
  },
  docId: {
    type: Number,
  },
  updated_by: {
    type: String,
    default: "admin",
  },
  created_at: {
    type: Date,
    default: new Date().toISOString(),
  },
  updated_at: {
    type: Date,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model("templates", documentTemplateSchema);
