const mongoose = require("mongoose");

const genericDataSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      default: "Admin",
    },
    updatedBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

module.exports = genericDataSchema;
