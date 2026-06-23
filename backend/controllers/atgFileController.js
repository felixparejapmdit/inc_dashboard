const ATGFile = require("../models/ATGFile");
const fs = require("fs");
const path = require("path");

const FILES_DIR = path.join(__dirname, "../uploads/files");
const WEB_FILES_PREFIX = "/uploads/files";
const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".txt", ".pptx"]);

const FILE_ITEM = "file";
const FOLDER_ITEM = "folder";

const sanitizeName = (value) =>
  String(value || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .trim();

const sanitizeFileName = (value) => {
  const cleaned = path.basename(sanitizeName(value));
  if (!cleaned || cleaned === "." || cleaned === "..") return "";
  return cleaned;
};

const sanitizeFolderName = (value) => {
  const cleaned = sanitizeName(value);
  if (!cleaned || cleaned === "." || cleaned === "..") return "";
  return cleaned;
};

const normalizeFolderPath = (value = "") =>
  String(value || "")
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => sanitizeFolderName(segment))
    .filter(Boolean)
    .join("/");

const buildItemPath = (folderPath, name) => {
  const normalizedParent = normalizeFolderPath(folderPath);
  const safeName = sanitizeFolderName(name);

  if (!safeName) return normalizedParent;
  return normalizedParent
    ? path.posix.join(normalizedParent, safeName)
    : safeName;
};

const buildDirectoryPath = (folderPath = "") => {
  const normalized = normalizeFolderPath(folderPath);
  return normalized ? path.join(FILES_DIR, ...normalized.split("/")) : FILES_DIR;
};

const buildPhysicalFolderPath = (folderPath, folderName) =>
  buildDirectoryPath(buildItemPath(folderPath, folderName));

const buildPhysicalFilePath = (folderPath, storedName) =>
  path.join(buildDirectoryPath(folderPath), path.basename(String(storedName || "")));

const buildWebFolderPath = (folderPath, folderName) => {
  const relativePath = buildItemPath(folderPath, folderName);
  return relativePath
    ? path.posix.join(WEB_FILES_PREFIX, relativePath)
    : WEB_FILES_PREFIX;
};

const buildWebFilePath = (folderPath, storedName) => {
  const normalizedFolder = normalizeFolderPath(folderPath);
  const fileName = path.basename(String(storedName || ""));
  const relativePath = normalizedFolder
    ? path.posix.join(normalizedFolder, fileName)
    : fileName;

  return relativePath
    ? path.posix.join(WEB_FILES_PREFIX, relativePath)
    : WEB_FILES_PREFIX;
};

const resolveStoredFilePath = (filePath) => {
  const normalized = String(filePath || "").replace(/\\/g, "/").trim();
  if (!normalized) return null;

  const markers = ["/uploads/files/", "uploads/files/"];
  let relative = normalized;
  let matchedMarker = false;

  for (const marker of markers) {
    const index = normalized.indexOf(marker);
    if (index !== -1) {
      relative = normalized.slice(index + marker.length);
      matchedMarker = true;
      break;
    }
  }

  if (!matchedMarker && /^[a-zA-Z]:[\\/]/.test(normalized)) {
    return normalized;
  }

  if (!matchedMarker && path.isAbsolute(normalized)) {
    return normalized;
  }

  relative = relative.replace(/^\/+/, "");
  const segments = relative.split("/").filter(Boolean);
  if (!segments.length) return null;

  return path.join(FILES_DIR, ...segments);
};

const getFileExtension = (filename = "") =>
  path.extname(String(filename || "")).toLowerCase();

const ensureExtension = (name, extension) => {
  const safeName = sanitizeFileName(name);
  if (!safeName) return "";

  const normalizedExt = String(extension || "").replace(/^\./, "");
  const baseName = path.basename(safeName, path.extname(safeName));

  return normalizedExt ? `${baseName}.${normalizedExt}` : baseName;
};

const isFolderItem = (record = {}) =>
  String(record.item_type || FILE_ITEM).toLowerCase() === FOLDER_ITEM;

const isAllowedUpload = (filename = "") =>
  ALLOWED_EXTENSIONS.has(getFileExtension(filename));

const isAllowedRecord = (record = {}) => {
  if (isFolderItem(record)) return true;

  const candidate = String(
    record.file_type || record.filename || record.file_path || "",
  )
    .trim()
    .toLowerCase();
  const extension = candidate.startsWith(".")
    ? candidate
    : candidate.includes(".")
      ? getFileExtension(candidate)
      : `.${candidate}`;

  return ALLOWED_EXTENSIONS.has(extension);
};

