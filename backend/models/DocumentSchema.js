const { getNextSequence } = require("../utils/sequenceGenerator");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const documentSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
    },
    faId: {
      type: String,
    },
    docId: {
      type: Number,
    },
    docName: {
      type: String,
    },
    collectionName: {
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
documentSchema.pre("save", async function (next) {
  if (this.isNew && !this.serialNumber) {
    const nextSerial = await getNextSequence("documents", 0);
    this.docId = nextSerial;
  }
  next();
});

module.exports = mongoose.model("documents", documentSchema);
