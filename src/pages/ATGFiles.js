import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Center,
  Divider,
  Grid,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  Progress,
  Select,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Text,
  Tooltip,
  VStack,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiChevronRight,
  FiClock,
  FiDownload,
  FiEdit3,
  FiEye,
  FiFileText,
  FiFolder,
  FiFolderPlus,
  FiGrid,
  FiHome,
  FiList,
  FiMoreVertical,
  FiMove,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUploadCloud,
} from "react-icons/fi";
import {
  FaFileAlt,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from "react-icons/fa";
import { getAuthHeaders } from "../utils/apiHeaders";

const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".pptx"];

const FILE_TYPE_META = {
  pdf: {
    label: "PDF",
    icon: FaFilePdf,
    color: "red",
  },
  docx: {
    label: "DOCX",
    icon: FaFileWord,
    color: "blue",
  },
  txt: {
    label: "TXT",
    icon: FaFileAlt,
    color: "gray",
  },
  pptx: {
    label: "PPTX",
    icon: FaFilePowerpoint,
    color: "orange",
  },
};

const isLocalHost = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
};

const getFallbackApiBase = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.hostname}:5003`;
};

const API_BASE_URL =
  process.env.REACT_APP_API_URL || (isLocalHost() ? "http://127.0.0.1:5003" : "");

const buildApiUrl = (target) => {
  if (!target) return "";
  if (/^https?:\/\//i.test(target)) return target;

  const base = API_BASE_URL || getFallbackApiBase();
  if (!base) return target;

  try {
    return new URL(target, base).toString();
  } catch (error) {
    return target;
  }
};

const buildBrowserUrl = (target) => {
  const resolved = buildApiUrl(target);
  if (/^https?:\/\//i.test(resolved)) return resolved;

  if (typeof window === "undefined") {
    return resolved;
  }

  try {
    return new URL(resolved, API_BASE_URL || getFallbackApiBase()).toString();
  } catch (error) {
    return resolved;
  }
};

const sanitizeSegment = (value) => {
  const cleaned = String(value || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned === "." || cleaned === "..") return "";
  return cleaned;
};

const sanitizeFileInput = (value) => sanitizeSegment(value);

const normalizeExtension = (value = "") => {
  const safeValue = String(value || "").trim().toLowerCase();
  if (!safeValue) return "";
  return safeValue.startsWith(".") ? safeValue : `.${safeValue}`;
};

const getExtension = (name = "") => {
  const safeName = String(name || "").toLowerCase();
  const dotIndex = safeName.lastIndexOf(".");
  return dotIndex >= 0 ? safeName.slice(dotIndex) : "";
};

const normalizeFolderPath = (value = "") =>
  String(value || "")
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean)
    .join("/");

const buildItemPath = (folderPath, name) => {
  const parent = normalizeFolderPath(folderPath);
  const safeName = sanitizeSegment(name);
  if (!safeName) return parent;
  return parent ? `${parent}/${safeName}` : safeName;
};

const getParentFolderPath = (value = "") => {
  const normalized = normalizeFolderPath(value);
  if (!normalized) return "";
  const parts = normalized.split("/");
  return parts.slice(0, -1).join("/");
};

const prettyDate = (value) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const prettyDateOnly = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const prettyFileSize = (bytes) => {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) {
    return "Unknown size";
  }

  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const isFolderItem = (item) =>
  String(item?.item_type || "file").toLowerCase() === "folder";

const getItemPath = (item = {}) =>
  item?.item_path || buildItemPath(item?.folder_path, item?.filename);

const getItemExtension = (item = {}) =>
  normalizeExtension(item?.file_type || getExtension(item?.filename || ""));

const isSupportedItem = (item = {}) => {
  if (isFolderItem(item)) return true;
  return SUPPORTED_EXTENSIONS.includes(getItemExtension(item));
};

const getFileMeta = (item) => {
  if (isFolderItem(item)) {
    return {
      label: "Folder",
      icon: FiFolder,
      color: "blue",
    };
  }

  const extension = getItemExtension(item).replace(".", "");
  return (
    FILE_TYPE_META[extension] || {
      label: (extension || "FILE").toUpperCase(),
      icon: FiFileText,
      color: "gray",
    }
  );
};

const getUploadAge = (createdAt, filter) => {
  if (filter === "all") return true;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;

  const now = new Date();
  const diffMs = now.getTime() - created.getTime();

  if (filter === "today") {
    return prettyDateOnly(createdAt) === prettyDateOnly(now);
  }

  if (filter === "7d") {
    return diffMs <= 7 * 24 * 60 * 60 * 1000;
  }

  if (filter === "30d") {
    return diffMs <= 30 * 24 * 60 * 60 * 1000;
  }

  return true;
};

const formatFolderLabel = (folderPath) => {
  const normalized = normalizeFolderPath(folderPath);
  if (!normalized) return "All files";
  return normalized.split("/").join(" / ");
};

const UploadQueueItem = ({ item }) => {
  const isError = item.status === "error";
  const isDone = item.status === "done";

  return (
    <Box
      border="1px solid"
      borderColor={isError ? "red.200" : isDone ? "green.200" : "blue.100"}
      bg={isError ? "red.50" : isDone ? "green.50" : "blue.50"}
      rounded="xl"
      p={3}
    >
      <HStack justify="space-between" align="start" spacing={4}>
        <Box minW={0}>
          <Text fontWeight="700" fontSize="sm" noOfLines={1}>
            {item.name}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {prettyFileSize(item.size)}
          </Text>
        </Box>
        <Badge colorScheme={isError ? "red" : isDone ? "green" : "blue"}>
          {item.status}
        </Badge>
      </HStack>
      <Progress
        mt={3}
        value={item.progress}
        size="sm"
        colorScheme={isError ? "red" : isDone ? "green" : "blue"}
        rounded="full"
      />
      {item.error && (
        <Text mt={2} fontSize="xs" color="red.600">
          {item.error}
        </Text>
      )}
    </Box>
  );
};

const ATGFiles = () => {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const pageBg = useColorModeValue("gray.50", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const mutedText = useColorModeValue("gray.500", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightBorder = useColorModeValue("blue.300", "blue.400");
  const tipBg = useColorModeValue("gray.50", "gray.700");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderPath, setCurrentFolderPath] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list");
  const [uploadQueue, setUploadQueue] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewFrameState, setPreviewFrameState] = useState({
    status: "idle",
    message: "",
  });
  const [renameValue, setRenameValue] = useState("");
  const [moveValue, setMoveValue] = useState("");
  const [folderName, setFolderName] = useState("");
  const [textFileName, setTextFileName] = useState("New text file.txt");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);
  const uploadInputRef = useRef(null);
  const folderUploadInputRef = useRef(null);

  const folderModal = useDisclosure();
  const textFileModal = useDisclosure();
  const renameModal = useDisclosure();
  const moveModal = useDisclosure();
  const deleteModal = useDisclosure();
  const previewModal = useDisclosure();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildApiUrl("/api/atg-files"), {
        headers: getAuthHeaders(),
      });

      const records = Array.isArray(response.data) ? response.data : [];
      const visibleRecords = records.filter(isSupportedItem);
      setItems(visibleRecords);

      setSelectedItem((current) => {
        if (current) {
          const next = visibleRecords.find((item) => item.id === current.id);
          if (next && !isFolderItem(next)) {
            return next;
          }
        }

        const currentVisible = visibleRecords
          .filter((item) => !isFolderItem(item))
          .filter((item) => normalizeFolderPath(item.folder_path) === currentFolderPath);

        return currentVisible[0] || null;
      });
    } catch (error) {
      toast({
        title: "Unable to load files",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setSelectedItem((current) => {
      if (!current || isFolderItem(current)) {
        return null;
      }

      return normalizeFolderPath(current.folder_path) === normalizeFolderPath(currentFolderPath)
        ? current
        : null;
    });
  }, [currentFolderPath]);

  useEffect(() => {
    let cancelled = false;

    const loadTextPreview = async () => {
      if (!selectedItem || isFolderItem(selectedItem)) {
        setPreviewText("");
        setPreviewError("");
        setPreviewLoading(false);
        return;
      }

      if (getItemExtension(selectedItem) !== ".txt") {
        setPreviewText("");
        setPreviewError("");
        setPreviewLoading(false);
        return;
      }

      setPreviewLoading(true);
      setPreviewError("");

      try {
        const response = await fetch(
          buildBrowserUrl(selectedItem.preview_url || selectedItem.file_path),
        );

        if (!response.ok) {
          throw new Error("Unable to load text preview");
        }

        const text = await response.text();
        if (!cancelled) {
          setPreviewText(text.slice(0, 50000));
        }
      } catch (error) {
        if (!cancelled) {
          setPreviewError("Preview is not available. Please download the file.");
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadTextPreview();

    return () => {
      cancelled = true;
    };
  }, [selectedItem]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId = null;

    const extension = selectedItem ? getItemExtension(selectedItem) : "";

    if (!selectedItem || isFolderItem(selectedItem)) {
      setPreviewFrameState({ status: "idle", message: "" });
      return undefined;
    }

    if (!extension || extension === ".txt") {
      setPreviewFrameState({ status: "idle", message: "" });
      return undefined;
    }

    const previewUrl = buildBrowserUrl(
      selectedItem.preview_url || selectedItem.file_path,
    );

    if (!previewUrl) {
      setPreviewFrameState({
        status: "unavailable",
        message: "Preview link is missing.",
      });
      return undefined;
    }

    if (extension === ".docx" || extension === ".pptx") {
      const privateHost = (() => {
        try {
          const parsed = new URL(previewUrl);
          return ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
        } catch (error) {
          return true;
        }
      })();

      if (privateHost) {
        setPreviewFrameState({
          status: "unavailable",
          message: "Preview is not available here. Please download the file.",
        });
        return undefined;
      }

      setPreviewFrameState({ status: "loading", message: "" });
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setPreviewFrameState({
            status: "unavailable",
            message: "Preview is taking too long. Please download the file.",
          });
        }
      }, 8000);

      return () => {
        cancelled = true;
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }

    if (extension === ".pdf") {
      setPreviewFrameState({ status: "loading", message: "" });
      timeoutId = window.setTimeout(() => {
        if (!cancelled) {
          setPreviewFrameState({
            status: "unavailable",
            message: "Preview did not load. Please download the file.",
          });
        }
      }, 8000);

      return () => {
        cancelled = true;
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }

    setPreviewFrameState({
      status: "unavailable",
      message: "Preview is not available for this file.",
    });

    return undefined;
  }, [selectedItem]);

  const handleChooseFiles = () => {
    uploadInputRef.current?.click();
  };

  const handleChooseFolder = () => {
    folderUploadInputRef.current?.click();
  };

  const reportInvalidFiles = (rejectedFiles) => {
    if (!rejectedFiles.length) return;

    const names = rejectedFiles.map((file) => file.name).join(", ");
    toast({
      title: "Unsupported file type",
      description: `Only PDF, DOCX, TXT, and PPTX files are allowed. Rejected: ${names}`,
      status: "error",
      duration: 6000,
      isClosable: true,
    });
  };

  const pushQueueItems = (nextItems) => {
    setUploadQueue((current) => [...current, ...nextItems]);
  };

  const updateQueueItem = (id, nextState) => {
    setUploadQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...nextState } : item)),
    );
  };

  const removeQueueItem = (id) => {
    setUploadQueue((current) => current.filter((item) => item.id !== id));
  };

  const createFolderRecord = async (parentPath, name) => {
    const cleanedName = sanitizeSegment(name);
    if (!cleanedName) return;

    try {
      await axios.post(
        buildApiUrl("/api/atg-files/folders"),
        {
          folder_name: cleanedName,
          folder_path: normalizeFolderPath(parentPath),
          uploaded_by: localStorage.getItem("username") || "Admin",
        },
        { headers: getAuthHeaders() },
      );
    } catch (error) {
      if (error?.response?.status === 409) {
        return;
      }

      throw error;
    }
  };

  const ensureFolderPath = async (targetPath) => {
    const normalized = normalizeFolderPath(targetPath);
    if (!normalized) return;

    const parts = normalized.split("/").filter(Boolean);
    let parentPath = "";

    for (const part of parts) {
      await createFolderRecord(parentPath, part);
      parentPath = buildItemPath(parentPath, part);
    }
  };

  const uploadOneFile = async (file, queueId, folderPath, options = {}) => {
    const shouldRefresh = options.refresh !== false;
    const shouldToast = options.toast !== false;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploaded_by", localStorage.getItem("username") || "Admin");
    formData.append("category", "General");
    formData.append("folder_path", normalizeFolderPath(folderPath));

    updateQueueItem(queueId, { status: "uploading", progress: 0, error: "" });

    try {
      const response = await axios.post(buildApiUrl("/api/atg-files"), formData, {
        headers: {
          ...getAuthHeaders(),
        },
        onUploadProgress: (event) => {
          const percent = event.total
            ? Math.round((event.loaded * 100) / event.total)
            : 0;
          updateQueueItem(queueId, { progress: Math.min(percent, 100) });
        },
      });

      updateQueueItem(queueId, { status: "done", progress: 100 });
      if (shouldToast) {
        toast({
          title: "Upload complete",
          description: response?.data?.data?.filename || file.name,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      }

      if (shouldRefresh) {
        await fetchItems();
      }
      window.setTimeout(() => removeQueueItem(queueId), 2500);
      return response?.data?.data || true;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Upload failed.";

      updateQueueItem(queueId, {
        status: "error",
        error: message,
      });

      toast({
        title: "Upload failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      if (options.throwOnError) {
        throw error;
      }

      return null;
    }
  };

  const handleUploadFiles = async (incomingFiles, folderPath = currentFolderPath) => {
    const fileList = Array.from(incomingFiles || []);
    if (!fileList.length) return;

    const acceptedFiles = fileList.filter((file) =>
      SUPPORTED_EXTENSIONS.includes(normalizeExtension(getExtension(file.name))),
    );
    const rejectedFiles = fileList.filter(
      (file) => !SUPPORTED_EXTENSIONS.includes(normalizeExtension(getExtension(file.name))),
    );

    reportInvalidFiles(rejectedFiles);

    if (!acceptedFiles.length) {
      return;
    }

    const queueItems = acceptedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      size: file.size,
      status: "queued",
      progress: 0,
      error: "",
    }));

    pushQueueItems(queueItems);

    for (let index = 0; index < acceptedFiles.length; index += 1) {
      // Upload one file at a time so progress stays clear and simple.
      await uploadOneFile(acceptedFiles[index], queueItems[index].id, folderPath);
    }
  };

  const handleFileInputChange = async (event) => {
    const filesSelected = Array.from(event.target.files || []);
    event.target.value = "";
    await handleUploadFiles(filesSelected, currentFolderPath);
  };

  const handleFolderInputChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    const acceptedFiles = selectedFiles.filter((file) =>
      SUPPORTED_EXTENSIONS.includes(normalizeExtension(getExtension(file.name))),
    );
    const rejectedFiles = selectedFiles.filter(
      (file) => !SUPPORTED_EXTENSIONS.includes(normalizeExtension(getExtension(file.name))),
    );

    reportInvalidFiles(rejectedFiles);

    if (!acceptedFiles.length) {
      return;
    }

    const queueItems = acceptedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: file.webkitRelativePath || file.name,
      size: file.size,
      status: "queued",
      progress: 0,
      error: "",
    }));

    pushQueueItems(queueItems);

    try {
      const requiredFolders = new Set();

      acceptedFiles.forEach((file) => {
        const relativePath = normalizeFolderPath(file.webkitRelativePath || file.name);
        const relativeFolder = getParentFolderPath(relativePath);
        const destinationFolder = normalizeFolderPath(
          [currentFolderPath, relativeFolder].filter(Boolean).join("/"),
        );

        if (destinationFolder) {
          const parts = destinationFolder.split("/").filter(Boolean);
          let runningPath = "";
          parts.forEach((part) => {
            runningPath = buildItemPath(runningPath, part);
            requiredFolders.add(runningPath);
          });
        }
      });

      for (const folderPath of Array.from(requiredFolders).sort(
        (a, b) => a.split("/").length - b.split("/").length,
      )) {
        await ensureFolderPath(folderPath);
      }

      let uploadedCount = 0;

      for (let index = 0; index < acceptedFiles.length; index += 1) {
        const file = acceptedFiles[index];
        const relativePath = normalizeFolderPath(file.webkitRelativePath || file.name);
        const relativeFolder = getParentFolderPath(relativePath);
        const destinationFolder = normalizeFolderPath(
          [currentFolderPath, relativeFolder].filter(Boolean).join("/"),
        );

        const uploaded = await uploadOneFile(file, queueItems[index].id, destinationFolder, {
          refresh: false,
          toast: false,
        });
        if (uploaded) uploadedCount += 1;
      }

      toast({
        title: "Folder upload complete",
        description: `${uploadedCount} file${uploadedCount === 1 ? "" : "s"} uploaded.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchItems();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Folder upload failed.";

      queueItems.forEach((item) => {
        updateQueueItem(item.id, { status: "error", error: message });
      });

      toast({
        title: "Folder upload failed",
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    await handleUploadFiles(Array.from(event.dataTransfer.files || []), currentFolderPath);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      event.currentTarget &&
      event.relatedTarget &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setDragActive(false);
  };

  const openFile = (file) => {
    if (!file || isFolderItem(file)) return;
    setSelectedItem(file);
    if (isMobile) {
      previewModal.onOpen();
    }
  };

  const openFolder = (folder) => {
    if (!folder || !isFolderItem(folder)) return;
    const nextPath = getItemPath(folder);
    setCurrentFolderPath(normalizeFolderPath(nextPath));
    setSelectedItem(null);
  };

  const openRename = (item) => {
    setSelectedItem(item);
    setRenameValue(item?.filename || "");
    renameModal.onOpen();
  };

  const openMove = (item) => {
    setMoveTarget(item);
    setMoveValue(normalizeFolderPath(item?.folder_path || ""));
    moveModal.onOpen();
  };

  const openDelete = (item) => {
    setDeleteTarget(item);
    deleteModal.onOpen();
  };

  const openCreateFolder = () => {
    setFolderName("");
    folderModal.onOpen();
  };

  const openCreateTextFile = () => {
    setTextFileName("New text file.txt");
    textFileModal.onOpen();
  };

  const handleDownload = (item) => {
    if (!item || isFolderItem(item)) return;

    const url = buildApiUrl(
      item?.download_url || `/api/atg-files/${item.id}/download`,
    );
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const moveCurrentFolder = (targetPath) => {
    setCurrentFolderPath(normalizeFolderPath(targetPath));
    setSelectedItem(null);
  };

  const visibleItems = useMemo(() => {
    const normalizedCurrentFolder = normalizeFolderPath(currentFolderPath);
    const query = searchQuery.trim().toLowerCase();

    const filtered = items.filter((item) => {
      const parentPath = normalizeFolderPath(item.folder_path);
      const extension = getItemExtension(item).replace(".", "");
      const matchesCurrentFolder = parentPath === normalizedCurrentFolder;
      const matchesQuery =
        !query ||
        item.filename?.toLowerCase().includes(query) ||
        item.folder_path?.toLowerCase().includes(query) ||
        item.uploaded_by?.toLowerCase().includes(query) ||
        extension.includes(query) ||
        (isFolderItem(item) &&
          getItemPath(item).toLowerCase().includes(query));

      const matchesType =
        typeFilter === "all"
          ? true
          : !isFolderItem(item) && extension === typeFilter;

      const matchesDate = getUploadAge(item.createdAt, dateFilter);

      return matchesCurrentFolder && matchesQuery && matchesType && matchesDate;
    });

    const sorter = [...filtered];
    sorter.sort((a, b) => {
      const folderRankA = isFolderItem(a) ? 0 : 1;
      const folderRankB = isFolderItem(b) ? 0 : 1;
      if (folderRankA !== folderRankB) return folderRankA - folderRankB;

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      const nameA = (a.filename || "").toLowerCase();
      const nameB = (b.filename || "").toLowerCase();
      const typeA = getItemExtension(a).toLowerCase();
      const typeB = getItemExtension(b).toLowerCase();

      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "name") return nameA.localeCompare(nameB);
      if (sortBy === "type") return typeA.localeCompare(typeB) || nameA.localeCompare(nameB);
      return dateB - dateA;
    });

    return sorter;
  }, [currentFolderPath, dateFilter, items, searchQuery, sortBy, typeFilter]);

  const folderCount = visibleItems.filter(isFolderItem).length;
  const fileCount = visibleItems.length - folderCount;

  const folderOptions = useMemo(() => {
    const folders = items
      .filter(isFolderItem)
      .map((folder) => ({
        value: getItemPath(folder),
        label: formatFolderLabel(getItemPath(folder)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ value: "", label: "All files" }, ...folders];
  }, [items]);

  const currentFolderCrumbs = useMemo(() => {
    const normalized = normalizeFolderPath(currentFolderPath);
    if (!normalized) {
      return [{ label: "All files", path: "" }];
    }

    const parts = normalized.split("/").filter(Boolean);
    const crumbs = [{ label: "All files", path: "" }];
    let running = "";
    parts.forEach((part) => {
      running = running ? `${running}/${part}` : part;
      crumbs.push({ label: part, path: running });
    });
    return crumbs;
  }, [currentFolderPath]);

  const activeUploadCount = uploadQueue.filter(
    (item) => item.status === "queued" || item.status === "uploading",
  ).length;

  const previewFileUrl = useMemo(() => {
    if (!selectedItem || isFolderItem(selectedItem)) return "";
    return buildBrowserUrl(selectedItem.preview_url || selectedItem.file_path);
  }, [selectedItem]);

  const officeViewerUrl = useMemo(() => {
    if (!selectedItem || isFolderItem(selectedItem)) return "";
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      previewFileUrl,
    )}`;
  }, [previewFileUrl, selectedItem]);

  const canPreviewInBrowser = useMemo(() => {
    if (!selectedItem || isFolderItem(selectedItem)) return false;

    const extension = getItemExtension(selectedItem);
    if (!previewFileUrl) return false;

    try {
      const parsed = new URL(previewFileUrl);
      const privateHost = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
      if (extension === ".docx" || extension === ".pptx") {
        return !privateHost;
      }
      return true;
    } catch (error) {
      return false;
    }
  }, [previewFileUrl, selectedItem]);

  const filePreviewContent = () => {
    if (!selectedItem) {
      return (
        <Center minH="320px" color={mutedText} flexDirection="column" px={6}>
          <Icon as={FiFolder} boxSize={12} mb={4} opacity={0.35} />
          <Text fontWeight="700">Select a file</Text>
          <Text fontSize="sm" textAlign="center" mt={2}>
            PDF and TXT files preview here. DOCX and PPTX use a browser viewer
            when available.
          </Text>
        </Center>
      );
    }

    if (isFolderItem(selectedItem)) {
      return (
        <Center minH="320px" color={mutedText} flexDirection="column" px={6}>
          <Icon as={FiFolder} boxSize={12} mb={4} opacity={0.35} />
          <Text fontWeight="700">Folder selected</Text>
          <Text fontSize="sm" textAlign="center" mt={2}>
            Open it to see the files inside.
          </Text>
        </Center>
      );
    }

    const meta = getFileMeta(selectedItem);
    const extension = getItemExtension(selectedItem);
    const renderUnavailable = (message) => (
      <Center
        minH="320px"
        border="1px dashed"
        borderColor={borderColor}
        rounded="xl"
        bg="gray.50"
        px={6}
        textAlign="center"
      >
        <VStack spacing={3} maxW="sm">
          <Icon as={FiAlertTriangle} boxSize={10} color="orange.400" />
          <Heading size="sm">Preview not available</Heading>
          <Text fontSize="sm" color={mutedText}>
            {message || "Download the file to open it."}
          </Text>
          <HStack spacing={3} flexWrap="wrap" justify="center">
            <Button
              as="a"
              href={previewFileUrl || undefined}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="sm"
              isDisabled={!previewFileUrl}
            >
              Open file
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => handleDownload(selectedItem)}
            >
              Download
            </Button>
          </HStack>
        </VStack>
      </Center>
    );

    if (extension === ".txt") {
      return (
        <Box
          border="1px solid"
          borderColor={borderColor}
          rounded="xl"
          bg="gray.900"
          color="gray.100"
          p={4}
          minH="420px"
          maxH="calc(100vh - 360px)"
          overflow="auto"
          fontFamily="mono"
          fontSize="sm"
          whiteSpace="pre-wrap"
          wordBreak="break-word"
        >
          {previewLoading ? (
            <Center py={10}>
              <Spinner />
            </Center>
          ) : previewError ? (
            <VStack spacing={3} py={8}>
              <Icon as={FiAlertTriangle} boxSize={7} color="orange.300" />
              <Text color="orange.200">{previewError}</Text>
            </VStack>
          ) : (
            previewText || "No text found in file."
          )}
        </Box>
      );
    }

    if (extension === ".pdf") {
      if (!previewFileUrl) {
        return renderUnavailable("Preview link is missing.");
      }

      if (previewFrameState.status === "unavailable") {
        return renderUnavailable(previewFrameState.message);
      }

      return (
        <Stack spacing={3}>
          <Box
            position="relative"
            h={{ base: "60vh", xl: "calc(100vh - 360px)" }}
            minH="480px"
            border="1px solid"
            borderColor={borderColor}
            rounded="xl"
            overflow="hidden"
            bg="white"
          >
            {previewFrameState.status === "loading" && (
              <Center position="absolute" inset={0} bg="whiteAlpha.700" zIndex={1}>
                <Spinner />
              </Center>
            )}

            <iframe
              title={selectedItem.filename}
              src={previewFileUrl}
              onLoad={() => {
                setPreviewFrameState((current) =>
                  current.status === "loading"
                    ? { status: "ready", message: "" }
                    : current,
                );
              }}
              onError={() => {
                setPreviewFrameState({
                  status: "unavailable",
                  message: "Preview did not load. Please download the file.",
                });
              }}
              style={{ width: "100%", height: "100%", border: "0" }}
            />
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            <Button
              as="a"
              href={previewFileUrl || undefined}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="sm"
              isDisabled={!previewFileUrl}
            >
              Open file
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => handleDownload(selectedItem)}
            >
              Download
            </Button>
          </HStack>
        </Stack>
      );
    }

    if (extension === ".docx" || extension === ".pptx") {
      if (!canPreviewInBrowser) {
        return renderUnavailable("Preview is not available here. Please download the file.");
      }

      if (previewFrameState.status === "unavailable") {
        return renderUnavailable(previewFrameState.message);
      }

      return (
        <Stack spacing={4}>
          <Center
            minH="160px"
            bg="gray.50"
            border="1px dashed"
            borderColor={borderColor}
            rounded="xl"
            p={6}
            textAlign="center"
          >
            <VStack spacing={3} maxW="sm">
              <Icon as={meta.icon} boxSize={12} color={`${meta.color}.500`} />
              <Heading size="sm">{meta.label} preview</Heading>
              <Text fontSize="sm" color={mutedText}>
                If the viewer stays blank, download the file.
              </Text>
            </VStack>
          </Center>

          <Box
            position="relative"
            border="1px solid"
            borderColor={borderColor}
            rounded="xl"
            overflow="hidden"
            minH="320px"
          >
            {previewFrameState.status === "loading" && (
              <Center position="absolute" inset={0} bg="whiteAlpha.700" zIndex={1}>
                <Spinner />
              </Center>
            )}

            <iframe
              title={`${selectedItem.filename}-viewer`}
              src={officeViewerUrl}
              onLoad={() => {
                setPreviewFrameState((current) =>
                  current.status === "loading"
                    ? { status: "ready", message: "" }
                    : current,
                );
              }}
              onError={() => {
                setPreviewFrameState({
                  status: "unavailable",
                  message: "Preview did not load. Please download the file.",
                });
              }}
              style={{ width: "100%", minHeight: "380px", border: "0" }}
            />
          </Box>

          <HStack spacing={3} flexWrap="wrap">
            <Button
              as="a"
              href={previewFileUrl || undefined}
              target="_blank"
              rel="noreferrer"
              variant="outline"
              size="sm"
              isDisabled={!previewFileUrl}
            >
              Open file
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => handleDownload(selectedItem)}
            >
              Download
            </Button>
          </HStack>
        </Stack>
      );
    }

    return renderUnavailable("Download the file to open it.");
  };

  const handleRenameConfirm = async () => {
    if (!selectedItem) return;

    const isFolder = isFolderItem(selectedItem);
    const cleaned = isFolder
      ? sanitizeSegment(renameValue)
      : sanitizeFileInput(renameValue);

    if (!cleaned) {
      toast({
        title: "Name required",
        description: isFolder
          ? "Please enter a folder name."
          : "Please enter a file name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.put(
        buildApiUrl(`/api/atg-files/${selectedItem.id}`),
        { filename: cleaned },
        { headers: getAuthHeaders() },
      );

      toast({
        title: isFolder ? "Folder renamed" : "File renamed",
        description: response?.data?.data?.filename || cleaned,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      renameModal.onClose();
      await fetchItems();

      const nextItem = response?.data?.data;
      if (nextItem && !isFolderItem(nextItem)) {
        setSelectedItem(nextItem);
      }
    } catch (error) {
      toast({
        title: "Rename failed",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleMoveConfirm = async () => {
    if (!moveTarget) return;

    const destination = normalizeFolderPath(moveValue);
    const targetPath = getItemPath(moveTarget);

    if (isFolderItem(moveTarget)) {
      if (
        destination &&
        (destination === targetPath || destination.startsWith(`${targetPath}/`))
      ) {
        toast({
          title: "Invalid move",
          description: "A folder cannot be moved into itself.",
          status: "warning",
          duration: 3500,
          isClosable: true,
        });
        return;
      }
    }

    try {
      const response = await axios.put(
        buildApiUrl(`/api/atg-files/${moveTarget.id}/move`),
        { folder_path: destination },
        { headers: getAuthHeaders() },
      );

      toast({
        title: isFolderItem(moveTarget) ? "Folder moved" : "File moved",
        description: formatFolderLabel(destination),
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      moveModal.onClose();
      await fetchItems();

      const nextItem = response?.data?.data;
      if (nextItem && !isFolderItem(nextItem)) {
        setSelectedItem(nextItem);
      }
    } catch (error) {
      toast({
        title: "Move failed",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(buildApiUrl(`/api/atg-files/${deleteTarget.id}`), {
        headers: getAuthHeaders(),
      });

      toast({
        title: isFolderItem(deleteTarget) ? "Folder deleted" : "File deleted",
        description: deleteTarget.filename,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      deleteModal.onClose();
      setDeleteTarget(null);
      await fetchItems();

      if (selectedItem?.id === deleteTarget.id) {
        setSelectedItem(null);
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleCreateFolderConfirm = async () => {
    const cleaned = sanitizeSegment(folderName);
    if (!cleaned) {
      toast({
        title: "Folder name required",
        description: "Please enter a folder name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        buildApiUrl("/api/atg-files/folders"),
        {
          folder_name: cleaned,
          folder_path: currentFolderPath,
          uploaded_by: localStorage.getItem("username") || "Admin",
        },
        { headers: getAuthHeaders() },
      );

      toast({
        title: "Folder created",
        description: cleaned,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      folderModal.onClose();
      await fetchItems();
    } catch (error) {
      toast({
        title: "Create folder failed",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleCreateTextFileConfirm = async () => {
    const cleaned = sanitizeFileInput(textFileName);
    if (!cleaned) {
      toast({
        title: "File name required",
        description: "Please enter a text file name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const finalName = getExtension(cleaned) === ".txt" ? cleaned : `${cleaned}.txt`;
    const textFile = new File([""], finalName, { type: "text/plain" });
    const queueItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: finalName,
      size: 0,
      status: "queued",
      progress: 0,
      error: "",
    };

    pushQueueItems([queueItem]);

    try {
      await uploadOneFile(textFile, queueItem.id, currentFolderPath, {
        refresh: false,
        toast: false,
        throwOnError: true,
      });
      await fetchItems();

      toast({
        title: "Text file created",
        description: finalName,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      textFileModal.onClose();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Please try again.";

      updateQueueItem(queueItem.id, { status: "error", error: message });
      toast({
        title: "Create text file failed",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const isValidMoveTarget = (target) => {
    if (!moveTarget) return true;
    if (!isFolderItem(moveTarget)) return true;
    const targetPath = getItemPath(moveTarget);
    const destination = normalizeFolderPath(target?.value || "");
    return !destination || (destination !== targetPath && !destination.startsWith(`${targetPath}/`));
  };

  const renderItemMenu = (item) => (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        icon={<FiMoreVertical />}
        variant="ghost"
        size="sm"
        aria-label="Item actions"
        onClick={(event) => event.stopPropagation()}
      />
      <Portal>
        <MenuList zIndex={1500} onClick={(event) => event.stopPropagation()}>
          {isFolderItem(item) ? (
            <MenuItem icon={<FiFolder />} onClick={() => openFolder(item)}>
              Open
            </MenuItem>
          ) : (
            <MenuItem icon={<FiEye />} onClick={() => openFile(item)}>
              Preview
            </MenuItem>
          )}
          {!isFolderItem(item) && (
            <MenuItem icon={<FiDownload />} onClick={() => handleDownload(item)}>
              Download
            </MenuItem>
          )}
          <MenuItem icon={<FiEdit3 />} onClick={() => openRename(item)}>
            Rename
          </MenuItem>
          <MenuItem icon={<FiMove />} onClick={() => openMove(item)}>
            Move
          </MenuItem>
          <MenuItem
            icon={<FiTrash2 />}
            color="red.500"
            onClick={() => openDelete(item)}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );

  const renderListItem = (item) => {
    const meta = getFileMeta(item);
    const isSelected = selectedItem?.id === item.id;

    return (
      <Card
        key={item.id}
        border="1px solid"
        borderColor={isSelected ? "blue.300" : borderColor}
        rounded="2xl"
        shadow={isSelected ? "md" : "sm"}
        transition="all 0.2s ease"
        _hover={{ shadow: "md", borderColor: "blue.300" }}
        cursor="pointer"
        onClick={() => (isFolderItem(item) ? openFolder(item) : openFile(item))}
      >
        <CardBody p={4}>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "1.8fr 0.7fr 0.9fr 0.4fr",
            }}
            gap={3}
            alignItems="center"
          >
            <HStack spacing={4} align="start" minW={0}>
              <Center
                boxSize="48px"
                rounded="2xl"
                bg={`${meta.color}.50`}
                color={`${meta.color}.500`}
                flexShrink={0}
              >
                <Icon as={meta.icon} boxSize={6} />
              </Center>

              <Box flex="1" minW={0}>
                <HStack spacing={2} flexWrap="wrap">
                  <Heading size="sm" noOfLines={1}>
                    {item.filename}
                  </Heading>
                  <Badge colorScheme={meta.color} variant="subtle" rounded="full">
                    {meta.label}
                  </Badge>
                </HStack>
                <Text mt={1} fontSize="sm" color={mutedText} noOfLines={1}>
                  {isFolderItem(item)
                    ? "Folder"
                    : `Uploaded by ${item.uploaded_by || "Unknown"}`}
                </Text>
                <Text fontSize="xs" color={mutedText} noOfLines={1}>
                  Location: {formatFolderLabel(item.folder_path)}
                </Text>
              </Box>
            </HStack>

            <Box>
              <Text fontSize="sm" color={mutedText}>
                {isFolderItem(item) ? "Folder" : prettyFileSize(item.file_size)}
              </Text>
            </Box>

            <Box>
              <Text fontSize="sm" color={mutedText}>
                {prettyDate(item.createdAt)}
              </Text>
            </Box>

            {renderItemMenu(item)}
          </Grid>
        </CardBody>
      </Card>
    );
  };

  const renderGridItem = (item) => {
    const meta = getFileMeta(item);
    const isSelected = selectedItem?.id === item.id;

    return (
      <Card
        key={item.id}
        border="1px solid"
        borderColor={isSelected ? "blue.300" : borderColor}
        rounded="2xl"
        shadow={isSelected ? "md" : "sm"}
        transition="all 0.2s ease"
        _hover={{ shadow: "md", borderColor: "blue.300" }}
        cursor="pointer"
        onClick={() => (isFolderItem(item) ? openFolder(item) : openFile(item))}
      >
        <CardBody p={4}>
          <HStack justify="space-between" align="start" spacing={3}>
            <Center
              boxSize="52px"
              rounded="2xl"
              bg={`${meta.color}.50`}
              color={`${meta.color}.500`}
              flexShrink={0}
            >
              <Icon as={meta.icon} boxSize={7} />
            </Center>
            {renderItemMenu(item)}
          </HStack>

          <Heading size="sm" mt={4} noOfLines={2}>
            {item.filename}
          </Heading>
          <HStack mt={3} spacing={2} flexWrap="wrap">
            <Badge colorScheme={meta.color} variant="subtle" rounded="full">
              {meta.label}
            </Badge>
            {!isFolderItem(item) && (
              <Badge variant="outline" rounded="full">
                {prettyFileSize(item.file_size)}
              </Badge>
            )}
          </HStack>
          <Text mt={3} fontSize="xs" color={mutedText} noOfLines={1}>
            {formatFolderLabel(item.folder_path)}
          </Text>
          <Text mt={1} fontSize="xs" color={mutedText}>
            {prettyDate(item.createdAt)}
          </Text>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box
      minH="100vh"
      w="full"
      bg={pageBg}
      px={{ base: 4, md: 8 }}
      py={{ base: 4, md: 6 }}
    >
      <Stack spacing={6} w="full">
        <Card
          bgGradient="linear(to-r, blue.700, blue.500)"
          color="white"
          borderRadius="3xl"
          overflow="hidden"
          shadow="xl"
        >
          <CardBody p={{ base: 5, md: 8 }}>
            <Grid templateColumns={{ base: "1fr", xl: "1.3fr 0.7fr" }} gap={6}>
              <Box>
                <HStack spacing={3} align="center">
                  <Center
                    w="48px"
                    h="48px"
                    rounded="2xl"
                    bg="whiteAlpha.200"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                  >
                    <Icon as={FiFolder} boxSize={6} />
                  </Center>
                  <Box>
                    <Heading size={{ base: "lg", md: "xl" }} fontWeight="900">
                      ATG Files
                    </Heading>
                    <Text opacity={0.9} fontSize="sm">
                      Simple file and folder management.
                    </Text>
                  </Box>
                </HStack>

                <HStack
                  mt={5}
                  spacing={2}
                  flexWrap="wrap"
                  align="center"
                  bg="whiteAlpha.180"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  rounded="2xl"
                  p={2}
                  w="fit-content"
                  maxW="full"
                >
                  <Menu placement="bottom-start">
                    <MenuButton
                      as={Button}
                      leftIcon={<FiPlus />}
                      bg="white"
                      color="blue.700"
                      _hover={{ bg: "blue.50" }}
                      rounded="xl"
                      size="sm"
                    >
                      New
                    </MenuButton>
                    <Portal>
                      <MenuList color="gray.800" zIndex={1500}>
                        <MenuItem icon={<FiUploadCloud />} onClick={handleChooseFiles}>
                          Upload files
                        </MenuItem>
                        <MenuItem icon={<FiFolder />} onClick={handleChooseFolder}>
                          Upload folder
                        </MenuItem>
                        <MenuItem icon={<FiFolderPlus />} onClick={openCreateFolder}>
                          New folder
                        </MenuItem>
                        <MenuItem icon={<FiFileText />} onClick={openCreateTextFile}>
                          New text file
                        </MenuItem>
                      </MenuList>
                    </Portal>
                  </Menu>

                  {currentFolderCrumbs.map((crumb, index) => {
                    const isLast = index === currentFolderCrumbs.length - 1;
                    return (
                      <React.Fragment key={`${crumb.path || "root"}-${crumb.label}`}>
                        <Button
                          size="sm"
                          variant={isLast ? "solid" : "ghost"}
                          colorScheme={isLast ? "whiteAlpha" : "whiteAlpha"}
                          bg={isLast ? "whiteAlpha.300" : "transparent"}
                          _hover={{ bg: "whiteAlpha.200" }}
                          onClick={() => moveCurrentFolder(crumb.path)}
                          isDisabled={isLast}
                          leftIcon={index === 0 ? <FiHome /> : undefined}
                          rounded="xl"
                          maxW={{ base: "180px", md: "260px" }}
                          noOfLines={1}
                        >
                          {crumb.label}
                        </Button>
                        {!isLast && <Icon as={FiChevronRight} opacity={0.7} flexShrink={0} />}
                      </React.Fragment>
                    );
                  })}
                </HStack>

                <Text mt={4} fontSize="sm" opacity={0.9}>
                  {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"} in this folder.
                </Text>
              </Box>

              <Box>
                <HStack spacing={3} justify={{ base: "start", xl: "end" }} flexWrap="wrap">
                  {normalizeFolderPath(currentFolderPath) && (
                    <Button
                      leftIcon={<FiArrowLeft />}
                      variant="outline"
                      color="white"
                      borderColor="whiteAlpha.500"
                      _hover={{ bg: "whiteAlpha.200" }}
                      rounded="full"
                      onClick={() => moveCurrentFolder(getParentFolderPath(currentFolderPath))}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    leftIcon={<FiRefreshCw />}
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.500"
                    _hover={{ bg: "whiteAlpha.200" }}
                    rounded="full"
                    onClick={fetchItems}
                  >
                    Refresh
                  </Button>
                </HStack>

                <Box
                  mt={5}
                  bg="whiteAlpha.180"
                  backdropFilter="blur(8px)"
                  rounded="2xl"
                  p={4}
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                >
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text fontSize="sm" opacity={0.85}>
                        Current folder
                      </Text>
                      <Heading size="md" mt={1}>
                        {formatFolderLabel(currentFolderPath)}
                      </Heading>
                    </Box>
                    <Icon as={FiClock} boxSize={6} />
                  </HStack>
                  <Text mt={3} fontSize="sm" opacity={0.9}>
                    {folderCount} folder{folderCount === 1 ? "" : "s"} and {fileCount} file
                    {fileCount === 1 ? "" : "s"} shown.
                  </Text>
                </Box>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {uploadQueue.length > 0 && (
          <Card
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            rounded="3xl"
          >
            <CardHeader pb={0}>
              <HStack justify="space-between" align="center">
                <Box>
                  <Heading size="sm">Upload progress</Heading>
                  <Text fontSize="sm" color={mutedText}>
                    {activeUploadCount} file{activeUploadCount === 1 ? "" : "s"} in flight
                  </Text>
                </Box>
                <Icon as={FiClock} color="blue.500" />
              </HStack>
            </CardHeader>
            <CardBody pt={4}>
              <Stack spacing={3}>
                {uploadQueue.map((item) => (
                  <UploadQueueItem key={item.id} item={item} />
                ))}
              </Stack>
            </CardBody>
          </Card>
        )}

        <Card
          bg={panelBg}
          border="1px solid"
          borderColor={dragActive ? highlightBorder : borderColor}
          rounded="3xl"
          shadow="sm"
          position="relative"
          overflow="hidden"
          transition="all 0.2s ease"
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardBody p={{ base: 4, md: 5 }}>
            {dragActive && (
              <Center
                position="absolute"
                inset={0}
                bg="blue.50"
                color="blue.700"
                zIndex={5}
                border="2px dashed"
                borderColor="blue.300"
                pointerEvents="none"
              >
                <VStack spacing={3}>
                  <Center w="64px" h="64px" rounded="2xl" bg="white">
                    <Icon as={FiUploadCloud} boxSize={8} />
                  </Center>
                  <Heading size="md">Drop files here</Heading>
                  <Text fontSize="sm" color="blue.600">
                    PDF, DOCX, TXT, and PPTX files will upload to this folder.
                  </Text>
                </VStack>
              </Center>
            )}

            <Input
              ref={uploadInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.pptx"
              display="none"
              onChange={handleFileInputChange}
            />

            <Input
              ref={folderUploadInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.pptx"
              display="none"
              webkitdirectory=""
              directory=""
              onChange={handleFolderInputChange}
            />

            <Stack spacing={4}>
              <Grid
                templateColumns={{ base: "1fr", xl: "1.4fr 0.8fr 0.8fr 1fr" }}
                gap={3}
              >
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search files or folders"
                    rounded="xl"
                    borderColor={borderColor}
                  />
                </InputGroup>

                <Select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  rounded="xl"
                  borderColor={borderColor}
                >
                  <option value="all">All file types</option>
                  {SUPPORTED_EXTENSIONS.map((extension) => (
                    <option key={extension} value={extension.replace(".", "")}>
                      {extension.toUpperCase()}
                    </option>
                  ))}
                </Select>

                <Select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  rounded="xl"
                  borderColor={borderColor}
                >
                  <option value="all">All dates</option>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </Select>

                <HStack spacing={2}>
                  <Select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    rounded="xl"
                    borderColor={borderColor}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">File name</option>
                    <option value="type">File type</option>
                  </Select>
                  <ButtonGroup isAttached variant="outline" flexShrink={0}>
                    <Tooltip label="List view">
                      <IconButton
                        aria-label="List view"
                        icon={<FiList />}
                        colorScheme={viewMode === "list" ? "blue" : "gray"}
                        variant={viewMode === "list" ? "solid" : "outline"}
                        onClick={() => setViewMode("list")}
                      />
                    </Tooltip>
                    <Tooltip label="Grid view">
                      <IconButton
                        aria-label="Grid view"
                        icon={<FiGrid />}
                        colorScheme={viewMode === "grid" ? "blue" : "gray"}
                        variant={viewMode === "grid" ? "solid" : "outline"}
                        onClick={() => setViewMode("grid")}
                      />
                    </Tooltip>
                  </ButtonGroup>
                </HStack>
              </Grid>

              <Divider />

              <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={5}>
                <Box>
                  <HStack justify="space-between" align="center" mb={3}>
                    <Box>
                      <Heading size="sm">Files and folders</Heading>
                      <Text fontSize="sm" color={mutedText}>
                        {visibleItems.length} item{visibleItems.length === 1 ? "" : "s"} shown
                      </Text>
                    </Box>
                    <Text fontSize="xs" color={mutedText}>
                      Folders appear first
                    </Text>
                  </HStack>

                  <Stack spacing={3}>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, index) => (
                        <Box
                          key={`skeleton-${index}`}
                          p={4}
                          border="1px solid"
                          borderColor={borderColor}
                          rounded="2xl"
                        >
                          <HStack spacing={4}>
                            <Skeleton boxSize="42px" rounded="lg" />
                            <Box flex="1">
                              <Skeleton height="18px" mb={3} />
                              <Skeleton height="12px" width="60%" />
                            </Box>
                          </HStack>
                        </Box>
                      ))
                    ) : visibleItems.length === 0 ? (
                      <Center
                        minH="260px"
                        border="1px dashed"
                        borderColor={borderColor}
                        rounded="3xl"
                        bg={tipBg}
                        px={6}
                        textAlign="center"
                      >
                        <VStack spacing={3}>
                          <Icon as={FiFolder} boxSize={10} color="gray.400" />
                          <Heading size="sm">No items yet</Heading>
                          <Text color={mutedText} maxW="md">
                            Create a folder or upload a file to get started.
                          </Text>
                        </VStack>
                      </Center>
                    ) : viewMode === "grid" ? (
                      <SimpleGrid columns={{ base: 1, md: 2, "2xl": 3 }} spacing={3}>
                        {visibleItems.map(renderGridItem)}
                      </SimpleGrid>
                    ) : (
                      visibleItems.map(renderListItem)
                    )}
                  </Stack>
                </Box>

                <Box
                  display={{ base: "none", xl: "block" }}
                  position="sticky"
                  top="24px"
                  alignSelf="start"
                >
                  <Card
                    bg={panelBg}
                    border="1px solid"
                    borderColor={borderColor}
                    rounded="3xl"
                  >
                    <CardHeader pb={0}>
                      <HStack justify="space-between" align="center">
                        <Box>
                          <Heading size="sm">Preview</Heading>
                          <Text fontSize="sm" color={mutedText}>
                            Quick look
                          </Text>
                        </Box>
                        {selectedItem && (
                          <Badge colorScheme={getFileMeta(selectedItem).color}>
                            {getFileMeta(selectedItem).label}
                          </Badge>
                        )}
                      </HStack>
                    </CardHeader>

                    <CardBody pt={4}>
                      {selectedItem ? (
                        <Stack spacing={4}>
                          <Box>
                            <Heading size="sm" noOfLines={2}>
                              {selectedItem.filename}
                            </Heading>
                            <Text mt={1} fontSize="sm" color={mutedText} noOfLines={1}>
                              {formatFolderLabel(selectedItem.folder_path)} •{" "}
                              {prettyDate(selectedItem.createdAt)}
                            </Text>
                            {!isFolderItem(selectedItem) && (
                              <Text mt={1} fontSize="sm" color={mutedText}>
                                {prettyFileSize(selectedItem.file_size)}
                              </Text>
                            )}
                          </Box>

                          <HStack spacing={2} flexWrap="wrap">
                            {!isFolderItem(selectedItem) && (
                              <Button
                                size="sm"
                                leftIcon={<FiEye />}
                                onClick={() => openFile(selectedItem)}
                              >
                                Preview
                              </Button>
                            )}
                            {!isFolderItem(selectedItem) && (
                              <Button
                                size="sm"
                                leftIcon={<FiDownload />}
                                variant="outline"
                                onClick={() => handleDownload(selectedItem)}
                              >
                                Download
                              </Button>
                            )}
                            {isFolderItem(selectedItem) && (
                              <Button
                                size="sm"
                                leftIcon={<FiFolder />}
                                onClick={() => openFolder(selectedItem)}
                              >
                                Open
                              </Button>
                            )}
                          </HStack>

                          <Box>{filePreviewContent()}</Box>
                        </Stack>
                      ) : (
                        filePreviewContent()
                      )}
                    </CardBody>
                  </Card>
                </Box>
              </Grid>
            </Stack>
          </CardBody>
        </Card>
      </Stack>

      <Modal isOpen={folderModal.isOpen} onClose={folderModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>New folder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={mutedText} mb={3}>
              Create a simple folder in the current location.
            </Text>
            <Input
              value={folderName}
              onChange={(event) => setFolderName(event.target.value)}
              placeholder="Folder name"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={folderModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateFolderConfirm}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={textFileModal.isOpen} onClose={textFileModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>New text file</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={mutedText} mb={3}>
              Create an empty TXT file in the current folder.
            </Text>
            <Input
              value={textFileName}
              onChange={(event) => setTextFileName(event.target.value)}
              placeholder="New text file.txt"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={textFileModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleCreateTextFileConfirm}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={renameModal.isOpen} onClose={renameModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>{isFolderItem(selectedItem) ? "Rename folder" : "Rename file"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={mutedText} mb={3}>
              {isFolderItem(selectedItem)
                ? "Use a simple folder name."
                : "The file extension stays the same."}
            </Text>
            <Input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              placeholder="New name"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={renameModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleRenameConfirm}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={moveModal.isOpen} onClose={moveModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>{isFolderItem(moveTarget) ? "Move folder" : "Move file"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={mutedText} mb={3}>
              Pick a destination folder.
            </Text>
            <Select value={moveValue} onChange={(event) => setMoveValue(event.target.value)}>
              {folderOptions.map((option) => (
                <option
                  key={option.value || "root"}
                  value={option.value}
                  disabled={!isValidMoveTarget(option)}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={moveModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleMoveConfirm}>
              Move
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>{isFolderItem(deleteTarget) ? "Delete folder" : "Delete file"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="700">
                {deleteTarget?.filename}
              </Text>
              ?
            </Text>
            <Text mt={3} fontSize="sm" color={mutedText}>
              {isFolderItem(deleteTarget)
                ? "This removes the folder and everything inside it."
                : "This removes the file from the database and disk."}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={previewModal.isOpen && Boolean(selectedItem) && isMobile}
        onClose={previewModal.onClose}
        size="full"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg={pageBg}>
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            <HStack justify="space-between" pr={10}>
              <Box>
                <Heading size="sm" noOfLines={1}>
                  {selectedItem?.filename}
                </Heading>
                <Text fontSize="xs" color={mutedText}>
                  Mobile preview
                </Text>
              </Box>
              {selectedItem && !isFolderItem(selectedItem) && (
                <Badge colorScheme={getFileMeta(selectedItem).color}>
                  {getFileMeta(selectedItem).label}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={4}>{filePreviewContent()}</ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            {!isFolderItem(selectedItem) && (
              <Button
                variant="outline"
                mr={3}
                onClick={() => handleDownload(selectedItem)}
              >
                Download
              </Button>
            )}
            <Button colorScheme="blue" onClick={previewModal.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ATGFiles;
