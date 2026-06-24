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
    .map((part) => part[0].toUpperCase())
    .join("");
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

  const fileInputRef = useRef(null);
  const requestIdRef = useRef(0);
  const currentPathRef = useRef("/");
  const newMenuRef = useRef(null);

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target)) {
        setNewMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

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
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return entries;
    }

    return entries.filter((entry) => {
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
  }, [entries, searchQuery]);

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
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#f5f7fb] text-slate-900">
      <header className="flex h-14 items-center gap-4 bg-[#58a8e4] px-4 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md p-2 transition hover:bg-white/10"
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-md p-2 transition hover:bg-white/10"
            aria-label="Refresh files"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-3xl items-center rounded-lg bg-[#4b94c8] px-4 py-2 shadow-inner">
          <Search className="mr-3 h-4 w-4 shrink-0 text-slate-900/70" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search apps, files, tags, messages ..."
            className="w-full bg-transparent text-sm text-slate-950 placeholder:text-slate-900/70 outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 transition hover:bg-white/10"
            aria-label="Storage"
          >
            <HardDrive className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7efe7] text-xs font-semibold text-[#58a8e4] ring-2 ring-white/20"
            aria-label="User profile"
          >
            {avatarInitials}
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative" ref={newMenuRef}>
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
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            All files
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={goUp}
            disabled={currentPath === "/"}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
            Up
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-100"
          >
            <LayoutList className="h-4 w-4 text-slate-500" />
            Type
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-100"
          >
            <Users className="h-4 w-4 text-slate-500" />
            People
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 transition hover:bg-slate-100"
          >
            <Grid2x2 className="h-4 w-4 text-slate-500" />
            Grid
          </button>
        </div>
      </div>

      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-8 pb-7 pt-8">
          <h1 className="text-3xl font-normal text-slate-900">Welcome to WebDAV!</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Use this page to browse folders, upload files, and manage the drive.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                <button
                  type="button"
                  onClick={() => openFolder(crumb.path)}
                  className={`rounded-full px-3 py-1.5 transition ${
                    crumb.path === currentPath
                      ? "bg-[#e8f4fd] text-[#208ded]"
                      : "hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {crumb.label}
                </button>
              </div>
            ))}
          </div>
        </div>

        {notice && (
          <div
            className={`mx-8 mt-5 rounded-2xl border px-4 py-3 ${
              notice.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {notice.text}
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden px-2 pb-0 pt-4">
          <div className="grid grid-cols-[40px_minmax(0,1fr)_140px_120px_160px_90px] items-center border-b border-slate-200 px-6 py-3 text-sm font-medium text-slate-500">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={allVisibleSelected && visibleEntries.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-slate-300 text-[#208ded] focus:ring-[#208ded]"
              />
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
                    className={`grid grid-cols-[40px_minmax(0,1fr)_140px_120px_160px_90px] items-center border-b border-slate-100 px-6 py-3 text-sm transition hover:bg-[#f8fbfe] ${
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

                    <button
                      type="button"
                      onClick={() => entry.type === "folder" && openFolder(entry.path)}
                      className={`flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 text-left transition ${
                        entry.type === "folder"
                          ? "cursor-pointer hover:bg-slate-50"
                          : "cursor-default"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          entry.type === "folder"
                            ? "bg-[#e8f4fd] text-[#208ded]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {entry.type === "folder" ? (
                          <Folder className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">
                          {entry.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {entry.type === "folder" ? "Folder" : "File"}
                        </div>
                      </div>
                    </button>

                    <div className="text-slate-600">
                      {entry.type === "folder" ? "Folder" : "File"}
                    </div>
                    <div className="text-slate-600">
                      {entry.type === "folder" ? "—" : formatBytes(entry.size)}
                    </div>
                    <div className="text-slate-600">{formatDate(entry.modified)}</div>
                    <div className="flex items-center justify-end">
                      {entry.type === "folder" ? (
                        <span className="text-xs text-slate-400">Open</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${entry.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4 text-sm text-slate-500">
            <span>
              {fileCount} files · {folderCount} folders
            </span>
            <span>{formatBytes(totalSize)}</span>
          </div>
        </div>
      </main>

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
