const folderService = require("../services/folder.service");
const telegramService = require("../services/telegram.service");
const { successResponse } = require("../utils/response");

const createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const folder = await folderService.createFolder(req.user.id, { name, parentId });
    return successResponse(res, folder, "Folder created successfully", 201);
  } catch (error) {
    next(error);
  }
};

const getFolders = async (req, res, next) => {
  try {
    const { parentId } = req.query;
    const folders = await folderService.getFolders(req.user.id, { parentId });
    return successResponse(res, { folders }, "Folders retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getFolderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const folder = await folderService.getFolderById(id, req.user.id);
    const breadcrumbs = await folderService.getFolderPath(id, req.user.id);
    return successResponse(res, { folder, breadcrumbs }, "Folder details retrieved");
  } catch (error) {
    next(error);
  }
};

const updateFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await folderService.updateFolder(id, req.user.id, { name });
    return successResponse(res, updated, "Folder updated successfully");
  } catch (error) {
    next(error);
  }
};

const deleteFolder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await folderService.deleteFolder(id, req.user.id, telegramService);
    return successResponse(res, result, "Folder deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFolder,
  getFolders,
  getFolderById,
  updateFolder,
  deleteFolder,
};
