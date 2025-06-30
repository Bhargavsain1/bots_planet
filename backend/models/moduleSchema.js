const { getNextSequence } = require("../utils/sequenceGenerator");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const moduleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: Number,
    },
    moduleName: {
      type: String,
    },
    moduleDescription: {
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
moduleSchema.pre("save", async function (next) {
  if (this.isNew && !this.serialNumber) {
    const nextSerial = await getNextSequence("modules", 0);
    this.moduleId = nextSerial;
  }
  next();
});
module.exports = mongoose.model("modules", moduleSchema);