const getRecordPath = (record = {}) =>
  buildItemPath(record.folder_path, record.filename);

const enrichFileRecord = (record) => {
  const plain = record.get ? record.get({ plain: true }) : { ...record };
  plain.item_path = getRecordPath(plain);
  plain.parent_path = normalizeFolderPath(plain.folder_path);
  plain.is_folder = isFolderItem(plain);
  plain.download_url = plain.is_folder
    ? null
    : `/api/atg-files/${plain.id}/download`;

  if (plain.is_folder) {
    plain.file_size = null;
    plain.preview_url = plain.file_path || buildWebFolderPath(plain.folder_path, plain.filename);
    plain.file_type = null;
    return plain;
  }

  const absolutePath = resolveStoredFilePath(plain.file_path);
  if (absolutePath && fs.existsSync(absolutePath)) {
    const stats = fs.statSync(absolutePath);
    plain.file_size = stats.isFile() ? stats.size : null;
  } else {
    plain.file_size = null;
  }

  plain.preview_url = plain.file_path;
  plain.file_type = plain.file_type || getFileExtension(plain.filename).replace(".", "");

  return plain;
};

const readAllRecords = async () =>
  ATGFile.findAll({
    order: [["createdAt", "DESC"]],
  });

const folderExists = (records, folderPath) => {
  const normalized = normalizeFolderPath(folderPath);
  if (!normalized) return true;

  return records.some(
    (record) => isFolderItem(record) && getRecordPath(record) === normalized,
  );
};

const hasNameConflict = (records, folderPath, name, ignoreId = null) => {
  const normalizedFolder = normalizeFolderPath(folderPath);
  const normalizedName = sanitizeName(name);

  return records.some((record) => {
    if (String(record.id) === String(ignoreId)) return false;
    if (normalizeFolderPath(record.folder_path) !== normalizedFolder) return false;
    return sanitizeName(record.filename) === normalizedName;
  });
};

const replacePathPrefix = (candidate, oldPrefix, newPrefix) => {
  const normalizedCandidate = normalizeFolderPath(candidate);
  const normalizedOld = normalizeFolderPath(oldPrefix);
  const normalizedNew = normalizeFolderPath(newPrefix);

  if (!normalizedOld) return normalizedCandidate;
  if (normalizedCandidate === normalizedOld) return normalizedNew;
  if (!normalizedCandidate.startsWith(`${normalizedOld}/`)) {
    return normalizedCandidate;
  }

  const suffix = normalizedCandidate.slice(normalizedOld.length + 1);
  return normalizedNew ? `${normalizedNew}/${suffix}` : suffix;
};

const isDescendantPath = (candidate, prefix) => {
  const normalizedCandidate = normalizeFolderPath(candidate);
  const normalizedPrefix = normalizeFolderPath(prefix);
  if (!normalizedCandidate || !normalizedPrefix) return false;

  return (
    normalizedCandidate === normalizedPrefix ||
    normalizedCandidate.startsWith(`${normalizedPrefix}/`)
  );
};

const removePathSafe = (targetPath) => {
  if (!targetPath) return;

  try {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Failed to remove path:", targetPath, error);
  }
};

// Get all files and folders
exports.getAllFiles = async (req, res) => {
  try {
    const records = await readAllRecords();
    res.json(records.map(enrichFileRecord).filter(isAllowedRecord));
  } catch (err) {
    console.error("Error fetching ATG Files:", err);
    res.status(500).json({ error: err.message });
  }
};

