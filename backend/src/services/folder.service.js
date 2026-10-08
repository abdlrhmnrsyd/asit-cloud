const { db } = require("../config/firebase");
const { AppError } = require("../middleware/error.middleware");

const FOLDERS_COLLECTION = "folders";
const FILES_COLLECTION = "files";

/**
 * Create a new folder
 */
const createFolder = async (userId, { name, parentId = null }) => {
  if (!name || !name.trim()) {
    throw new AppError("Folder name is required", 400);
  }

  const cleanName = name.trim();
  const validParentId = parentId && parentId !== "root" && parentId !== "null" ? parentId : null;

  // If parentId is specified, verify it exists and belongs to user
  if (validParentId) {
    const parentDoc = await db.collection(FOLDERS_COLLECTION).doc(validParentId).get();
    if (!parentDoc.exists || parentDoc.data().userId !== userId) {
      throw new AppError("Parent folder does not exist or access denied", 404);
    }
  }

  const now = new Date().toISOString();
  const folderData = {
    userId,
    name: cleanName,
    parentId: validParentId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(FOLDERS_COLLECTION).add(folderData);

  return {
    id: docRef.id,
    ...folderData,
  };
};

/**
 * Get list of folders for user within a specific parent (or root)
 */
const getFolders = async (userId, { parentId = null } = {}) => {
  const validParentId = parentId && parentId !== "root" && parentId !== "null" ? parentId : null;

  let query = db
    .collection(FOLDERS_COLLECTION)
    .where("userId", "==", userId)
    .where("parentId", "==", validParentId);

  const snapshot = await query.get();

  const folders = [];
  snapshot.forEach((doc) => {
    folders.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  // Sort by name case-insensitively
  folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

  return folders;
};

/**
 * Get folder detail by ID
 */
const getFolderById = async (folderId, userId) => {
  if (!folderId) {
    throw new AppError("Folder ID is required", 400);
  }

  const doc = await db.collection(FOLDERS_COLLECTION).doc(folderId).get();

  if (!doc.exists) {
    throw new AppError("Folder not found", 404);
  }

  const data = doc.data();
  if (data.userId !== userId) {
    throw new AppError("Access denied", 403);
  }

  return {
    id: doc.id,
    ...data,
  };
};

/**
 * Get folder breadcrumbs path from root to current folder
 */
const getFolderPath = async (folderId, userId) => {
  if (!folderId || folderId === "root" || folderId === "null") {
    return [];
  }

  const path = [];
  let currentId = folderId;

  while (currentId) {
    const doc = await db.collection(FOLDERS_COLLECTION).doc(currentId).get();
    if (!doc.exists) break;

    const data = doc.data();
    if (data.userId !== userId) break;

    path.unshift({
      id: doc.id,
      name: data.name,
      parentId: data.parentId,
    });

    currentId = data.parentId;
  }

  return path;
};

/**
 * Update folder name
 */
const updateFolder = async (folderId, userId, { name }) => {
  if (!name || !name.trim()) {
    throw new AppError("Folder name is required", 400);
  }

  const folder = await getFolderById(folderId, userId);
  const cleanName = name.trim();
  const now = new Date().toISOString();

  await db.collection(FOLDERS_COLLECTION).doc(folderId).update({
    name: cleanName,
    updatedAt: now,
  });

  return {
    ...folder,
    name: cleanName,
    updatedAt: now,
  };
};

/**
 * Delete folder and recursively delete subfolders & files
 */
const deleteFolder = async (folderId, userId, telegramService) => {
  const folder = await getFolderById(folderId, userId);

  // Helper to recursively collect all subfolder IDs
  const collectFolderIds = async (parentId) => {
    const ids = [parentId];
    const snapshot = await db
      .collection(FOLDERS_COLLECTION)
      .where("userId", "==", userId)
      .where("parentId", "==", parentId)
      .get();

    for (const doc of snapshot.docs) {
      const childIds = await collectFolderIds(doc.id);
      ids.push(...childIds);
    }
    return ids;
  };

  const allFolderIds = await collectFolderIds(folderId);

  // Delete all files in these folders
  for (const fId of allFolderIds) {
    const filesSnapshot = await db
      .collection(FILES_COLLECTION)
      .where("userId", "==", userId)
      .where("folderId", "==", fId)
      .get();

    for (const fileDoc of filesSnapshot.docs) {
      const fileData = fileDoc.data();
      if (telegramService && fileData.telegramMessageId) {
        await telegramService.deleteMessage(fileData.telegramMessageId).catch(() => {});
      }
      await db.collection(FILES_COLLECTION).doc(fileDoc.id).delete();
    }

    // Delete folder doc
    await db.collection(FOLDERS_COLLECTION).doc(fId).delete();
  }

  return {
    deletedFoldersCount: allFolderIds.length,
  };
};

module.exports = {
  createFolder,
  getFolders,
  getFolderById,
  getFolderPath,
  updateFolder,
  deleteFolder,
};
