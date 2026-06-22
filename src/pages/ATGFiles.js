import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Badge,
  Box,
  Button,
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
  Progress,
  Select,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  FiAlertTriangle,
  FiClock,
  FiDownload,
  FiEdit3,
  FiEye,
  FiFileText,
  FiFolder,
  FiMoreVertical,
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

const API_BASE_URL = process.env.REACT_APP_API_URL || "";
const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".pptx"];
const FILE_TYPE_LABELS = {
  pdf: "PDF",
  docx: "DOCX",
  txt: "TXT",
  pptx: "PPTX",
};

const FILE_TYPE_META = {
  pdf: {
    label: "PDF",
    icon: FaFilePdf,
    color: "red",
    helper: "Portable Document Format",
  },
  docx: {
    label: "DOCX",
    icon: FaFileWord,
    color: "blue",
    helper: "Microsoft Word Document",
  },
  txt: {
    label: "TXT",
    icon: FaFileAlt,
    color: "gray",
    helper: "Plain Text File",
  },
  pptx: {
    label: "PPTX",
    icon: FaFilePowerpoint,
    color: "orange",
    helper: "PowerPoint Presentation",
  },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "File name" },
  { value: "type", label: "File type" },
];

const DATE_FILTERS = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

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
    Math.floor(Math.log(bytes) / Math.log(1024))
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getExtension = (name = "") => {
  const safeName = String(name || "").toLowerCase();
  const dotIndex = safeName.lastIndexOf(".");
  return dotIndex >= 0 ? safeName.slice(dotIndex) : "";
};

const sanitizeFilenameInput = (value) =>
  String(value || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, " ")
    .trim();

