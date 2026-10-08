const multer = require("multer");

// Multer in-memory storage for handling streaming/buffers to Telegram
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    // 50MB limit standard for Telegram Bot API uploads
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;
