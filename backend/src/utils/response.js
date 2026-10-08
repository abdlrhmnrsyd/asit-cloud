/**
 * Standardized API response utilities
 */

const successResponse = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = "Internal Server Error", statusCode = 500, error = null) => {
  const payload = {
    success: false,
    message,
  };

  if (error && process.env.NODE_ENV !== "production") {
    payload.error = typeof error === "string" ? error : error.message || error;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse,
};
