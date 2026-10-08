const fileService = require("../services/file.service");
const { successResponse, errorResponse } = require("../utils/response");

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return errorResponse(res, "No file uploaded", 400);
    }

    const folderId = req.body.folderId || null;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        fileService.uploadFile(req.user.id, file, folderId)
      );
      const uploadedFiles = await Promise.all(uploadPromises);
      return successResponse(res, { files: uploadedFiles }, "Files uploaded successfully", 201);
    }

    const uploadedFile = await fileService.uploadFile(req.user.id, req.file, folderId);
    return successResponse(res, { file: uploadedFile }, "File uploaded successfully", 201);
  } catch (error) {
    next(error);
  }
};

const getFiles = async (req, res, next) => {
  try {
    const {
      folderId,
      search,
      category,
      isStarred,
      isTrashed,
      sort,
      order,
      page,
      limit,
    } = req.query;

    const result = await fileService.getFiles(req.user.id, {
      folderId,
      search,
      category,
      isStarred,
      isTrashed,
      sort,
      order,
      page,
      limit,
    });

    return successResponse(res, result, "Files retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getFileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await fileService.getFileById(id, req.user.id);
    return successResponse(res, { file }, "File retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isPreview = req.query.preview === "true" || req.query.inline === "true";

    const { file, stream, contentType, contentLength } = await fileService.getFileStream(id, req.user.id);

    const dispositionType = isPreview ? "inline" : "attachment";
    // Encode filename for safe headers
    const encodedFilename = encodeURIComponent(file.name);

    res.setHeader("Content-Type", contentType);
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    res.setHeader(
      "Content-Disposition",
      `${dispositionType}; filename="${file.name}"; filename*=UTF-8''${encodedFilename}`
    );

    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

const updateFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, isStarred, isTrashed } = req.body;

    const updated = await fileService.updateFile(id, req.user.id, {
      name,
      isStarred,
      isTrashed,
    });

    return successResponse(res, { file: updated }, "File updated successfully");
  } catch (error) {
    next(error);
  }
};

const moveFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    const moved = await fileService.moveFile(id, req.user.id, folderId);
    return successResponse(res, { file: moved }, "File moved successfully");
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await fileService.deleteFile(id, req.user.id);
    return successResponse(res, result, "File deleted successfully");
  } catch (error) {
    next(error);
  }
};

const getStorage = async (req, res, next) => {
  try {
    const stats = await fileService.getStorageStats(req.user.id);
    return successResponse(res, stats, "Storage stats retrieved successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
  getFiles,
  getFileById,
  downloadFile,
  updateFile,
  moveFile,
  deleteFile,
  getStorage,
};