// Create a folder
exports.createFolder = async (req, res) => {
  try {
    const rawFolderName =
      req.body.folder_name || req.body.name || req.body.filename || "";
    const rawParentPath = req.body.folder_path || "";
    const uploadedBy = req.body.uploaded_by || "Admin";
    const category = req.body.category || "Folder";

    const folderName = sanitizeFolderName(rawFolderName);
    const parentPath = normalizeFolderPath(rawParentPath);

    if (!folderName) {
      return res.status(400).json({ message: "Folder name is required." });
    }

    const records = await readAllRecords();
    if (!folderExists(records, parentPath)) {
      return res.status(400).json({ message: "Parent folder not found." });
    }

    if (hasNameConflict(records, parentPath, folderName)) {
      return res
        .status(409)
        .json({ message: "A folder with that name already exists." });
    }

    const folderPath = buildItemPath(parentPath, folderName);
    const physicalFolderPath = buildPhysicalFolderPath(parentPath, folderName);

    if (!fs.existsSync(physicalFolderPath)) {
      fs.mkdirSync(physicalFolderPath, { recursive: true });
    }

    const folderRecord = await ATGFile.create({
      filename: folderName,
      file_path: buildWebFolderPath(parentPath, folderName),
      file_type: null,
      item_type: FOLDER_ITEM,
      folder_path: parentPath,
      category,
      uploaded_by: uploadedBy,
    });

    res.status(201).json({ success: true, data: enrichFileRecord(folderRecord) });
  } catch (err) {
    console.error("Error creating ATG folder:", err);
    res.status(500).json({ error: err.message });
  }
};

