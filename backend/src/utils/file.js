const path = require("path");

/**
 * Format bytes to readable string (e.g. 1.2 MB)
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Get category from mime type or extension
 */
const getFileCategory = (mimeType = "", filename = "") => {
  const ext = path.extname(filename).toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime.startsWith("image/") || [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"].includes(ext)) {
    return "image";
  }
  if (mime.startsWith("video/") || [".mp4", ".mkv", ".mov", ".webm", ".avi"].includes(ext)) {
    return "video";
  }
  if (mime.startsWith("audio/") || [".mp3", ".wav", ".ogg", ".flac", ".m4a"].includes(ext)) {
    return "audio";
  }
  if (mime === "application/pdf" || ext === ".pdf") {
    return "pdf";
  }
  if (
    mime.includes("word") ||
    mime.includes("officedocument.wordprocessingml") ||
    [".doc", ".docx"].includes(ext)
  ) {
    return "word";
  }
  if (
    mime.includes("excel") ||
    mime.includes("officedocument.spreadsheetml") ||
    [".xls", ".xlsx", ".csv"].includes(ext)
  ) {
    return "excel";
  }
  if (
    mime.includes("powerpoint") ||
    mime.includes("officedocument.presentationml") ||
    [".ppt", ".pptx"].includes(ext)
  ) {
    return "powerpoint";
  }
  if (
    mime.includes("zip") ||
    mime.includes("rar") ||
    mime.includes("tar") ||
    mime.includes("7z") ||
    [".zip", ".rar", ".7z", ".tar", ".gz"].includes(ext)
  ) {
    return "archive";
  }
  if (
    mime.startsWith("text/") ||
    mime.includes("json") ||
    mime.includes("javascript") ||
    [".txt", ".md", ".json", ".js", ".ts", ".html", ".css", ".py", ".go", ".rs", ".java", ".c", ".cpp"].includes(ext)
  ) {
    return "code";
  }

  return "generic";
};

/**
 * Sanitize filename to prevent directory traversal or malformed names
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[/\\?%*:|"<>]/g, "-").trim();
};

module.exports = {
  formatBytes,
  getFileCategory,
  sanitizeFilename,
};
