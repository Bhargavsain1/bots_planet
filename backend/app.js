// app.js
const express = require("express");
const mongoose = require("mongoose");
const { connectMainDB, closeAllDBConnections } = require("./utils/db");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const routes = require("./routes/index");
connectMainDB();
app.use("/api", routes);

const PORT = 5000;

process.on("SIGINT", async () => {
  console.log("\nSIGINT signal received. Closing connections...");
  await closeAllDBConnections();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nSIGTERM signal received. Closing connections...");
  await closeAllDBConnections();
  process.exit(0);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
