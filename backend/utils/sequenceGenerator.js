// services/sequenceGenerator.js
const Counter = require("../models/CounterSchema");

async function getNextSequence(collectionName, initialValue) {
  const counter = await Counter.findOneAndUpdate(
    { _id: collectionName }, // Unique ID for this sequence
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true } // `new:true` returns the updated doc, `upsert:true` creates if not exists
  );

  // If it's a new counter, and it starts from 0, set it to the initial value
  if (counter.seq === 1 && initialValue) {
    // Checks if it's the very first increment
    await Counter.updateOne(
      { _id: collectionName },
      { $set: { seq: initialValue } }
    );
    return initialValue;
  }

  return counter.seq;
}

// Initialize counters if they don't exist, to set their starting points
async function initializeCounters() {
  await Counter.updateOne(
    { _id: "Tenents" },
    { $setOnInsert: { seq: 1000001 } }, // Will only set if document is inserted
    { upsert: true }
  );
  await Counter.updateOne(
    { _id: "UserRoles" },
    { $setOnInsert: { seq: 200001 } },
    { upsert: true }
  );
  //   await Counter.updateOne(
  //     { _id: "collection3_serial" },
  //     { $setOnInsert: { seq: 3000 } },
  //     { upsert: true }
  //   );
  console.log("Counters initialized/checked.");
}

module.exports = { getNextSequence, initializeCounters };
