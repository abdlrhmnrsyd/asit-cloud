const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");

let serviceAccount = null;

// 1. Try loading from Environment Variable (for Railway, Cloud Deployments, Docker)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const rawVal = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    // Check if it's base64 encoded or plain JSON
    if (rawVal.startsWith("{")) {
      serviceAccount = JSON.parse(rawVal);
    } else {
      const decoded = Buffer.from(rawVal, "base64").toString("utf-8");
      serviceAccount = JSON.parse(decoded);
    }
    console.log("🔒 Loaded Firebase credentials from Environment Variable");
  } catch (error) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", error.message);
  }
}

// 2. Fallback to local file if not loaded from env
if (!serviceAccount) {
  const serviceAccountPath = path.resolve(__dirname, "../../firebase-service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    try {
      serviceAccount = require(serviceAccountPath);
      console.log("📁 Loaded Firebase credentials from local file");
    } catch (error) {
      console.error("❌ Failed to load local firebase-service-account.json:", error.message);
    }
  }
}

if (!serviceAccount) {
  console.error("⚠️ CRITICAL: Firebase Service Account credentials not found! Set FIREBASE_SERVICE_ACCOUNT in env or provide firebase-service-account.json");
}

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

module.exports = {
  db,
};