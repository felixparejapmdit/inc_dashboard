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

// ✅ GET file content (stream / download)
router.get("/file", async (req, res) => {
  try {
    const targetPath = req.query.path;
    if (!targetPath) {
      return res.status(400).json({
        success: false,
        message: "A file path is required.",
      });
    }

    const normalized = normalizeRemotePath(targetPath);
    const stat = await req.webdav.client.stat(normalized);
    const mimeType = stat.mime || "application/octet-stream";

    const buffer = await req.webdav.client.getFileContents(normalized);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(stat.basename)}"`);
    return res.send(buffer);
  } catch (error) {
    console.error("❌ WebDAV get file failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not retrieve the file contents.",
    });
  }
});

// ✅ POST write/save file content
router.post("/write", async (req, res) => {
  try {
    const { path: targetPath, content } = req.body;
    if (!targetPath) {
      return res.status(400).json({
        success: false,
        message: "A file path is required.",
      });
    }

    const normalized = normalizeRemotePath(targetPath);
    await req.webdav.client.putFileContents(normalized, content || "");

    return res.json({
      success: true,
      message: "File written successfully.",
    });
  } catch (error) {
    console.error("❌ WebDAV write file failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not save the file.",
    });
  }
});

// ✅ POST rename/move file or folder
router.post("/rename", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "Source (from) and target (to) paths are required.",
      });
    }

    const normFrom = normalizeRemotePath(from);
    const normTo = normalizeRemotePath(to);

    await req.webdav.client.moveFile(normFrom, normTo);

    return res.json({
      success: true,
      message: "Item renamed successfully.",
    });
  } catch (error) {
    console.error("❌ WebDAV rename failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not rename the item.",
    });
  }
});

module.exports = router;
