const express = require("express");
const folderController = require("../controllers/folder.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// All folder routes require authentication
router.use(authMiddleware);

router.post("/", folderController.createFolder);
router.get("/", folderController.getFolders);
router.get("/:id", folderController.getFolderById);
router.patch("/:id", folderController.updateFolder);
router.delete("/:id", folderController.deleteFolder);

module.exports = router;
