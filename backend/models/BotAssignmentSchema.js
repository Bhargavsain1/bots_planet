// the data stored in T database only

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const botAssignmentSchema = new mongoose.Schema({
  botId: {
    type: String,

    unique: true,
  },
  botName: {
    type: String,
  },
  botTypeId: {
    type: Number,
  },
  userId: {
    type: Number,
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

const getTenantDataModel = (connection) => {
  try {
    if (connection.models["botAssignments"]) {
      return connection.models["botAssignments"];
    }
    return connection.model("botAssignments", botAssignmentSchema);
  } catch (err) {
    console.error("Error in getTenantDataModel:", err);
    throw err;
  }
};

module.exports = getTenantDataModel;
