const path = require("path");
const dotenv = require("dotenv");

// Load .env from project root (one level up from backend folder)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Export process.env for use across all files
module.exports = {
  MAIN_DB_URI: process.env.MAIN_DB_URI,
  TENENT_MONGO_DB_URL: process.env.TENENT_MONGO_DB_URL,
  PORT: process.env.PORT || 5000, // fallback if not defined
};
