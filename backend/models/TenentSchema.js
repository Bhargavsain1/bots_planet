
const { getNextSequence } = require("../utils/sequenceGenerator");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const tenentSchema = new mongoose.Schema({
  tenentId: {
    type: Number,
  },
  orgName: {
    type: String,
  },
  industry: {
    type: String,
  },
  orgSize: {
    type: String,
  },
  location: {
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
tenentSchema.pre("save", async function (next) {
  if (this.isNew && !this.serialNumber) {
    
    const nextSerial = await getNextSequence("Tenents", 100001); 
    this.tenentId = nextSerial;
  }
  next();
});
module.exports = mongoose.model("Tenents", tenentSchema);
