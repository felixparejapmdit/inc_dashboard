const express = require("express");
const multer = require("multer");

const verifyToken = require("../middlewares/authMiddleware");
const webdavContext = require("../middlewares/webdavContext");
const {
  createFolder,
  deleteItem,
  listDirectory,
  normalizeRemotePath,
  uploadFile,
} = require("../services/webdavService");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.WEBDAV_MAX_UPLOAD_BYTES || 104857600),
  },
});

router.use(verifyToken);
router.use(webdavContext);

router.get("/list", async (req, res) => {
  try {
    const targetPath = req.query.path || "/";
    const data = await listDirectory(req.webdav.client, targetPath);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ WebDAV list failed:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message || "Could not load the folder. Check the WebDAV settings.",
    });
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose a file first.",
      });
    }

    const folderPath = req.body?.path || "/";
    const uploaded = await uploadFile(req.webdav.client, folderPath, req.file);

    return res.status(201).json({
      success: true,
      data: uploaded,
    });
  } catch (error) {
    console.error("❌ WebDAV upload failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "The file could not be uploaded.",
    });
  }
});

router.post("/folder", async (req, res) => {
  try {
    const folderPath = req.body?.path || "/";
    const folderName = req.body?.name || "";
    const created = await createFolder(req.webdav.client, folderPath, folderName);

    return res.status(201).json({
      success: true,
      data: created,
    });
  } catch (error) {
    console.error("❌ WebDAV folder creation failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "The folder could not be created.",
    });
  }
});

router.delete("/item", async (req, res) => {
  try {
    const targetPath = req.query.path || req.body?.path;

    if (!targetPath) {
      return res.status(400).json({
        success: false,
        message: "A file path is required.",
      });
    }

    const deleted = await deleteItem(req.webdav.client, normalizeRemotePath(targetPath));

    return res.json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    console.error("❌ WebDAV delete failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "The file could not be deleted.",
    });
  }
});

module.exports = router;
