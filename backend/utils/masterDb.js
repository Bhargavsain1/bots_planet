// masterDb.js
const mongoose = require("mongoose");
const masterConnection = mongoose.createConnection(
  // "mongodb+srv://nagalakshmib:Naga@824@cluster1.7u1knxr.mongodb.net/"
  "mongodb://localhost:27017/HOST"
);

const dbCounterSchema = new mongoose.Schema({
  lastDbId: { type: Number, default: 0 },
});

const DBCounter = masterConnection.model("DBCounter", dbCounterSchema);

module.exports = DBCounter;
