const axios = require("axios");
const FormData = require("form-data");
const env = require("../config/env");
const { AppError } = require("../middleware/error.middleware");

const botToken = env.TELEGRAM_BOT_TOKEN;
const channelId = env.TELEGRAM_CHANNEL_ID;

const getTelegramApiUrl = () => {
  if (!botToken) {
    throw new AppError("Telegram Bot Token is not configured", 500);
  }
  return `https://api.telegram.org/bot${botToken}`;
};

const getTelegramFileBaseUrl = () => {
  if (!botToken) {
    throw new AppError("Telegram Bot Token is not configured", 500);
  }
  return `https://api.telegram.org/file/bot${botToken}`;
};

/**
 * Upload file to Telegram Private Channel as Document
 */
const uploadFile = async (file) => {
  if (!channelId) {
    throw new AppError("Telegram Channel ID is not configured", 500);
  }

  const form = new FormData();
  form.append("chat_id", channelId);
  form.append("document", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
    knownLength: file.size,
  });

  const response = await axios.post(
    `${getTelegramApiUrl()}/sendDocument`,
    form,
    {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 60000,
    }
  );

  return response.data;
};

/**
 * Get File info from Telegram API
 */
const getFile = async (fileId) => {
  const response = await axios.get(`${getTelegramApiUrl()}/getFile`, {
    params: { file_id: fileId },
    timeout: 30000,
  });

  if (!response.data || !response.data.ok) {
    throw new AppError("Failed to fetch file metadata from Telegram", 502);
  }

  return response.data.result;
};

/**
 * Get direct download URL for Telegram file
 */
const getFileDownloadUrl = async (fileId) => {
  const fileInfo = await getFile(fileId);
  const filePath = fileInfo.file_path;
  return `${getTelegramFileBaseUrl()}/${filePath}`;
};

/**
 * Stream file binary directly from Telegram server
 */
const getFileStream = async (fileId) => {
  const downloadUrl = await getFileDownloadUrl(fileId);
  const response = await axios.get(downloadUrl, {
    responseType: "stream",
    timeout: 60000,
  });

  return {
    stream: response.data,
    contentType: response.headers["content-type"],
    contentLength: response.headers["content-length"],
  };
};

/**
 * Delete message from Telegram Channel
 */
const deleteMessage = async (messageId) => {
  if (!channelId || !messageId) return false;

  try {
    const response = await axios.post(`${getTelegramApiUrl()}/deleteMessage`, {
      chat_id: channelId,
      message_id: messageId,
    });
    return response.data && response.data.ok;
  } catch (error) {
    console.warn("⚠️ Telegram deleteMessage warning:", error.response?.data?.description || error.message);
    // Even if Telegram delete returns message not found, we don't block deletion
    return false;
  }
};

module.exports = {
  uploadFile,
  getFile,
  getFileDownloadUrl,
  getFileStream,
  deleteMessage,
};