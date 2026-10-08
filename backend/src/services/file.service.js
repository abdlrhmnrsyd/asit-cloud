const { db } = require("../config/firebase");
const telegramService = require("./telegram.service");
const { getFileCategory, sanitizeFilename } = require("../utils/file");
const { AppError } = require("../middleware/error.middleware");

const FILES_COLLECTION = "files";
const FOLDERS_COLLECTION = "folders";

/**
 * Upload single file: Send to Telegram storage and save metadata to Firestore
 */
const uploadFile = async (userId, file, folderId = null) => {
  if (!file) {
    throw new AppError("No file provided for upload", 400);
  }

  const validFolderId = folderId && folderId !== "root" && folderId !== "null" && folderId !== "undefined" ? folderId : null;

  // If folderId is provided, ensure it exists and belongs to the user
  if (validFolderId) {
    const folderDoc = await db.collection(FOLDERS_COLLECTION).doc(validFolderId).get();
    if (!folderDoc.exists || folderDoc.data().userId !== userId) {
      throw new AppError("Target folder does not exist or access denied", 404);
    }
  }

  const cleanFilename = sanitizeFilename(file.originalname);
  file.originalname = cleanFilename;

  // 1. Upload to Telegram channel
  const telegramRes = await telegramService.uploadFile(file);

  if (!telegramRes || !telegramRes.ok || !telegramRes.result) {
    throw new AppError("Failed to store file on Telegram backend", 502);
  }

  const message = telegramRes.result;
  const document = message.document || message.photo || message.video || message.audio;

  if (!document) {
    throw new AppError("Invalid Telegram storage response format", 502);
  }

  // Determine file ID from document object
  const telegramFileId = document.file_id || (Array.isArray(document) ? document[document.length - 1].file_id : null);
  const telegramFileUniqueId = document.file_unique_id || (Array.isArray(document) ? document[document.length - 1].file_unique_id : null);

  const category = getFileCategory(file.mimetype, cleanFilename);
  const now = new Date().toISOString();

  // 2. Save metadata in Firestore
  const fileData = {
    userId,
    name: cleanFilename,
    originalName: cleanFilename,
    mimeType: file.mimetype || "application/octet-stream",
    size: file.size,
    category,
    folderId: validFolderId,
    telegramMessageId: message.message_id,
    telegramFileId,
    telegramFileUniqueId,
    isStarred: false,
    isTrashed: false,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection(FILES_COLLECTION).add(fileData);

  return {
    id: docRef.id,
    ...fileData,
  };
};

/**
 * Query files for user with filtering, search, sorting and pagination
 */
const getFiles = async (userId, options = {}) => {
  const {
    folderId = null,
    search = "",
    category = "",
    isStarred = null,
    isTrashed = false,
    sort = "createdAt",
    order = "desc",
    page = 1,
    limit = 50,
  } = options;

  let query = db.collection(FILES_COLLECTION).where("userId", "==", userId);

  // By default filter by trash status
  if (typeof isTrashed === "boolean" || isTrashed === "true" || isTrashed === "false") {
    const trashedBool = isTrashed === true || isTrashed === "true";
    query = query.where("isTrashed", "==", trashedBool);
  }

  if (isStarred === true || isStarred === "true") {
    query = query.where("isStarred", "==", true);
  }

  const snapshot = await query.get();

  let files = [];
  snapshot.forEach((doc) => {
    files.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  // Filter by folder if not searching across all files
  if (search && search.trim()) {
    const term = search.toLowerCase().trim();
    files = files.filter((f) => f.name.toLowerCase().includes(term));
  } else if (isStarred !== true && isStarred !== "true" && isTrashed !== true && isTrashed !== "true") {
    const validFolderId = folderId && folderId !== "root" && folderId !== "null" ? folderId : null;
    files = files.filter((f) => (f.folderId || null) === validFolderId);
  }

  // Filter by category
  if (category) {
    files = files.filter((f) => f.category === category);
  }

  // Sorting
  files.sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];

    if (sort === "name") {
      valA = (valA || "").toLowerCase();
      valB = (valB || "").toLowerCase();
      return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }

    if (sort === "size") {
      valA = valA || 0;
      valB = valB || 0;
      return order === "asc" ? valA - valB : valB - valA;
    }

    // Default by date (createdAt / updatedAt)
    valA = new Date(valA || 0).getTime();
    valB = new Date(valB || 0).getTime();
    return order === "asc" ? valA - valB : valB - valA;
  });

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);
  const total = files.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedFiles = files.slice(startIndex, startIndex + limitNum);

  return {
    files: paginatedFiles,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get file details by ID and verify user ownership
 */
const getFileById = async (fileId, userId) => {
  if (!fileId) {
    throw new AppError("File ID is required", 400);
  }

  const doc = await db.collection(FILES_COLLECTION).doc(fileId).get();

  if (!doc.exists) {
    throw new AppError("File not found", 404);
  }

  const data = doc.data();
  if (data.userId !== userId) {
    throw new AppError("Access denied. You do not own this file.", 403);
  }

  return {
    id: doc.id,
    ...data,
  };
};

/**
 * Stream file binary directly from Telegram via backend
 */
const getFileStream = async (fileId, userId) => {
  const file = await getFileById(fileId, userId);

  if (!file.telegramFileId) {
    throw new AppError("Telegram file reference missing", 500);
  }

  const streamData = await telegramService.getFileStream(file.telegramFileId);

  return {
    file,
    stream: streamData.stream,
    contentType: file.mimeType || streamData.contentType || "application/octet-stream",
    contentLength: file.size || streamData.contentLength,
  };
};

/**
 * Update file properties (rename, toggle star, toggle trash)
 */
const updateFile = async (fileId, userId, updates = {}) => {
  const file = await getFileById(fileId, userId);
  const now = new Date().toISOString();
  const updateData = {
    updatedAt: now,
  };

  if (updates.name !== undefined && updates.name.trim()) {
    updateData.name = sanitizeFilename(updates.name.trim());
    updateData.category = getFileCategory(file.mimeType, updateData.name);
  }

  if (typeof updates.isStarred === "boolean") {
    updateData.isStarred = updates.isStarred;
  }

  if (typeof updates.isTrashed === "boolean") {
    updateData.isTrashed = updates.isTrashed;
  }

  await db.collection(FILES_COLLECTION).doc(fileId).update(updateData);

  return {
    ...file,
    ...updateData,
  };
};

/**
 * Move file to a different folder
 */
const moveFile = async (fileId, userId, targetFolderId = null) => {
  const file = await getFileById(fileId, userId);
  const validFolderId = targetFolderId && targetFolderId !== "root" && targetFolderId !== "null" ? targetFolderId : null;

  if (validFolderId) {
    const folderDoc = await db.collection(FOLDERS_COLLECTION).doc(validFolderId).get();
    if (!folderDoc.exists || folderDoc.data().userId !== userId) {
      throw new AppError("Target folder does not exist or access denied", 404);
    }
  }

  const now = new Date().toISOString();
  await db.collection(FILES_COLLECTION).doc(fileId).update({
    folderId: validFolderId,
    updatedAt: now,
  });

  return {
    ...file,
    folderId: validFolderId,
    updatedAt: now,
  };
};

/**
 * Delete file permanently from Telegram and Firestore
 */
const deleteFile = async (fileId, userId) => {
  const file = await getFileById(fileId, userId);

  // 1. Delete message from Telegram channel
  if (file.telegramMessageId) {
    await telegramService.deleteMessage(file.telegramMessageId);
  }

  // 2. Delete document from Firestore
  await db.collection(FILES_COLLECTION).doc(fileId).delete();

  return {
    id: fileId,
    name: file.name,
    deleted: true,
  };
};

/**
 * Get total storage used and breakdown
 */
const getStorageStats = async (userId) => {
  const snapshot = await db
    .collection(FILES_COLLECTION)
    .where("userId", "==", userId)
    .get();

  let totalFiles = 0;
  let totalSize = 0;
  const categoryStats = {
    image: { count: 0, size: 0 },
    video: { count: 0, size: 0 },
    audio: { count: 0, size: 0 },
    pdf: { count: 0, size: 0 },
    word: { count: 0, size: 0 },
    excel: { count: 0, size: 0 },
    powerpoint: { count: 0, size: 0 },
    archive: { count: 0, size: 0 },
    code: { count: 0, size: 0 },
    generic: { count: 0, size: 0 },
  };

  snapshot.forEach((doc) => {
    const data = doc.data();
    const size = Number(data.size) || 0;
    const cat = data.category || "generic";

    totalFiles += 1;
    totalSize += size;

    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, size: 0 };
    }
    categoryStats[cat].count += 1;
    categoryStats[cat].size += size;
  });

  return {
    totalFiles,
    totalSize,
    categoryStats,
  };
};

module.exports = {
  uploadFile,
  getFiles,
  getFileById,
  getFileStream,
  updateFile,
  moveFile,
  deleteFile,
  getStorageStats,
};
