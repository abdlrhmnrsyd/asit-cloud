const { errorResponse } = require("../utils/response");

/**
 * Custom AppError class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("🔴 Server Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, "File size exceeds the allowed limit (max 50MB for Telegram Bot API)", 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid authentication token", 401);
  }
  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Authentication token has expired. Please login again.", 401);
  }

  // Telegram Axios errors
  if (err.response && err.response.data && err.response.data.description) {
    const telegramMsg = err.response.data.description;
    console.error("Telegram API Error:", telegramMsg);
    return errorResponse(res, `Telegram storage error: ${telegramMsg}`, 502);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (statusCode === 500 ? "Internal Server Error" : err.message);

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === "development" ? err.message : null);
};

module.exports = {
  AppError,
  errorHandler,
};
