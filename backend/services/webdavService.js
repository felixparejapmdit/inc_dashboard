const path = require("path");
const { AuthType, createClient } = require("webdav");

const User = require("../models/User");
const { getWebdavSession } = require("./webdavSessionStore");

const DEFAULT_WEBDAV_BASE_URL =
  process.env.WEBDAV_DEFAULT_BASE_URL ||
  "https://drive.pmdmc.net/remote.php/dav/files/";

class WebdavServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "WebdavServiceError";
    this.statusCode = statusCode;
  }
}

const normalizeRemotePath = (remotePath = "/") => {
  const rawPath = String(remotePath || "/").trim().replace(/\\/g, "/");
  const withLeadingSlash = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const normalized = path.posix.normalize(withLeadingSlash);

  if (!normalized || normalized === ".") {
    return "/";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

const normalizeWebdavUrl = (value) => {
  const url = String(value || "").trim();

  if (!url) {
    return null;
  }

  return url.endsWith("/") ? url : `${url}/`;
};

const normalizeWebdavAccountId = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");

const buildDefaultWebdavUrl = (username) => {
  const normalizedUsername = normalizeWebdavAccountId(username);

  if (!normalizedUsername) {
    return null;
  }

  const baseUrl = normalizeWebdavUrl(DEFAULT_WEBDAV_BASE_URL);
  return normalizeWebdavUrl(`${baseUrl}${encodeURIComponent(normalizedUsername)}`);
};

const getUserWebdavUrl = async (username) => {
  const user = await User.findOne({
    where: { username },
    attributes: ["id", "username", "webdav_url"],
  });

  return normalizeWebdavUrl(user?.webdav_url);
};

const isUuidUrl = (url) => {
  if (!url) return false;
  const parts = url.replace(/\/$/, "").split("/");
  const lastPart = parts[parts.length - 1];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(lastPart);
};

const fetchLdapUuid = async (username) => {
  const ldapEnabled = process.env.LDAP_ENABLED !== "false";
  if (!ldapEnabled) {
    return null;
  }

  const ldap = require("ldapjs");
  const LDAP_URL = process.env.LDAP_URL;
  const BIND_DN = process.env.BIND_DN;
  const BIND_PASSWORD = process.env.BIND_PASSWORD;
  const BASE_DN = process.env.BASE_DN;

  if (!LDAP_URL || !BIND_DN || !BIND_PASSWORD || !BASE_DN) {
    return null;
  }

  return new Promise((resolve) => {
    const client = ldap.createClient({ url: LDAP_URL });
    client.on("error", (err) => {
      console.error("❌ LDAP client error in webdavService:", err.message);
      resolve(null);
    });

    client.bind(BIND_DN, BIND_PASSWORD, (err) => {
      if (err) {
        console.error("❌ LDAP bind error in webdavService:", err.message);
        client.unbind(() => {});
        return resolve(null);
      }

      const searchOptions = {
        filter: `(uid=${username})`,
        scope: "sub",
        attributes: ["entryUUID", "nsUniqueId", "objectGUID"],
      };

      client.search(BASE_DN, searchOptions, (searchErr, res) => {
        if (searchErr) {
          console.error("❌ LDAP search error in webdavService:", searchErr.message);
          client.unbind(() => {});
          return resolve(null);
        }

        let uuid = null;

        res.on("searchEntry", (entry) => {
          const getAttr = (name) => {
            const attr = entry.attributes.find((a) => a.type === name || a.name === name);
            return attr ? (Array.isArray(attr.vals) ? attr.vals[0] : (attr.values ? attr.values[0] : attr.vals)) : null;
          };
          uuid = getAttr("entryUUID") || getAttr("nsUniqueId") || getAttr("objectGUID");
        });

        res.on("end", () => {
          client.unbind(() => {});
          resolve(uuid);
        });

        res.on("error", (err) => {
          console.error("❌ LDAP search stream error in webdavService:", err.message);
          client.unbind(() => {});
          resolve(null);
        });
      });
    });
  });
};

const ensureUserWebdavUrl = async (username, uuid) => {
  const normalizedUsername = String(username || "").trim();

  if (!normalizedUsername) {
    throw new WebdavServiceError("User identity is missing from the session.", 401);
  }

  const user = await User.findOne({
    where: { username: normalizedUsername },
    attributes: ["id", "username", "webdav_url"],
  });

  if (!user) {
    throw new WebdavServiceError("User account was not found in the database.", 404);
  }

  const currentWebdavUrl = normalizeWebdavUrl(user.webdav_url);
  if (currentWebdavUrl && isUuidUrl(currentWebdavUrl)) {
    return currentWebdavUrl;
  }

  let finalUuid = uuid;
  if (!finalUuid) {
    finalUuid = await fetchLdapUuid(normalizedUsername);
  }

  let targetWebdavUrl;
  if (finalUuid) {
    const baseUrl = normalizeWebdavUrl(DEFAULT_WEBDAV_BASE_URL);
    targetWebdavUrl = normalizeWebdavUrl(`${baseUrl}${encodeURIComponent(finalUuid)}`);
  } else {
    targetWebdavUrl = buildDefaultWebdavUrl(normalizedUsername);
  }

  if (!targetWebdavUrl) {
    throw new WebdavServiceError("Unable to build a WebDAV URL.", 500);
  }

  if (currentWebdavUrl !== targetWebdavUrl) {
    await user.update({ webdav_url: targetWebdavUrl });
  }

  return targetWebdavUrl;
};


const createWebdavClient = ({ webdavUrl, username, password }) => {
  if (!webdavUrl) {
    throw new WebdavServiceError(
      "No WebDAV URL is configured for this user. Please add webdav_url in the users table.",
      400,
    );
  }

  if (!username || !password) {
    throw new WebdavServiceError(
      "WebDAV credentials are not available for this session. Please sign in again with your LDAP password.",
      401,
    );
  }

  return createClient(webdavUrl, {
    authType: AuthType.Password,
    username,
    password,
  });
};

const buildWebdavContext = async (username) => {
  const normalizedUsername = String(username || "").trim();

  if (!normalizedUsername) {
    throw new WebdavServiceError("User identity is missing from the session.", 401);
  }

  const webdavUrl = await ensureUserWebdavUrl(normalizedUsername);

  const session = getWebdavSession(normalizedUsername);
  if (!session?.password) {
    throw new WebdavServiceError(
      "WebDAV credentials are missing from this session. Please log in with your LDAP password again.",
      401,
    );
  }

  const client = createWebdavClient({
    webdavUrl,
    username: normalizedUsername,
    password: session.password,
  });

  return {
    client,
    username: normalizedUsername,
    webdavUrl,
  };
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

const listDirectory = async (client, remotePath = "/") => {
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

const uploadFile = async (client, remoteFolderPath = "/", file) => {
  const folderPath = normalizeRemotePath(remoteFolderPath);
  const safeName = path.posix.basename(file?.originalname || "");

  if (!safeName) {
    throw new WebdavServiceError("File name is missing.", 400);
  }

  const targetPath =
    folderPath === "/" ? `/${safeName}` : path.posix.join(folderPath, safeName);

  await client.putFileContents(targetPath, file.buffer, {
    overwrite: true,
  });

  const uploadedEntry = await client.stat(targetPath);
  return formatEntry(uploadedEntry);
};

const createFolder = async (client, remoteFolderPath = "/", folderName = "") => {
  const folderPath = normalizeRemotePath(remoteFolderPath);
  const safeName = path.posix.basename(String(folderName || "").trim());

  if (!safeName) {
    throw new WebdavServiceError("Folder name is missing.", 400);
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

const deleteItem = async (client, remotePath = "") => {
  const normalizedPath = normalizeRemotePath(remotePath);

  await client.deleteFile(normalizedPath);

  return {
    path: normalizedPath,
  };
};

module.exports = {
  WebdavServiceError,
  buildWebdavContext,
  buildDefaultWebdavUrl,
  createFolder,
  deleteItem,
  listDirectory,
  normalizeRemotePath,
  normalizeWebdavAccountId,
  normalizeWebdavUrl,
  ensureUserWebdavUrl,
  getUserWebdavUrl,
  uploadFile,
};
