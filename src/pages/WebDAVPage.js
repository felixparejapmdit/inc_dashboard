import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ArrowUp,
  Bell,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  Grid2x2,
  HardDrive,
  LayoutList,
  Menu,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  RefreshCw,
  Star,
  MoreHorizontal,
  Info,
  Tag,
  Pencil,
  Download,
  Share2,
  Activity,
  Copy,
} from "lucide-react";

import { getAuthHeaders } from "../utils/apiHeaders";
import { resolveApiBaseUrl } from "../utils/urlResolvers";

const API_BASE_URL = resolveApiBaseUrl();

const formatBytes = (value) => {
  const bytes = Number(value);

  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }

  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const formatted = bytes / 1024 ** unitIndex;

  return `${formatted >= 10 || unitIndex === 0 ? Math.round(formatted) : formatted.toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const sortEntries = (items) =>
  [...items].sort((left, right) => {
    const leftWeight = left.type === "folder" ? 0 : 1;
    const rightWeight = right.type === "folder" ? 0 : 1;

    if (leftWeight !== rightWeight) {
      return leftWeight - rightWeight;
    }

    return left.name.localeCompare(right.name, undefined, {
      sensitivity: "base",
    });
  });

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const buildBreadcrumbs = (currentPath) => {
  const segments = String(currentPath || "/")
    .split("/")
    .filter(Boolean);

  const breadcrumbs = [{ label: "All files", path: "/" }];

  segments.forEach((segment, index) => {
    breadcrumbs.push({
      label: safeDecode(segment),
      path: `/${segments.slice(0, index + 1).join("/")}`,
    });
  });

  return breadcrumbs;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const getInitials = () => {
  if (typeof window === "undefined") {
    return "FP";
  }

  const rawName =
    localStorage.getItem("displayName") ||
    localStorage.getItem("name") ||
    localStorage.getItem("username") ||
    "File";

  const parts = String(rawName)
    .replace(/[@._-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "FP";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const WebDAVPage = () => {
  const [currentPath, setCurrentPath] = useState("/");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [notice, setNotice] = useState(null);
  const [newMenuOpen, setNewMenuOpen] = useState(false);

  // New state variables
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "folders", "documents", "images"
  const [favorites, setFavorites] = useState([]);
  const [sharedPaths, setSharedPaths] = useState([]);
  const [allFilesFilter, setAllFilesFilter] = useState("all"); // "all", "recent", "favorites", "shares"
  const [showAllFilesMenu, setShowAllFilesMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Connected to PMD Nextcloud WebDAV server.",
      time: new Date(Date.now() - 5 * 60 * 1000),
      unread: false,
    },
  ]);
  const [usersList, setUsersList] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStorage, setShowStorage] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showPeopleSidebar, setShowPeopleSidebar] = useState(false);
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [shareSuccessNotice, setShareSuccessNotice] = useState("");

  // States for file preview modal, details sidebar, and context menus
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isEditingText, setIsEditingText] = useState(false);

  const [activeDetailsEntry, setActiveDetailsEntry] = useState(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState("sharing"); // "sharing" or "activity"
  const [activeRowMenu, setActiveRowMenu] = useState(null);

  const fileInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const currentPathRef = useRef("/");
  const newMenuRef = useRef(null);

  // New refs for click outside
  const typeMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const storageRef = useRef(null);
  const profileRef = useRef(null);
  const peopleSidebarRef = useRef(null);
  const peopleButtonRef = useRef(null);
  const allFilesMenuRef = useRef(null);

  useEffect(() => {
    currentPathRef.current = currentPath;
    setSelectedPaths([]);
  }, [currentPath]);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  // Click outside handlers
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target)) {
        setNewMenuOpen(false);
      }
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target)) {
        setShowTypeMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (storageRef.current && !storageRef.current.contains(event.target)) {
        setShowStorage(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (allFilesMenuRef.current && !allFilesMenuRef.current.contains(event.target)) {
        setShowAllFilesMenu(false);
      }
      if (
        peopleSidebarRef.current &&
        !peopleSidebarRef.current.contains(event.target) &&
        peopleButtonRef.current &&
        !peopleButtonRef.current.contains(event.target)
      ) {
        setShowPeopleSidebar(false);
      }
      if (!event.target.closest(".item-context-menu-btn") && !event.target.closest(".item-context-menu")) {
        setActiveRowMenu(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: getAuthHeaders(),
        });
        const payload = response.data?.data || response.data || [];
        setUsersList(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("Failed to fetch user directory:", err);
      }
    };
    fetchUsers();
  }, []);

  const addNotification = (message) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        text: message,
        time: new Date(),
        unread: true,
      },
      ...prev,
    ]);
  };

  const handleSignOut = async () => {
    const username = localStorage.getItem("username");
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, { userId: username }, {
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error("Logout API failed:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("displayName");
    window.location.href = "/login";
  };

  const handleShareWithUser = (user) => {
    setSharingInProgress(true);
    setShareSuccessNotice("");

    setTimeout(() => {
      setSharingInProgress(false);
      setShareSuccessNotice(`Shared successfully with ${user.givenName}!`);
      addNotification(`Shared ${selectedPaths.length} items with ${user.givenName} ${user.sn}`);
      setSharedPaths((prev) => [...new Set([...prev, ...selectedPaths])]);
      setSelectedPaths([]); // clear selections
      
      setTimeout(() => {
        setShareSuccessNotice("");
      }, 3000);
    }, 800);
  };

  const loadDirectory = useCallback(async (targetPath = "/") => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/webdav/list`, {
        params: { path: targetPath },
        headers: getAuthHeaders(),
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const payload = response.data?.data || response.data || {};
      const nextEntries = Array.isArray(payload.items) ? payload.items : [];

      setEntries(sortEntries(nextEntries));
      setCurrentPath(payload.path || targetPath || "/");
      setSelectedPaths([]);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setEntries([]);
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not load this folder."),
      });
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const visibleEntries = useMemo(() => {
    let result = entries;

    // Apply all files filter (All, Recent, Favorites, Shares)
    if (allFilesFilter === "favorites") {
      result = result.filter((entry) => favorites.includes(entry.path));
    } else if (allFilesFilter === "recent") {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(
        (entry) => entry.type === "file" && new Date(entry.modified).getTime() > sevenDaysAgo
      );
    } else if (allFilesFilter === "shares") {
      result = result.filter((entry) => sharedPaths.includes(entry.path));
    }

    // Apply type filter
    if (typeFilter === "folders") {
      result = result.filter((entry) => entry.type === "folder");
    } else if (typeFilter === "documents") {
      const docExts = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"];
      result = result.filter(
        (entry) =>
          entry.type === "file" &&
          docExts.some((ext) => entry.name.toLowerCase().endsWith(ext)),
      );
    } else if (typeFilter === "images") {
      const imgExts = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"];
      result = result.filter(
        (entry) =>
          entry.type === "file" &&
          imgExts.some((ext) => entry.name.toLowerCase().endsWith(ext)),
      );
    }

    // Apply search query filter
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return result;
    }

    return result.filter((entry) => {
      const haystack = [
        entry.name,
        entry.type,
        formatBytes(entry.size),
        formatDate(entry.modified),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [entries, searchQuery, typeFilter, allFilesFilter, favorites, sharedPaths]);

  const folderCount = visibleEntries.filter((entry) => entry.type === "folder").length;
  const fileCount = visibleEntries.length - folderCount;
  const totalSize = visibleEntries.reduce(
    (sum, entry) => sum + (entry.type === "file" && Number.isFinite(entry.size) ? entry.size : 0),
    0,
  );
  const allVisibleSelected =
    visibleEntries.length > 0 &&
    visibleEntries.every((entry) => selectedPaths.includes(entry.path));

  const breadcrumbs = buildBreadcrumbs(currentPath);
  const avatarInitials = getInitials();

  const quotaBytes = 10 * 1024 * 1024 * 1024; // 10 GB
  const baselineUsedBytes = 1.2 * 1024 * 1024 * 1024; // 1.2 GB baseline
  const currentUsedBytes = baselineUsedBytes + entries.reduce((sum, entry) => sum + (entry.type === "file" && Number.isFinite(entry.size) ? entry.size : 0), 0);
  const usedPercentage = Math.min((currentUsedBytes / quotaBytes) * 100, 100);

  const openFolder = (path) => {
    if (!path || path === currentPath) {
      return;
    }

    setCurrentPath(path);
  };

  const goUp = () => {
    if (currentPath === "/") {
      return;
    }

    const segments = currentPath.split("/").filter(Boolean);
    segments.pop();
    setCurrentPath(segments.length ? `/${segments.join("/")}` : "/");
  };

  const handleFileClick = async (entry) => {
    setActivePreviewFile(entry);
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewContent("");
    setPreviewUrl("");
    setIsEditingText(false);

    const ext = "." + entry.name.split(".").pop().toLowerCase();
    const textExts = [".txt", ".md", ".json", ".js", ".css", ".html", ".log"];
    const imageExts = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"];
    const pdfExts = [".pdf"];

    try {
      const isText = textExts.includes(ext);
      const isBinary = imageExts.includes(ext) || pdfExts.includes(ext);

      if (isText) {
        const response = await axios.get(`${API_BASE_URL}/api/webdav/file`, {
          params: { path: entry.path },
          responseType: "text",
          headers: getAuthHeaders(),
        });
        setPreviewContent(response.data);
      } else if (isBinary) {
        const response = await axios.get(`${API_BASE_URL}/api/webdav/file`, {
          params: { path: entry.path },
          responseType: "blob",
          headers: getAuthHeaders(),
        });
        const url = URL.createObjectURL(response.data);
        setPreviewUrl(url);
      }
    } catch (error) {
      console.error("Preview failed:", error);
      setPreviewError(
        error?.response?.data?.message ||
        error?.message ||
        "Could not load preview for this file."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setActivePreviewFile(null);
    setPreviewContent("");
    setPreviewUrl("");
    setIsEditingText(false);
  };

  const handleSaveTextFile = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/webdav/write`,
        {
          path: activePreviewFile.path,
          content: previewContent,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      setNotice({
        type: "success",
        text: `Saved changes to ${activePreviewFile.name}`,
      });
      addNotification(`Edited file: ${activePreviewFile.name}`);
      setIsEditingText(false);
      await loadDirectory(currentPathRef.current);
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not save the file changes."),
      });
    }
  };

  const handleCreateTextFile = async () => {
    setNewMenuOpen(false);

    const filename = window.prompt("New text file name (e.g. notes.txt)");
    let trimmedName = String(filename || "").trim();

    if (!trimmedName) {
      return;
    }

    if (!trimmedName.toLowerCase().endsWith(".txt")) {
      trimmedName += ".txt";
    }

    setCreatingFolder(true);

    try {
      const folderPath = currentPathRef.current;
      const targetFilePath = folderPath === "/" ? `/${trimmedName}` : `${folderPath}/${trimmedName}`;

      await axios.post(
        `${API_BASE_URL}/api/webdav/write`,
        {
          path: targetFilePath,
          content: "",
        },
        {
          headers: getAuthHeaders(),
        },
      );

      setNotice({
        type: "success",
        text: `${trimmedName} was created.`,
      });
      addNotification(`Created file: ${trimmedName}`);

      await loadDirectory(folderPath);
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not create the text file."),
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleRename = async (entry) => {
    setActiveRowMenu(null);
    const newName = window.prompt("Rename to:", entry.name);
    const trimmed = String(newName || "").trim();
    if (!trimmed || trimmed === entry.name) return;

    try {
      const segments = entry.path.split("/").filter(Boolean);
      segments.pop();
      const parentDir = segments.length ? `/${segments.join("/")}` : "/";
      const targetPath = parentDir === "/" ? `/${trimmed}` : `${parentDir}/${trimmed}`;

      await axios.post(
        `${API_BASE_URL}/api/webdav/rename`,
        { from: entry.path, to: targetPath },
        { headers: getAuthHeaders() }
      );

      setNotice({
        type: "success",
        text: `Renamed to ${trimmed}`,
      });
      addNotification(`Renamed ${entry.name} to ${trimmed}`);
      await loadDirectory(currentPathRef.current);
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not rename the item."),
      });
    }
  };

  const handleDownloadFile = async (entry) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/webdav/file`, {
        params: { path: entry.path },
        responseType: "blob",
        headers: getAuthHeaders(),
      });

      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = entry.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not download the file."),
      });
    }
  };

  const openDetails = (entry) => {
    setActiveDetailsEntry(entry);
    setActiveDetailsTab("sharing");
    setActiveRowMenu(null);
  };

  const toggleRowMenu = (event, path) => {
    event.stopPropagation();
    setActiveRowMenu((prev) => (prev === path ? null : path));
  };

  const handleRefresh = () => {
    loadDirectory(currentPathRef.current);
  };

  const openUploadDialog = () => {
    setNewMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedPaths([]);
      return;
    }

    setSelectedPaths(visibleEntries.map((entry) => entry.path));
  };

  const toggleSelected = (path) => {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path],
    );
  };

  const handleFileChange = async (event) => {
    const folderPath = currentPathRef.current;
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("path", folderPath);
      formData.append("file", file);

      await axios.post(`${API_BASE_URL}/api/webdav/upload`, formData, {
        headers: getAuthHeaders(),
      });

      setNotice({
        type: "success",
        text: `${file.name} was uploaded.`,
      });
      addNotification(`Uploaded file: ${file.name}`);

      if (folderPath === currentPathRef.current) {
        await loadDirectory(folderPath);
      }
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not upload the file."),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    setNewMenuOpen(false);

    const folderName = window.prompt("New folder name");
    const trimmedName = String(folderName || "").trim();

    if (!trimmedName) {
      return;
    }

    setCreatingFolder(true);

    try {
      const folderPath = currentPathRef.current;

      await axios.post(
        `${API_BASE_URL}/api/webdav/folder`,
        {
          path: folderPath,
          name: trimmedName,
        },
        {
          headers: getAuthHeaders(),
        },
      );

      setNotice({
        type: "success",
        text: `${trimmedName} was created.`,
      });
      addNotification(`Created folder: ${trimmedName}`);

      await loadDirectory(folderPath);
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not create the folder."),
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDelete = async (entry) => {
    const confirmed = window.confirm(`Delete ${entry.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      const folderPath = currentPathRef.current;

      await axios.delete(`${API_BASE_URL}/api/webdav/item`, {
        params: { path: entry.path },
        headers: getAuthHeaders(),
      });

      setNotice({
        type: "success",
        text: `${entry.name} was deleted.`,
      });
      addNotification(`Deleted item: ${entry.name}`);

      if (folderPath === currentPathRef.current) {
        await loadDirectory(folderPath);
      }
    } catch (error) {
      setNotice({
        type: "error",
        text: getErrorMessage(error, "We could not delete the file."),
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#f5f7fb] text-slate-900 relative">
      <header className="flex h-14 items-center gap-4 bg-[#58a8e4] px-4 text-white shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-wide">PMD Nextcloud</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label="Refresh files"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((val) => !val);
                setShowStorage(false);
                setShowProfile(false);
                setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
              }}
              className="relative rounded-full p-2 transition hover:bg-white/10"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications.some((n) => n.unread) && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl text-slate-800">
                <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-semibold text-sm">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setNotifications([])}
                      className="text-xs font-medium text-[#208ded] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="py-2 border-b border-slate-50 last:border-b-0">
                        <p className="text-xs font-normal text-slate-750">{n.text}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(n.time)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Storage Quota Dropdown */}
          <div className="relative" ref={storageRef}>
            <button
              type="button"
              onClick={() => {
                setShowStorage((val) => !val);
                setShowNotifications(false);
                setShowProfile(false);
              }}
              className="rounded-full p-2 transition hover:bg-white/10"
              aria-label="Storage"
            >
              <HardDrive className="h-4 w-4" />
            </button>

            {showStorage && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl text-slate-800">
                <span className="font-semibold text-sm block mb-3">Storage Space</span>
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
                  <span>{formatBytes(currentUsedBytes)} used</span>
                  <span>10 GB total</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#208ded] rounded-full transition-all duration-500"
                    style={{ width: `${usedPercentage}%` }}
                  />
                </div>
                <p className="mt-3 text-[10px] text-slate-400 leading-normal">
                  Your files are stored securely on the PMD Nextcloud server.
                </p>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfile((val) => !val);
                setShowNotifications(false);
                setShowStorage(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7efe7] text-xs font-semibold text-[#58a8e4] ring-2 ring-white/20"
              aria-label="User profile"
            >
              {avatarInitials}
            </button>

            {showProfile && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl text-slate-800">
                <div className="px-3 py-2 border-b border-slate-100 mb-2">
                  <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {localStorage.getItem("displayName") || localStorage.getItem("username") || "User"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-normal truncate">
                    {localStorage.getItem("role") ? `${localStorage.getItem("role")} Group` : "LDAP Account"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 max-w-[70%] overflow-hidden">
          {/* Search box aligned to left side of New button */}
          <div className="flex w-48 sm:w-56 md:w-64 items-center rounded-lg bg-slate-105 px-3 py-1.5 border border-slate-200 shrink-0">
            <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search files..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </div>

          <div className="relative shrink-0" ref={newMenuRef}>
            <button
              type="button"
              onClick={() => setNewMenuOpen((value) => !value)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#208ded] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#1b7dd0]"
              disabled={uploading || creatingFolder}
            >
              <Plus className="h-4 w-4" />
              New
            </button>

            {newMenuOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <button
                  type="button"
                  onClick={openUploadDialog}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <Upload className="h-4 w-4 text-[#208ded]" />
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <FolderPlus className="h-4 w-4 text-[#208ded]" />
                  New folder
                </button>
                <button
                  type="button"
                  onClick={handleCreateTextFile}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <FileText className="h-4 w-4 text-[#208ded]" />
                  New text document (.txt)
                </button>
              </div>
            )}
          </div>

          {/* Compact breadcrumbs with dropdown filter */}
          <div className="flex items-center gap-1 overflow-x-auto text-sm font-semibold text-slate-700 scrollbar-none pr-1">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-1 shrink-0">
                {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />}
                {index === 0 ? (
                  <div className="relative shrink-0" ref={allFilesMenuRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllFilesMenu((val) => !val);
                        setNewMenuOpen(false);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 animate-fade-in"
                    >
                      {allFilesFilter === "all" && "All files"}
                      {allFilesFilter === "favorites" && "Favorites"}
                      {allFilesFilter === "recent" && "Recent"}
                      {allFilesFilter === "shares" && "Shared"}
                      <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                    </button>

                    {showAllFilesMenu && (
                      <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl text-slate-800 font-normal">
                        <button
                          type="button"
                          onClick={() => {
                            setAllFilesFilter("all");
                            setCurrentPath("/");
                            setShowAllFilesMenu(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                            allFilesFilter === "all" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                          }`}
                        >
                          All files
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAllFilesFilter("recent");
                            setShowAllFilesMenu(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                            allFilesFilter === "recent" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                          }`}
                        >
                          Recent
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAllFilesFilter("favorites");
                            setShowAllFilesMenu(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                            allFilesFilter === "favorites" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                          }`}
                        >
                          Favorites
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAllFilesFilter("shares");
                            setShowAllFilesMenu(false);
                          }}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                            allFilesFilter === "shares" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                          }`}
                        >
                          Shared with others
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openFolder(crumb.path)}
                    className={`rounded-lg px-2 py-1.5 text-sm font-semibold transition ${
                      crumb.path === currentPath
                        ? "bg-[#e8f4fd] text-[#208ded] cursor-default shrink-0"
                        : "hover:bg-slate-100 hover:text-slate-800 shrink-0"
                    }`}
                  >
                    {crumb.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goUp}
            disabled={currentPath === "/"}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
          >
            <ArrowUp className="h-4 w-4" />
            Up
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 shrink-0">
          {/* Type Filter */}
          <div className="relative" ref={typeMenuRef}>
            <button
              type="button"
              onClick={() => {
                setShowTypeMenu((val) => !val);
                setShowPeopleSidebar(false);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-100 ${
                typeFilter !== "all" ? "bg-[#e8f4fd] text-[#208ded]" : ""
              }`}
            >
              <LayoutList className="h-4 w-4 text-slate-500" />
              Type {typeFilter !== "all" && `(${typeFilter})`}
            </button>

            {showTypeMenu && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl text-slate-800 font-normal">
                <button
                  type="button"
                  onClick={() => { setTypeFilter("all"); setShowTypeMenu(false); }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                    typeFilter === "all" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                  }`}
                >
                  All files
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("folders"); setShowTypeMenu(false); }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                    typeFilter === "folders" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                  }`}
                >
                  Folders
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("documents"); setShowTypeMenu(false); }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                    typeFilter === "documents" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                  }`}
                >
                  Documents
                </button>
                <button
                  type="button"
                  onClick={() => { setTypeFilter("images"); setShowTypeMenu(false); }}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-slate-100 ${
                    typeFilter === "images" ? "bg-slate-50 font-semibold text-[#208ded]" : ""
                  }`}
                >
                  Images
                </button>
              </div>
            )}
          </div>

          {/* People / Sharing */}
          <button
            ref={peopleButtonRef}
            type="button"
            onClick={() => {
              setShowPeopleSidebar((val) => !val);
              setShowTypeMenu(false);
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-100 ${
              showPeopleSidebar ? "bg-[#e8f4fd] text-[#208ded]" : ""
            }`}
          >
            <Users className="h-4 w-4 text-slate-500" />
            People
          </button>

          {/* Grid/List View Toggle */}
          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === "list" ? "grid" : "list"))}
            className={`inline-flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-100 ${
              viewMode === "grid" ? "bg-[#e8f4fd] text-[#208ded]" : ""
            }`}
          >
            <Grid2x2 className="h-4 w-4 text-slate-500" />
            Grid
          </button>
        </div>
      </div>

      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        {notice && (
          <div
            className={`mx-8 mt-5 rounded-2xl border px-4 py-3 ${notice.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
          >
            {notice.text}
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden px-2 pb-0 pt-4">
          {viewMode === "list" ? (
            <>
              <div className="grid grid-cols-[40px_40px_minmax(0,1fr)_120px_100px_150px_90px] items-center border-b border-slate-200 px-6 py-3 text-sm font-medium text-slate-500">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected && visibleEntries.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-[#208ded] focus:ring-[#208ded]"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-slate-400" />
                </div>
                <div className="pl-2">Name</div>
                <div>Type</div>
                <div>Size</div>
                <div>Modified</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="flex-1 overflow-auto">
                {loading && visibleEntries.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Loading files...
                  </div>
                ) : visibleEntries.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No items found.
                  </div>
                ) : (
                  visibleEntries.map((entry) => {
                    const isSelected = selectedPaths.includes(entry.path);

                    return (
                      <div
                        key={entry.path}
                        className={`grid grid-cols-[40px_40px_minmax(0,1fr)_120px_100px_150px_90px] items-center border-b border-slate-100 px-6 py-2.5 text-sm transition hover:bg-[#f8fbfe] ${
                          isSelected ? "bg-[#eaf5ff]" : "bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelected(entry.path)}
                            className="h-4 w-4 rounded border-slate-300 text-[#208ded] focus:ring-[#208ded]"
                          />
                        </div>

                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setFavorites((prev) =>
                                prev.includes(entry.path)
                                  ? prev.filter((p) => p !== entry.path)
                                  : [...prev, entry.path]
                              );
                            }}
                            className={`p-1 rounded-full transition shrink-0 ${
                              favorites.includes(entry.path)
                                ? "text-amber-400 hover:bg-amber-50"
                                : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
                            }`}
                            aria-label="Toggle favorite"
                          >
                            <Star className={`h-4 w-4 ${favorites.includes(entry.path) ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (entry.type === "folder") {
                                openFolder(entry.path);
                              } else {
                                handleFileClick(entry);
                              }
                            }}
                            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1 text-left transition cursor-pointer hover:bg-slate-50"
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                entry.type === "folder"
                                  ? "bg-[#e8f4fd] text-[#208ded]"
                                  : "bg-slate-100 text-slate-550"
                              }`}
                            >
                              {entry.type === "folder" ? (
                                <Folder className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate font-medium text-slate-900 font-sans">
                                {entry.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {entry.type === "folder" ? "Folder" : "File"}
                              </div>
                            </div>
                          </button>
                        </div>

                        <div className="text-slate-650 font-normal">
                          {entry.type === "folder" ? "Folder" : "File"}
                        </div>
                        <div className="text-slate-650 font-normal">
                          {entry.type === "folder" ? "—" : formatBytes(entry.size)}
                        </div>
                        <div className="text-slate-650 font-normal">{formatDate(entry.modified)}</div>
                        
                        <div className="flex items-center justify-end relative">
                          <button
                            type="button"
                            onClick={(e) => toggleRowMenu(e, entry.path)}
                            className="item-context-menu-btn rounded-full p-2 text-slate-450 hover:bg-slate-100 hover:text-slate-800 transition"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {activeRowMenu === entry.path && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="item-context-menu absolute right-0 top-[calc(100%+4px)] z-20 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl text-slate-800 font-normal text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFavorites((prev) =>
                                    prev.includes(entry.path)
                                      ? prev.filter((p) => p !== entry.path)
                                      : [...prev, entry.path]
                                  );
                                  setActiveRowMenu(null);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-slate-50 transition"
                              >
                                <Star className={`h-3.5 w-3.5 text-amber-400 shrink-0 ${favorites.includes(entry.path) ? "fill-current" : ""}`} />
                                {favorites.includes(entry.path) ? "Remove favorite" : "Add to favorites"}
                              </button>
                              <button
                                type="button"
                                onClick={() => openDetails(entry)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-slate-50 transition"
                              >
                                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRename(entry)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-slate-50 transition"
                              >
                                <Pencil className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                Rename
                              </button>
                              {entry.type === "file" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowMenu(null);
                                    handleDownloadFile(entry);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-slate-50 transition"
                                >
                                  <Download className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                  Download
                                </button>
                              )}
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowMenu(null);
                                  handleDelete(entry);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 transition font-medium"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto p-6">
              {loading && visibleEntries.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Loading files...
                </div>
              ) : visibleEntries.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No items found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleEntries.map((entry) => {
                    const isSelected = selectedPaths.includes(entry.path);

                    return (
                      <div
                        key={entry.path}
                        className={`relative flex flex-col p-4 rounded-2xl border transition hover:shadow-md ${
                          isSelected
                            ? "bg-[#eaf5ff] border-[#208ded] shadow-sm"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {/* Checkbox overlay top-left */}
                        <div className="absolute top-3 left-3 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelected(entry.path)}
                            className="h-4 w-4 rounded border-slate-300 text-[#208ded] focus:ring-[#208ded]"
                          />
                        </div>

                        {/* Star overlay next to checkbox */}
                        <div className="absolute top-3 left-9 z-10">
                          <button
                            type="button"
                            onClick={() => {
                              setFavorites((prev) =>
                                prev.includes(entry.path)
                                  ? prev.filter((p) => p !== entry.path)
                                  : [...prev, entry.path]
                              );
                            }}
                            className={`p-1 rounded-full transition ${
                              favorites.includes(entry.path)
                                ? "text-amber-400 hover:bg-amber-50"
                                : "text-slate-300 hover:text-slate-550 hover:bg-slate-100"
                            }`}
                            aria-label="Toggle favorite"
                          >
                            <Star className={`h-3.5 w-3.5 ${favorites.includes(entry.path) ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        {/* More Actions menu top-right */}
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            type="button"
                            onClick={(e) => toggleRowMenu(e, entry.path)}
                            className="item-context-menu-btn rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>

                          {activeRowMenu === entry.path && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="item-context-menu absolute right-0 top-[calc(100%+4px)] z-20 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl text-slate-800 font-normal text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setFavorites((prev) =>
                                    prev.includes(entry.path)
                                      ? prev.filter((p) => p !== entry.path)
                                      : [...prev, entry.path]
                                  );
                                  setActiveRowMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-slate-50 transition"
                              >
                                <Star className={`h-3 w-3 text-amber-400 shrink-0 ${favorites.includes(entry.path) ? "fill-current" : ""}`} />
                                Favorite
                              </button>
                              <button
                                type="button"
                                onClick={() => openDetails(entry)}
                                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-slate-50 transition"
                              >
                                <Info className="h-3 w-3 text-blue-500 shrink-0" />
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRename(entry)}
                                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-slate-50 transition"
                              >
                                <Pencil className="h-3 w-3 text-purple-500 shrink-0" />
                                Rename
                              </button>
                              {entry.type === "file" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveRowMenu(null);
                                    handleDownloadFile(entry);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs hover:bg-slate-50 transition"
                                >
                                  <Download className="h-3 w-3 text-blue-600 shrink-0" />
                                  Download
                                </button>
                              )}
                              <div className="my-1 border-t border-slate-100" />
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRowMenu(null);
                                  handleDelete(entry);
                                }}
                                className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 transition font-medium"
                              >
                                <Trash2 className="h-3 w-3 text-rose-600 shrink-0" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div
                          onClick={() => {
                            if (entry.type === "folder") {
                              openFolder(entry.path);
                            } else {
                              handleFileClick(entry);
                            }
                          }}
                          className="flex flex-col items-center justify-center text-center mt-4 cursor-pointer"
                        >
                          <span
                            className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-3 ${
                              entry.type === "folder"
                                ? "bg-[#e8f4fd] text-[#208ded]"
                                : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {entry.type === "folder" ? (
                              <Folder className="h-8 w-8" />
                            ) : (
                              <FileText className="h-8 w-8" />
                            )}
                          </span>

                          <div className="w-full px-2">
                            <p className="text-sm font-semibold text-slate-850 truncate mb-0.5" title={entry.name}>
                              {entry.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {entry.type === "folder" ? "Folder" : formatBytes(entry.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4 text-sm text-slate-500 shrink-0">
            <span>
              {fileCount} files · {folderCount} folders
            </span>
            <span>{formatBytes(totalSize)}</span>
          </div>
        </div>
      </main>

      {/* People Sidebar Panel */}
      {showPeopleSidebar && (
        <div
          ref={peopleSidebarRef}
          className="fixed inset-y-0 right-0 z-30 w-80 bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 bg-slate-50">
            <span className="font-semibold text-slate-800">Colleagues & Sharing</span>
            <button
              type="button"
              onClick={() => setShowPeopleSidebar(false)}
              className="text-slate-400 hover:text-slate-650 text-sm font-semibold p-1 hover:bg-slate-100 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedPaths.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-[#e8f4fd] p-3 text-xs text-[#208ded] font-medium leading-normal">
                  Share {selectedPaths.length} selected item(s) with colleagues.
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={shareSearchQuery}
                    onChange={(e) => setShareSearchQuery(e.target.value)}
                    placeholder="Search colleagues..."
                    className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#208ded] transition bg-slate-50"
                  />
                </div>

                {shareSuccessNotice && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 font-medium">
                    {shareSuccessNotice}
                  </div>
                )}

                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mt-2">
                  Select a colleague
                </span>

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {usersList
                    .filter((u) => {
                      const name = `${u.givenName || ""} ${u.sn || ""}`.toLowerCase();
                      return name.includes(shareSearchQuery.toLowerCase()) || u.uid?.toLowerCase().includes(shareSearchQuery.toLowerCase());
                    })
                    .map((user) => {
                      const initials = `${user.givenName?.[0] || ""}${user.sn?.[0] || ""}`.toUpperCase() || user.uid?.[0].toUpperCase();
                      return (
                        <div
                          key={user.uid}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition border border-slate-100 bg-white"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf5ff] text-xs font-semibold text-[#208ded]">
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {user.givenName} {user.sn}
                              </p>
                              <p className="text-[10px] text-slate-405 truncate">{user.groupName || "Member"}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleShareWithUser(user)}
                            className="bg-[#208ded] hover:bg-[#1b7dd0] text-white text-[10px] font-semibold px-2 py-1 rounded-lg shadow-sm"
                            disabled={sharingInProgress}
                          >
                            Share
                          </button>
                        </div>
                      );
                    })}
                  {usersList.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No colleagues found.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-500 leading-normal">
                  To share files, check items from the list/grid, then open this sidebar to select a colleague.
                </p>

                <div className="relative mt-2">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    value={shareSearchQuery}
                    onChange={(e) => setShareSearchQuery(e.target.value)}
                    placeholder="Search colleagues..."
                    className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#208ded] transition bg-slate-50"
                  />
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mt-2">
                  Colleagues Directory ({usersList.length})
                </span>

                <div className="flex flex-col gap-2">
                  {usersList
                    .filter((u) => {
                      const name = `${u.givenName || ""} ${u.sn || ""}`.toLowerCase();
                      return name.includes(shareSearchQuery.toLowerCase()) || u.uid?.toLowerCase().includes(shareSearchQuery.toLowerCase());
                    })
                    .map((user) => {
                      const initials = `${user.givenName?.[0] || ""}${user.sn?.[0] || ""}`.toUpperCase() || user.uid?.[0].toUpperCase();
                      return (
                        <div
                          key={user.uid}
                          className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 transition bg-white"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f7efe7] text-xs font-semibold text-[#58a8e4]">
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {user.givenName} {user.sn}
                            </p>
                            <p className="text-[10px] text-slate-405 truncate">{user.mail || user.uid}</p>
                            <p className="text-[9px] text-[#208ded] font-medium mt-0.5">{user.groupName || "Colleague"}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sharing & Details Drawer Sidebar */}
      {activeDetailsEntry && (
        <div className="fixed inset-y-0 right-0 z-35 w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-all duration-300 transform translate-x-0">
          {/* Header */}
          <div className="flex flex-col p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Item Details
              </span>
              <button
                type="button"
                onClick={() => setActiveDetailsEntry(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 hover:bg-slate-100 rounded-lg transition"
              >
                Close
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5ff] text-[#208ded] shrink-0">
                {activeDetailsEntry.type === "folder" ? (
                  <Folder className="h-6 w-6" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate" title={activeDetailsEntry.name}>
                  {activeDetailsEntry.name}
                </p>
                <p className="text-xs text-slate-450 font-medium">
                  {activeDetailsEntry.type === "folder" ? "Folder" : formatBytes(activeDetailsEntry.size)} · {formatDate(activeDetailsEntry.modified)}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/20">
            <button
              type="button"
              onClick={() => setActiveDetailsTab("sharing")}
              className={`flex-1 py-3 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
                activeDetailsTab === "sharing"
                  ? "border-[#208ded] text-[#208ded] bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Share2 className="h-4 w-4" />
              Sharing
            </button>
            <button
              type="button"
              onClick={() => setActiveDetailsTab("activity")}
              className={`flex-1 py-3 text-center text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
                activeDetailsTab === "activity"
                  ? "border-[#208ded] text-[#208ded] bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Activity className="h-4 w-4" />
              Activity
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-700">
            {activeDetailsTab === "sharing" ? (
              <div className="space-y-4">
                {/* Internal shares */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-700">Internal shares</span>
                    <Info className="h-3 w-3 text-slate-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type names or teams"
                      className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#208ded] bg-slate-50 transition"
                    />
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Others with access */}
                <div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-700 font-sans">Others with access</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f7efe7] text-[10px] font-bold text-[#58a8e4]">
                          FP
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">Felix Pareja (Owner)</p>
                          <p className="text-[9px] text-slate-400">Full access</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Link */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Internal link</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/uploads${activeDetailsEntry.path}`}
                      className="flex-1 px-3 py-2 text-[10px] font-mono border border-slate-200 rounded-xl bg-slate-50 text-slate-500 outline-none truncate"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/uploads${activeDetailsEntry.path}`);
                        alert("Link copied to clipboard!");
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 transition shadow-sm"
                      title="Copy link"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-650" />
                    </button>
                  </div>
                </div>

                {/* External shares */}
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-700">External shares</span>
                    <Info className="h-3 w-3 text-slate-400" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type an email"
                      className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#208ded] bg-slate-50 transition"
                    />
                    <ChevronDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Create public link button */}
                <button
                  type="button"
                  onClick={() => alert("Public link created successfully!")}
                  className="w-full py-2 bg-[#208ded] hover:bg-[#1b7dd0] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <Plus className="h-4 w-4" />
                  Create public link
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Activity Log
                </span>
                <div className="relative pl-6 border-l border-slate-200 space-y-5 text-xs text-slate-600">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#208ded]">
                      ✓
                    </span>
                    <p className="font-semibold text-slate-800">File created</p>
                    <p className="text-[10px] text-slate-400">By Felix Pareja · 2 hours ago</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-amber-105 text-[10px] font-bold text-amber-500">
                      ★
                    </span>
                    <p className="font-semibold text-slate-850">Added to Favorites</p>
                    <p className="text-[10px] text-slate-400">By System · 1 hour ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {activePreviewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity duration-200">
          <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf5ff] text-[#208ded]">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-slate-850 text-base" title={activePreviewFile.name}>
                    {activePreviewFile.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {formatBytes(activePreviewFile.size)} · Modified {formatDate(activePreviewFile.modified)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadFile(activePreviewFile)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Download
                </button>
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-slate-50/30 p-6 flex flex-col items-center justify-center">
              {previewLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="h-8 w-8 text-[#208ded] animate-spin" />
                  <p className="text-sm font-medium text-slate-500">Loading preview...</p>
                </div>
              ) : previewError ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-rose-650 mb-2">Could not load preview</p>
                  <p className="text-xs text-slate-400 mb-4 max-w-md">{previewError}</p>
                  <button
                    type="button"
                    onClick={() => handleFileClick(activePreviewFile)}
                    className="rounded-xl bg-[#208ded] hover:bg-[#1b7dd0] text-white text-xs font-medium px-4 py-2"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {(() => {
                    const ext = "." + activePreviewFile.name.split(".").pop().toLowerCase();
                    if ([".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"].includes(ext)) {
                      return (
                        <div className="max-h-full max-w-full overflow-auto rounded-xl border border-slate-150 bg-white p-2 shadow-sm">
                          <img
                            src={previewUrl}
                            alt={activePreviewFile.name}
                            className="max-h-[60vh] object-contain mx-auto rounded-lg"
                          />
                        </div>
                      );
                    }
                    if ([".pdf"].includes(ext)) {
                      return (
                        <iframe
                          src={previewUrl}
                          title={activePreviewFile.name}
                          className="w-full h-full rounded-xl border border-slate-200 bg-white shadow-inner"
                        />
                      );
                    }
                    if ([".txt", ".md", ".json", ".js", ".css", ".html", ".log"].includes(ext)) {
                      return (
                        <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-2">
                            <span className="text-xs text-slate-400 font-medium font-sans">
                              {isEditingText ? "Editing File Contents..." : "Read-only preview"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsEditingText(!isEditingText)}
                              className="text-xs font-semibold text-[#208ded] hover:underline"
                            >
                              {isEditingText ? "Cancel Edit" : "Edit File"}
                            </button>
                          </div>
                          {isEditingText ? (
                            <div className="flex-1 flex flex-col p-4">
                              <textarea
                                value={previewContent}
                                onChange={(e) => setPreviewContent(e.target.value)}
                                className="flex-1 w-full p-3 font-mono text-sm border border-slate-200 rounded-xl outline-none focus:border-[#208ded] resize-none"
                              />
                              <div className="flex justify-end gap-2 mt-3">
                                <button
                                  type="button"
                                  onClick={() => setIsEditingText(false)}
                                  className="px-3 py-1.5 text-xs font-semibold text-slate-650 rounded-lg hover:bg-slate-50"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveTextFile}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#208ded] hover:bg-[#1b7dd0] rounded-lg shadow-sm"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <pre className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-750 whitespace-pre-wrap select-text leading-relaxed text-left w-full">
                              {previewContent || <span className="text-slate-400 italic">Empty file</span>}
                            </pre>
                          )}
                        </div>
                      );
                    }
                    
                    // Fallback preview
                    return (
                      <div className="text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-sm flex flex-col items-center">
                        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 mb-4 ring-4 ring-slate-50/50">
                          <FileText className="h-10 w-10 text-slate-500" />
                        </span>
                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{activePreviewFile.name}</h4>
                        <p className="text-xs text-slate-400 mb-6">
                          Previews for {ext.toUpperCase()} files are not supported natively.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(activePreviewFile)}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#208ded] hover:bg-[#1b7dd0] text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                        >
                          Download Document
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default WebDAVPage;
