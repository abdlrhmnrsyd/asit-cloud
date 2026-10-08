const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  PORT: process.env.PORT || 3000,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID,
  JWT_SECRET: process.env.JWT_SECRET || "asit_cloud_fallback_secret_key_321",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",
};

if (!env.TELEGRAM_BOT_TOKEN) {
  console.warn("⚠️ Warning: TELEGRAM_BOT_TOKEN is not configured in .env");
}

if (!env.TELEGRAM_CHANNEL_ID) {
  console.warn("⚠️ Warning: TELEGRAM_CHANNEL_ID is not configured in .env");
}

module.exports = env;
