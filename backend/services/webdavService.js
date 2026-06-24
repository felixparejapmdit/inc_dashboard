const path = require("path");
const { createClient } = require("webdav");

let webdavClient = null;

const getRequiredEnv = (name) => {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
};

const normalizeRemotePath = (remotePath = "/") => {
  const rawPath = String(remotePath || "/").trim().replace(/\\/g, "/");
  const withLeadingSlash = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const normalized = path.posix.normalize(withLeadingSlash);

  if (!normalized || normalized === ".") {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

const getClient = () => {
  if (webdavClient) {
    return webdavClient;
  }

  const url = getRequiredEnv("WEBDAV_URL");
  const username = getRequiredEnv("WEBDAV_USERNAME");
  const password = getRequiredEnv("WEBDAV_PASSWORD");

  webdavClient = createClient(url.endsWith("/") ? url : `${url}/`, {
    username,
    password,
  });

  return webdavClient;
};

const formatEntry = (entry) => {
  const isDirectory = entry.type === "directory";
  const name = entry.basename || path.posix.basename(entry.filename || "") || "/";

  return {
    name,
    path: normalizeRemotePath(entry.filename || "/"),
    type: isDirectory ? "folder" : "file",
    size: isDirectory ? null : Number.isFinite(entry.size) ? entry.size : null,
    modified: entry.lastmod || entry.lastModified || null,
    mime: entry.mime || null,
  };
};

const sortEntries = (entries) =>
  [...entries].sort((left, right) => {
    const leftWeight = left.type === "folder" ? 0 : 1;
    const rightWeight = right.type === "folder" ? 0 : 1;

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    return left.name.localeCompare(right.name, undefined, {
      sensitivity: "base",
    });
  });

const listDirectory = async (remotePath = "/") => {
  const client = getClient();
  const normalizedPath = normalizeRemotePath(remotePath);
  const contents = await client.getDirectoryContents(normalizedPath);
  const items = Array.isArray(contents) ? contents : [];

  return {
    path: normalizedPath,
    items: sortEntries(
      items
        .filter((entry) => entry && entry.filename !== normalizedPath)
        .map(formatEntry),
    ),
  };
};

const uploadFile = async (remoteFolderPath = "/", file) => {
  const client = getClient();
  const folderPath = normalizeRemotePath(remoteFolderPath);
  const safeName = path.posix.basename(file?.originalname || "");

  if (!safeName) {
    throw new Error("File name is missing.");
  }

  const targetPath =
    folderPath === "/" ? `/${safeName}` : path.posix.join(folderPath, safeName);

  await client.putFileContents(targetPath, file.buffer, {
    overwrite: true,
  });

  const uploadedEntry = await client.stat(targetPath);
  return formatEntry(uploadedEntry);
};

const createFolder = async (remoteFolderPath = "/", folderName = "") => {
  const client = getClient();
  const folderPath = normalizeRemotePath(remoteFolderPath);
  const safeName = path.posix.basename(String(folderName || "").trim());

  if (!safeName) {
    throw new Error("Folder name is missing.");
  }

  const targetPath =
    folderPath === "/" ? `/${safeName}` : path.posix.join(folderPath, safeName);

  await client.createDirectory(targetPath, { recursive: false });

  return {
    path: targetPath,
    name: safeName,
    type: "folder",
  };
};

const deleteItem = async (remotePath = "") => {
  const client = getClient();
  const normalizedPath = normalizeRemotePath(remotePath);

  await client.deleteFile(normalizedPath);

  return {
    path: normalizedPath,
  };
};

module.exports = {
  deleteItem,
  createFolder,
  listDirectory,
  normalizeRemotePath,
  uploadFile,
};