const buildUrl = (target) => {
  if (!target) return "";
  if (/^https?:\/\//i.test(target)) return target;

  const base = API_BASE_URL.trim();
  if (!base) return target;

  try {
    return new URL(target, base).toString();
  } catch (error) {
    return target;
  }
};

const buildAbsoluteUrl = (target) => {
  const resolved = buildUrl(target);
  if (/^https?:\/\//i.test(resolved)) return resolved;

  if (typeof window !== "undefined") {
    try {
      return new URL(resolved, window.location.origin).toString();
    } catch (error) {
      return resolved;
    }
  }

  return resolved;
};

const isSupportedFile = (file) => {
  const extension = getExtension(file?.name);
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
};

const getFileMeta = (file) => {
  const extension = getExtension(file?.filename || file?.name).replace(".", "");
  return FILE_TYPE_META[extension] || {
    label: (extension || "FILE").toUpperCase(),
    icon: FiFileText,
    color: "gray",
    helper: "Document",
  };
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
  const dropzoneBg = useColorModeValue("white", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const mutedText = useColorModeValue("gray.500", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightBorder = useColorModeValue("blue.300", "blue.400");
  const tipBg = useColorModeValue("gray.50", "gray.700");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [uploadQueue, setUploadQueue] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const uploadInputRef = useRef(null);

  const {
    isOpen: isRenameOpen,
    onOpen: onRenameOpen,
    onClose: onRenameClose,
  } = useDisclosure();
  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onClose: onPreviewClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildUrl("/api/atg-files"), {
        headers: getAuthHeaders(),
      });
      const records = Array.isArray(response.data) ? response.data : [];
      setFiles(records);
      setSelectedFile((current) => {
        if (current && records.some((file) => file.id === current.id)) {
          return records.find((file) => file.id === current.id) || current;
        }
        return records[0] || null;
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
    fetchFiles();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadPreviewText = async () => {
      if (!selectedFile || selectedFile.file_type !== "txt") {
        setPreviewText("");
        setPreviewError("");
        setPreviewLoading(false);
        return;
      }

      setPreviewLoading(true);
      setPreviewError("");

      try {
        const response = await fetch(buildUrl(selectedFile.preview_url || selectedFile.file_path));

        if (!response.ok) {
          throw new Error("Unable to load text preview");
        }

        const text = await response.text();
        if (!cancelled) {
          setPreviewText(text.slice(0, 50000));
        }
      } catch (error) {
        if (!cancelled) {
          setPreviewError("Preview could not be loaded for this text file.");
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreviewText();

    return () => {
      cancelled = true;
    };
  }, [selectedFile]);

  const handleChooseFiles = () => {
    uploadInputRef.current?.click();
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

  const pushQueueItems = (items) => {
    setUploadQueue((current) => [...current, ...items]);
  };

  const updateQueueItem = (id, nextState) => {
    setUploadQueue((current) =>
      current.map((item) => (item.id === id ? { ...item, ...nextState } : item))
    );
  };

  const removeQueueItem = (id) => {
    setUploadQueue((current) => current.filter((item) => item.id !== id));
  };

  const uploadOneFile = async (file, queueId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploaded_by", localStorage.getItem("username") || "Admin");
    formData.append("category", "General");

    updateQueueItem(queueId, { status: "uploading", progress: 0, error: "" });

    try {
      const response = await axios.post(buildUrl("/api/atg-files"), formData, {
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
      toast({
        title: "Upload complete",
        description: response?.data?.data?.filename || file.name,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      await fetchFiles();
      window.setTimeout(() => removeQueueItem(queueId), 2500);
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
    }
  };

  const handleUploadFiles = async (incomingFiles) => {
    const fileList = Array.from(incomingFiles || []);
    if (!fileList.length) return;

    const acceptedFiles = fileList.filter(isSupportedFile);
    const rejectedFiles = fileList.filter((file) => !isSupportedFile(file));
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
      await uploadOneFile(acceptedFiles[index], queueItems[index].id);
    }
  };

  const handleFileInputChange = async (event) => {
    const filesSelected = Array.from(event.target.files || []);
    event.target.value = "";
    await handleUploadFiles(filesSelected);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    await handleUploadFiles(Array.from(event.dataTransfer.files || []));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const openPreview = (file) => {
    setSelectedFile(file);
    if (isMobile) {
      onPreviewOpen();
    }
  };

  const openRename = (file) => {
    setSelectedFile(file);
    setRenameValue(file?.filename || "");
    onRenameOpen();
  };

  const openDelete = (file) => {
    setDeleteTarget(file);
    onDeleteOpen();
  };

  const handleDownload = (file) => {
    const url = buildUrl(file?.download_url || `/api/atg-files/${file.id}/download`);
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRenameConfirm = async () => {
    if (!selectedFile) return;

    const cleaned = sanitizeFilenameInput(renameValue);
    if (!cleaned) {
      toast({
        title: "Filename required",
        description: "Please enter a new file name.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setRenameSaving(true);

    try {
      const response = await axios.put(
        buildUrl(`/api/atg-files/${selectedFile.id}`),
        { filename: cleaned },
        { headers: getAuthHeaders() }
      );

      toast({
        title: "File renamed",
        description: response?.data?.data?.filename || cleaned,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      onRenameClose();
      await fetchFiles();
      setSelectedFile((current) =>
        current?.id === selectedFile.id
          ? response?.data?.data || current
          : current
      );
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
    } finally {
      setRenameSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(buildUrl(`/api/atg-files/${deleteTarget.id}`), {
        headers: getAuthHeaders(),
      });

      toast({
        title: "File deleted",
        description: deleteTarget.filename,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      setDeleteTarget(null);
      onDeleteClose();
      await fetchFiles();

      setSelectedFile((current) =>
        current?.id === deleteTarget.id ? null : current
      );
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

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matchingFiles = files.filter((file) => {
      const extension = (file.file_type || getExtension(file.filename).slice(1)).toLowerCase();
      const matchesQuery =
        !query ||
        file.filename?.toLowerCase().includes(query) ||
        file.uploaded_by?.toLowerCase().includes(query) ||
        extension.includes(query);

      const matchesType =
        typeFilter === "all" ? true : extension === typeFilter;

      const matchesDate = getUploadAge(file.createdAt, dateFilter);

      return matchesQuery && matchesType && matchesDate;
    });

    const sorter = [...matchingFiles];

    sorter.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      const nameA = (a.filename || "").toLowerCase();
      const nameB = (b.filename || "").toLowerCase();
      const typeA = (a.file_type || "").toLowerCase();
      const typeB = (b.file_type || "").toLowerCase();

      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "name") return nameA.localeCompare(nameB);
      if (sortBy === "type") return typeA.localeCompare(typeB) || dateB - dateA;
      return dateB - dateA;
    });

    return sorter;
  }, [dateFilter, files, searchQuery, sortBy, typeFilter]);

  const summary = useMemo(() => {
    const total = files.length;
    const counts = files.reduce((acc, file) => {
      const type = (file.file_type || getExtension(file.filename).slice(1)).toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      counts,
    };
  }, [files]);

  const previewFileUrl = useMemo(() => {
    if (!selectedFile) return "";
    return buildAbsoluteUrl(selectedFile.preview_url || selectedFile.file_path);
  }, [selectedFile]);

  const officeViewerUrl = useMemo(() => {
    if (!selectedFile) return "";
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      previewFileUrl
    )}`;
  }, [previewFileUrl, selectedFile]);

  const activeUploadCount = uploadQueue.filter(
    (item) => item.status === "queued" || item.status === "uploading"
  ).length;

  const filePreviewContent = () => {
    if (!selectedFile) {
      return (
        <Center minH="320px" color={mutedText} flexDirection="column" px={6}>
          <Icon as={FiFolder} boxSize={12} mb={4} opacity={0.35} />
          <Text fontWeight="700">Select a file to preview</Text>
          <Text fontSize="sm" textAlign="center" mt={2}>
            PDFs and text files open directly. DOCX and PPTX files use a browser viewer when available.
          </Text>
        </Center>
      );
    }

    const meta = getFileMeta(selectedFile);
    const extension = (selectedFile.file_type || getExtension(selectedFile.filename).slice(1)).toLowerCase();

    if (extension === "pdf") {
      return (
        <Box h={{ base: "60vh", xl: "calc(100vh - 360px)" }} minH="480px">
          <iframe
            title={selectedFile.filename}
            src={previewFileUrl}
            style={{ width: "100%", height: "100%", border: "0", borderRadius: "16px" }}
          />
        </Box>
      );
    }

    if (extension === "txt") {
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

    return (
      <Stack spacing={4}>
        <Center
          minH="220px"
          bg="gray.50"
          border="1px dashed"
          borderColor={borderColor}
          rounded="xl"
          p={6}
          textAlign="center"
        >
          <VStack spacing={3}>
            <Icon as={meta.icon} boxSize={12} color={`${meta.color}.500`} />
            <Heading size="sm">{meta.label} preview</Heading>
            <Text fontSize="sm" color={mutedText} maxW="sm">
              {meta.helper}. A browser-based preview will appear here when the file can be accessed directly.
            </Text>
          </VStack>
        </Center>

        <Box
          border="1px solid"
          borderColor={borderColor}
          rounded="xl"
          overflow="hidden"
          minH="240px"
        >
          <iframe
            title={`${selectedFile.filename}-viewer`}
            src={officeViewerUrl}
            style={{ width: "100%", minHeight: "320px", border: "0" }}
          />
        </Box>
      </Stack>
    );
  };

  const statsCards = [
    { label: "Total files", value: summary.total, icon: FiFileText, color: "blue" },
    {
      label: "PDF documents",
      value: summary.counts.pdf || 0,
      icon: FaFilePdf,
      color: "red",
    },
    {
      label: "Word files",
      value: summary.counts.docx || 0,
      icon: FaFileWord,
      color: "blue",
    },
    {
      label: "Presentations",
      value: summary.counts.pptx || 0,
      icon: FaFilePowerpoint,
      color: "orange",
    },
  ];

  return (
    <Box minH="100vh" bg={pageBg} px={{ base: 4, md: 6, xl: 8 }} py={{ base: 4, md: 6 }}>
      <Stack spacing={6} maxW="8xl" mx="auto">
        <Card
          bgGradient="linear(to-r, blue.700, blue.500)"
          color="white"
          borderRadius="3xl"
          overflow="hidden"
          shadow="xl"
        >
          <CardBody p={{ base: 5, md: 8 }}>
            <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6}>
              <Box>
                <Badge
                  colorScheme="whiteAlpha"
                  bg="whiteAlpha.300"
                  textTransform="uppercase"
                  letterSpacing="widest"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  Nextcloud-style document portal
                </Badge>
                <Heading mt={4} size={{ base: "lg", md: "xl" }} fontWeight="900">
                  ATG Files
                </Heading>
                <Text mt={3} fontSize={{ base: "sm", md: "md" }} maxW="2xl" opacity={0.92}>
                  Upload, preview, rename, download, and manage ATG documents in one clean workspace.
                  Only PDF, DOCX, TXT, and PPTX files are accepted.
                </Text>
                <HStack mt={5} spacing={3} flexWrap="wrap">
                  <Button
                    leftIcon={<FiUploadCloud />}
                    bg="white"
                    color="blue.700"
                    _hover={{ bg: "blue.50" }}
                    rounded="full"
                    onClick={handleChooseFiles}
                  >
                    Upload files
                  </Button>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.500"
                    _hover={{ bg: "whiteAlpha.200" }}
                    rounded="full"
                    onClick={fetchFiles}
                  >
                    Refresh
                  </Button>
                </HStack>
              </Box>

              <SimpleGrid columns={{ base: 2, md: 4, xl: 2 }} spacing={3}>
                {statsCards.map((stat) => (
                  <Box
                    key={stat.label}
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
                          {stat.label}
                        </Text>
                        <Heading size="lg" mt={1}>
                          {stat.value}
                        </Heading>
                      </Box>
                      <Icon as={stat.icon} boxSize={6} />
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Grid>
          </CardBody>
        </Card>

        <Card
          bg={dropzoneBg}
          border="1px solid"
          borderColor={dragActive ? highlightBorder : borderColor}
          rounded="3xl"
          shadow="sm"
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          cursor="pointer"
          transition="all 0.2s ease"
          _hover={{ shadow: "md", borderColor: "blue.300" }}
          onClick={handleChooseFiles}
        >
          <CardBody p={{ base: 5, md: 6 }}>
            <Grid templateColumns={{ base: "1fr", xl: "1.5fr 1fr" }} gap={5} alignItems="center">
              <Box>
                <HStack spacing={4} align="start">
                  <Center
                    w="58px"
                    h="58px"
                    rounded="2xl"
                    bg={dragActive ? "blue.100" : "blue.50"}
                    color="blue.600"
                    flexShrink={0}
                  >
                    <Icon as={FiUploadCloud} boxSize={7} />
                  </Center>
                  <Box>
                    <Heading size="md">Upload documents</Heading>
                    <Text mt={2} color={mutedText}>
                      Drag and drop files here, or click to browse. The portal will reject unsupported file types immediately.
                    </Text>
                    <HStack mt={4} spacing={2} flexWrap="wrap">
                      {SUPPORTED_EXTENSIONS.map((extension) => (
                        <Tag key={extension} size="md" colorScheme="blue" variant="subtle" rounded="full">
                          <TagLabel>{extension.toUpperCase()}</TagLabel>
                        </Tag>
                      ))}
                    </HStack>
                  </Box>
                </HStack>
              </Box>

              <Box
                bg={tipBg}
                rounded="2xl"
                border="1px solid"
                borderColor={borderColor}
                p={4}
              >
                <Text fontSize="sm" fontWeight="700" color="gray.600" mb={2}>
                  Upload tip
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  Keep filenames tidy. If you rename a document, the extension is preserved automatically.
                </Text>
              </Box>
            </Grid>

            <Input
              ref={uploadInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.pptx"
              display="none"
              onChange={handleFileInputChange}
            />
          </CardBody>
        </Card>

        {uploadQueue.length > 0 && (
          <Card bg={panelBg} border="1px solid" borderColor={borderColor} rounded="3xl">
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

        <Card bg={panelBg} border="1px solid" borderColor={borderColor} rounded="3xl" shadow="sm">
          <CardBody p={{ base: 4, md: 5 }}>
            <Stack spacing={4}>
              <Grid templateColumns={{ base: "1fr", xl: "1.4fr 0.9fr 0.9fr 0.7fr" }} gap={3}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by name, owner, or file type"
                    rounded="xl"
                    onFocus={() => setSearchFocus(true)}
                    onBlur={() => setSearchFocus(false)}
                    borderColor={searchFocus ? "blue.300" : borderColor}
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
                      {FILE_TYPE_LABELS[extension.replace(".", "")] || extension.toUpperCase()}
                    </option>
                  ))}
                </Select>

                <Select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                  rounded="xl"
                  borderColor={borderColor}
                >
                  {DATE_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </Select>

                <Select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  rounded="xl"
                  borderColor={borderColor}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort: {option.label}
                    </option>
                  ))}
                </Select>
              </Grid>

              <Divider />

              <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={5}>
                <Box>
                  <HStack justify="space-between" align="center" mb={3}>
                    <Box>
                      <Heading size="sm">Files</Heading>
                      <Text fontSize="sm" color={mutedText}>
                        {filteredFiles.length} item{filteredFiles.length === 1 ? "" : "s"} shown
                      </Text>
                    </Box>
                    <Text fontSize="xs" color={mutedText}>
                      Clean, searchable file browsing
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
                    ) : filteredFiles.length === 0 ? (
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
                          <Heading size="sm">No files found</Heading>
                          <Text color={mutedText} maxW="md">
                            Try another search, adjust the date filter, or upload a new document.
                          </Text>
                        </VStack>
                      </Center>
                    ) : (
                      filteredFiles.map((file) => {
                        const meta = getFileMeta(file);
                        const isSelected = selectedFile?.id === file.id;

                        return (
                          <Card
                            key={file.id}
                            border="1px solid"
                            borderColor={isSelected ? "blue.300" : borderColor}
                            rounded="2xl"
                            shadow={isSelected ? "md" : "sm"}
                            transition="all 0.2s ease"
                            _hover={{ shadow: "md", borderColor: "blue.300" }}
                            cursor="pointer"
                            onClick={() => openPreview(file)}
                          >
                            <CardBody p={4}>
                              <HStack align="start" spacing={4}>
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
                                  <HStack justify="space-between" align="start" spacing={3}>
                                    <Box minW={0}>
                                      <Heading size="sm" noOfLines={1}>
                                        {file.filename}
                                      </Heading>
                                      <Text mt={1} fontSize="sm" color={mutedText} noOfLines={1}>
                                        Uploaded by {file.uploaded_by || "Unknown"}
                                      </Text>
                                    </Box>

                                    <Menu placement="bottom-end">
                                      <MenuButton
                                        as={IconButton}
                                        icon={<FiMoreVertical />}
                                        variant="ghost"
                                        size="sm"
                                        aria-label="File actions"
                                        onClick={(event) => event.stopPropagation()}
                                      />
                                      <MenuList onClick={(event) => event.stopPropagation()}>
                                        <MenuItem icon={<FiEye />} onClick={() => openPreview(file)}>
                                          Preview
                                        </MenuItem>
                                        <MenuItem icon={<FiDownload />} onClick={() => handleDownload(file)}>
                                          Download
                                        </MenuItem>
                                        <MenuItem icon={<FiEdit3 />} onClick={() => openRename(file)}>
                                          Rename
                                        </MenuItem>
                                        <MenuItem
                                          icon={<FiTrash2 />}
                                          color="red.500"
                                          onClick={() => openDelete(file)}
                                        >
                                          Delete
                                        </MenuItem>
                                      </MenuList>
                                    </Menu>
                                  </HStack>

                                  <HStack mt={3} spacing={2} flexWrap="wrap">
                                    <Badge colorScheme={`${meta.color}`} variant="subtle" rounded="full">
                                      {meta.label}
                                    </Badge>
                                    <Badge variant="outline" rounded="full">
                                      {prettyFileSize(file.file_size)}
                                    </Badge>
                                    <Badge variant="outline" rounded="full">
                                      {prettyDate(file.createdAt)}
                                    </Badge>
                                  </HStack>
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>
                        );
                      })
                    )}
                  </Stack>
                </Box>

                <Box
                  display={{ base: "none", xl: "block" }}
                  position="sticky"
                  top="24px"
                  alignSelf="start"
                >
                  <Card bg={panelBg} border="1px solid" borderColor={borderColor} rounded="3xl">
                    <CardHeader pb={0}>
                      <HStack justify="space-between" align="center">
                        <Box>
                          <Heading size="sm">Preview</Heading>
                          <Text fontSize="sm" color={mutedText}>
                            Quick view and file actions
                          </Text>
                        </Box>
                        {selectedFile && (
                          <Badge colorScheme={getFileMeta(selectedFile).color}>
                            {getFileMeta(selectedFile).label}
                          </Badge>
                        )}
                      </HStack>
                    </CardHeader>

                    <CardBody pt={4}>
                      {selectedFile ? (
                        <Stack spacing={4}>
                          <Box>
                            <Heading size="sm" noOfLines={2}>
                              {selectedFile.filename}
                            </Heading>
                            <Text mt={1} fontSize="sm" color={mutedText} noOfLines={1}>
                              {prettyDate(selectedFile.createdAt)} • {prettyFileSize(selectedFile.file_size)}
                            </Text>
                          </Box>

                          <HStack spacing={2} flexWrap="wrap">
                            <Button size="sm" leftIcon={<FiEye />} onClick={() => openPreview(selectedFile)}>
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<FiDownload />}
                              variant="outline"
                              onClick={() => handleDownload(selectedFile)}
                            >
                              Download
                            </Button>
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

      <Modal isOpen={isRenameOpen} onClose={onRenameClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Rename file</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={mutedText} mb={3}>
              The original extension is preserved automatically if you leave it out.
            </Text>
            <Input
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              placeholder="New filename"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRenameClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleRenameConfirm} isLoading={renameSaving}>
              Save changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Delete file</ModalHeader>
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
              This will remove the file from the database and delete the stored document from disk.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isPreviewOpen && Boolean(selectedFile) && isMobile}
        onClose={onPreviewClose}
        size="full"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg={pageBg}>
          <ModalHeader borderBottom="1px solid" borderColor={borderColor}>
            <HStack justify="space-between" pr={10}>
              <Box>
                <Heading size="sm" noOfLines={1}>
                  {selectedFile?.filename}
                </Heading>
                <Text fontSize="xs" color={mutedText}>
                  Mobile preview
                </Text>
              </Box>
              {selectedFile && (
                <Badge colorScheme={getFileMeta(selectedFile).color}>
                  {getFileMeta(selectedFile).label}
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={4}>{filePreviewContent()}</ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderColor}>
            <Button variant="outline" mr={3} onClick={() => handleDownload(selectedFile)}>
              Download
            </Button>
            <Button colorScheme="blue" onClick={onPreviewClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ATGFiles;