// Handle File Upload
exports.saveFileRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!isAllowedUpload(req.file.originalname)) {
      const rejectedPath = req.file.path;
      removePathSafe(rejectedPath);
      return res.status(400).json({
        message: "Only PDF, DOCX, TXT, and PPTX files are allowed.",
      });
    }

    const rawFolderPath = req.body.folder_path || "";
    const folderPath = normalizeFolderPath(rawFolderPath);
    const records = await readAllRecords();

    if (!folderExists(records, folderPath)) {
      removePathSafe(req.file.path);
      return res.status(400).json({ message: "Folder not found." });
    }

    const category = req.body.category || "General";
    const uploadedBy = req.body.uploaded_by || "Admin";
    const storedFileName = path.basename(req.file.filename);
    const sourcePath = req.file.path;
    const destinationDir = buildDirectoryPath(folderPath);
    const destinationPath = buildPhysicalFilePath(folderPath, storedFileName);

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    if (path.resolve(sourcePath) !== path.resolve(destinationPath)) {
      fs.renameSync(sourcePath, destinationPath);
    }

    const fileRecord = await ATGFile.create({
      filename: sanitizeFileName(req.file.originalname),
      file_path: buildWebFilePath(folderPath, storedFileName),
      file_type: getFileExtension(req.file.originalname).replace(".", ""),
      item_type: FILE_ITEM,
      folder_path: folderPath,
      category,
      uploaded_by: uploadedBy,
    });

    res.json({ success: true, data: enrichFileRecord(fileRecord) });
  } catch (err) {
    console.error("Error saving ATG File record:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get Org Chart (Specific Helper)
exports.getOrgChart = async (req, res) => {
  try {
    const chart = await ATGFile.findOne({
      where: { category: "OrgChart" },
      order: [["createdAt", "DESC"]],
    });
    if (!chart) return res.status(404).json({ message: "No org chart found" });
    res.json(chart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete File or Folder
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileRecord = await ATGFile.findByPk(id);

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    const allRecords = await readAllRecords();
    const targetPath = getRecordPath(fileRecord);

    if (isFolderItem(fileRecord)) {
      const descendants = allRecords.filter(
        (record) =>
          String(record.id) !== String(fileRecord.id) &&
          isDescendantPath(record.folder_path, targetPath),
      );

      for (const record of descendants) {
        await record.destroy();
      }

      const folderDiskPath =
        resolveStoredFilePath(fileRecord.file_path) ||
        buildPhysicalFolderPath(fileRecord.folder_path, fileRecord.filename);
      removePathSafe(folderDiskPath);
    } else {
      const absolutePath = resolveStoredFilePath(fileRecord.file_path);
      removePathSafe(absolutePath);
    }

    await fileRecord.destroy();
    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting ATG File:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { filename, folder_path } = req.body;
    const fileRecord = await ATGFile.findByPk(id);

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    const allRecords = await readAllRecords();
    const currentPath = getRecordPath(fileRecord);
    const nextParentPath =
      typeof folder_path === "string"
        ? normalizeFolderPath(folder_path)
        : normalizeFolderPath(fileRecord.folder_path);

    if (!folderExists(allRecords, nextParentPath)) {
      return res.status(400).json({ message: "Destination folder not found." });
    }

    if (isFolderItem(fileRecord)) {
      const nextName = sanitizeFolderName(filename || fileRecord.filename);
      if (!nextName) {
        return res.status(400).json({ message: "Folder name is required." });
      }

      const nextPath = buildItemPath(nextParentPath, nextName);
      const samePath = nextPath === currentPath;

      if (
        !samePath &&
        hasNameConflict(allRecords, nextParentPath, nextName, fileRecord.id)
      ) {
        return res
          .status(409)
          .json({ message: "A folder with that name already exists." });
      }

      if (
        nextParentPath &&
        isDescendantPath(nextParentPath, currentPath) &&
        nextParentPath !== currentPath
      ) {
        return res
          .status(400)
          .json({ message: "You cannot move a folder into itself." });
      }

      const oldFolderDiskPath =
        resolveStoredFilePath(fileRecord.file_path) ||
        buildPhysicalFolderPath(fileRecord.folder_path, fileRecord.filename);
      const newFolderDiskPath = buildPhysicalFolderPath(
        nextParentPath,
        nextName,
      );

      if (!samePath) {
        if (fs.existsSync(newFolderDiskPath)) {
          return res
            .status(409)
            .json({ message: "A folder already exists at the target location." });
        }

        if (oldFolderDiskPath && fs.existsSync(oldFolderDiskPath)) {
          fs.mkdirSync(path.dirname(newFolderDiskPath), { recursive: true });
          fs.renameSync(oldFolderDiskPath, newFolderDiskPath);
        }
      }

      fileRecord.filename = nextName;
      fileRecord.folder_path = nextParentPath;
      fileRecord.file_path = buildWebFolderPath(nextParentPath, nextName);
      await fileRecord.save();

      const descendants = allRecords.filter(
        (record) =>
          String(record.id) !== String(fileRecord.id) &&
          isDescendantPath(record.folder_path, currentPath),
      );

      for (const record of descendants) {
        const updatedFolderPath = replacePathPrefix(
          record.folder_path,
          currentPath,
          nextPath,
        );

        record.folder_path = updatedFolderPath;

        if (isFolderItem(record)) {
          record.file_path = buildWebFolderPath(
            updatedFolderPath,
            record.filename,
          );
        } else {
          const storedName = path.basename(String(record.file_path || ""));
          record.file_path = buildWebFilePath(updatedFolderPath, storedName);
        }

        await record.save();
      }

      return res.json({
        success: true,
        data: enrichFileRecord(fileRecord),
      });
    }

    const nextName = sanitizeFileName(
      ensureExtension(filename || fileRecord.filename, fileRecord.file_type),
    );

    if (!nextName) {
      return res.status(400).json({ message: "Filename is required" });
    }

    if (
      hasNameConflict(allRecords, nextParentPath, nextName, fileRecord.id)
    ) {
      return res
        .status(409)
        .json({ message: "A file with that name already exists." });
    }

    const storedName = path.basename(String(fileRecord.file_path || ""));
    const oldFileDiskPath =
      resolveStoredFilePath(fileRecord.file_path) ||
      buildPhysicalFilePath(fileRecord.folder_path, storedName);
    const newFileDiskPath = buildPhysicalFilePath(nextParentPath, storedName);

    if (
      normalizeFolderPath(fileRecord.folder_path) !== nextParentPath &&
      oldFileDiskPath &&
      fs.existsSync(oldFileDiskPath)
    ) {
      fs.mkdirSync(path.dirname(newFileDiskPath), { recursive: true });
      fs.renameSync(oldFileDiskPath, newFileDiskPath);
    }

    fileRecord.filename = nextName;
    fileRecord.folder_path = nextParentPath;
    fileRecord.file_path = buildWebFilePath(nextParentPath, storedName);
    if (!fileRecord.item_type) {
      fileRecord.item_type = FILE_ITEM;
    }
    await fileRecord.save();

    res.json({ success: true, data: enrichFileRecord(fileRecord) });
  } catch (err) {
    console.error("Error updating ATG File:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileRecord = await ATGFile.findByPk(id);

    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    if (isFolderItem(fileRecord)) {
      return res.status(400).json({ message: "Folders cannot be downloaded." });
    }

    const absolutePath =
      resolveStoredFilePath(fileRecord.file_path) ||
      buildPhysicalFilePath(
        fileRecord.folder_path,
        path.basename(String(fileRecord.file_path || "")),
      );

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found on disk" });
    }

    res.download(absolutePath, fileRecord.filename || path.basename(absolutePath));
  } catch (err) {
    console.error("Error downloading ATG File:", err);
    res.status(500).json({ error: err.message });
  }
};
