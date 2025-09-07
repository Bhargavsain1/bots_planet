const { getNextSequence } = require("../utils/sequenceGenerator");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const functionalAreaSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
    },
    faId: {
      type: Number,
    },
    faDescription: {
      type: String,
    },
    faName: {
      type: String,
    },
    created_by: {
      type: String,
      default: "admin",
    },
    updated_by: {
      type: String,
      default: "admin",
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);
functionalAreaSchema.pre("save", async function (next) {
  if (this.isNew && !this.serialNumber) {
    const nextSerial = await getNextSequence("functional_areas", 0);
    this.faId = nextSerial;
  }
  next();
});
module.exports = mongoose.model("functional_areas", functionalAreaSchema);
