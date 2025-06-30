
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const usersSchema = new mongoose.Schema({
  tenentId: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  personName: {
    type: String,
  },
  phoneNumber: {
    type: Number,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  dbName: {
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
module.exports = mongoose.model("Users", usersSchema);
