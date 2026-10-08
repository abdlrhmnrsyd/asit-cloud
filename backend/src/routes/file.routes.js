const express = require("express");
const fileController = require("../controllers/file.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

// All file routes require authentication
router.use(authMiddleware);

// Upload endpoint (supports single 'file' or multiple 'files')
router.post(
  "/upload",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  (req, res, next) => {
    // Normalizing req.file vs req.files
    if (req.files) {
      if (req.files.file && req.files.file.length > 0) {
        req.file = req.files.file[0];
      } else if (req.files.files && req.files.files.length > 0) {
        req.files = req.files.files;
      }
    }
    fileController.uploadFile(req, res, next);
  }
);

// Storage stats (Must be before /:id to prevent matching as id)
router.get("/storage", fileController.getStorage);

// Get files list
router.get("/", fileController.getFiles);

// Get file detail
router.get("/:id", fileController.getFileById);

// Download / stream file
router.get("/:id/download", fileController.downloadFile);

// Rename / update file metadata
router.patch("/:id", fileController.updateFile);

// Move file to folder
router.patch("/:id/move", fileController.moveFile);

// Delete file
router.delete("/:id", fileController.deleteFile);

module.exports = router;