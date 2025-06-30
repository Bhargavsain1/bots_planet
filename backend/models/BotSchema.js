const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const { getNextSequence } = require("../utils/sequenceGenerator");

// Helper function to pad numbers with leading zeros
function padNumber(num, size) {
  let s = "0000000" + num;
  return s.substring(s.length - size);
}

const botSchema = new mongoose.Schema({
  botId: {
    type: String,
    unique: true,
  },

  botTypeId: {
    type: Number,
  },
  tenentId: {
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

botSchema.pre("save", async function (next) {
  if (this.isNew && !this.botId) {
    let prefix = "";
    let counterName = "";
    let initialSeq = 1;

    switch (this.botTypeId) {
      case 101:
        prefix = "ISB-";
        counterName = "Intenal Sales";
        break;
      case 102:
        prefix = "MKT-";
        counterName = "Marketing";
        break;
      case 103:
        prefix = "CCB-";
        counterName = "Content Creation";
        break;
      default:
        console.warn(
          `Unknown botTypeId: ${this.botTypeId}. Using generic prefix.`
        );
        prefix = "GEN-";
        counterName = "BotSerial_GENERIC";
        break;
    }

    const nextSeq = await getNextSequence(counterName, initialSeq);

    const formattedSeq = padNumber(nextSeq, 7);

    this.botId = `${prefix}${formattedSeq}`;
  }
  this.updated_at = new Date().toISOString();
  next();
});

module.exports = mongoose.model("bots", botSchema);
