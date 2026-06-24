import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DownloadIcon, ExternalLinkIcon, SearchIcon } from "@chakra-ui/icons";
import { BsBoxSeam } from "react-icons/bs";
import {
  FaChevronDown,
  FaChevronRight,
  FaFileAlt,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaFolder,
  FaLayerGroup,
  FaRegFolderOpen,
  FaSitemap,
} from "react-icons/fa";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";
import { resolveApiBaseUrl, joinUrl } from "../../utils/urlResolvers";

const sameId = (left, right) => String(left ?? "") === String(right ?? "");
const hasValue = (value) => value !== undefined && value !== null && String(value) !== "";
const getItemName = (item) => item?.name || item?.title || "Untitled item";
const getQrCode = (item) => String(item?.generated_code || "").trim();

const getCleanUrl = (fileUrl = "") => String(fileUrl).split("?")[0].toLowerCase();
const isImage = (fileUrl) => /\.(jpg|jpeg|png|gif|webp)$/i.test(getCleanUrl(fileUrl));
const isPDF = (fileUrl) => /\.pdf$/i.test(getCleanUrl(fileUrl));
const isText = (fileUrl) => /\.(txt|md|csv|json)$/i.test(getCleanUrl(fileUrl));
const isWord = (fileUrl) => /\.(doc|docx)$/i.test(getCleanUrl(fileUrl));
const isPowerPoint = (fileUrl) => /\.(ppt|pptx)$/i.test(getCleanUrl(fileUrl));

const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  return joinUrl(resolveApiBaseUrl(5003), fileUrl);
};

const normalizeItems = (items, type) =>
  (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    type,
    name: getItemName(item),
    children: [],
  }));

const getTypeMeta = (type) => {
  switch (type) {
    case "shelf":
      return { icon: FaLayerGroup, color: "teal.500", colorScheme: "teal", label: "Shelf" };
    case "container":
      return { icon: BsBoxSeam, color: "orange.500", colorScheme: "orange", label: "Container" };
    case "folder":
      return { icon: FaFolder, color: "yellow.500", colorScheme: "yellow", label: "Folder" };
    case "document":
      return { icon: FaFileAlt, color: "blue.500", colorScheme: "blue", label: "Document" };
    default:
      return { icon: FaFileAlt, color: "gray.500", colorScheme: "gray", label: "Item" };
  }
};

const getDocumentIcon = (document) => {
  const source = document?.file_url || document?.type || document?.name || "";
  const clean = getCleanUrl(source);

  if (clean.includes("pdf")) return { icon: FaFilePdf, color: "red.500", label: "PDF" };
  if (clean.includes("doc")) return { icon: FaFileWord, color: "blue.500", label: "DOCX" };
  if (clean.includes("ppt")) return { icon: FaFilePowerpoint, color: "orange.500", label: "PPTX" };
  return { icon: FaFileAlt, color: "gray.500", label: "FILE" };
};

const buildTree = ({ shelves, containers, folders, documents }) =>
  shelves.map((shelf) => {
    const shelfContainers = containers
      .filter((container) => sameId(container.shelf_id, shelf.id))
      .map((container) => {
        const containerFolders = folders
          .filter((folder) => sameId(folder.container_id, container.id))
          .map((folder) => {
            const folderDocuments = documents
              .filter((document) => sameId(document.folder_id, folder.id))
              .map((document) => ({ ...document, type: "document", children: [] }));

            return {
              ...folder,
              type: "folder",
              count: folderDocuments.length,
              children: folderDocuments,
            };
          });

        const directDocuments = documents
          .filter(
            (document) =>
              !hasValue(document.folder_id) && sameId(document.container_id, container.id)
          )
          .map((document) => ({ ...document, type: "document", children: [] }));

        return {
          ...container,
          type: "container",
          count: containerFolders.length + directDocuments.length,
          children: [...containerFolders, ...directDocuments],
        };
      });

    const directShelfDocuments = documents
      .filter(
        (document) =>
          !hasValue(document.folder_id) &&
          !hasValue(document.container_id) &&
          sameId(document.shelf_id, shelf.id)
      )
      .map((document) => ({ ...document, type: "document", children: [] }));

    return {
      ...shelf,
      type: "shelf",
      count: shelfContainers.length + directShelfDocuments.length,
      children: [...shelfContainers, ...directShelfDocuments],
    };
  });

const filterTree = (nodes, term) => {
  const keyword = term.trim().toLowerCase();
  if (!keyword) return nodes;

  return nodes
    .map((node) => {
      const filteredChildren = filterTree(node.children || [], keyword);
      const matches =
        getItemName(node).toLowerCase().includes(keyword) ||
        getQrCode(node).toLowerCase().includes(keyword) ||
        node.type.toLowerCase().includes(keyword);

      if (!matches && filteredChildren.length === 0) return null;
      return { ...node, children: filteredChildren };
    })
    .filter(Boolean);
};

const getPathForItem = (item, allData) => {
  if (!item || !allData) return [];

  if (item.type === "shelf") return [item];

  if (item.type === "container") {
    const shelf = allData.shelves.find((candidate) => sameId(candidate.id, item.shelf_id));
    return [shelf, item].filter(Boolean);
  }

  if (item.type === "folder") {
    const container = allData.containers.find((candidate) =>
      sameId(candidate.id, item.container_id)
    );
    const shelf = allData.shelves.find((candidate) =>
      sameId(candidate.id, container?.shelf_id)
    );
    return [shelf, container, item].filter(Boolean);
  }

  const folder = allData.folders.find((candidate) => sameId(candidate.id, item.folder_id));
  const container = allData.containers.find(
    (candidate) =>
      sameId(candidate.id, folder?.container_id) || sameId(candidate.id, item.container_id)
  );
  const shelf = allData.shelves.find(
    (candidate) => sameId(candidate.id, container?.shelf_id) || sameId(candidate.id, item.shelf_id)
  );

  return [shelf, container, folder, item].filter(Boolean);
};

const TreeNode = ({ item, level = 0, onSelect, selectedItem, palette, forceOpen = false }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const expanded = forceOpen || isExpanded;
  const selected = selectedItem?.type === item.type && sameId(selectedItem?.id, item.id);
  const meta = getTypeMeta(item.type);
  const Chevron = expanded ? FaChevronDown : FaChevronRight;

  const handleClick = () => {
    if (hasChildren) setIsExpanded((prev) => !prev);
    onSelect(item);
  };

  return (
    <VStack align="stretch" spacing={1} w="100%">
      <Flex
        align="center"
        bg={selected ? palette.selectedBg : "transparent"}
        borderRadius="xl"
        color={selected ? palette.selectedText : palette.textColor}
        cursor="pointer"
        gap={2}
        minH="40px"
        onClick={handleClick}
        pl={`${level * 18 + 8}px`}
        pr={2}
        py={2}
        transition="all 0.18s ease"
        _hover={{ bg: selected ? palette.selectedHoverBg : palette.hoverBg }}
      >
        {hasChildren ? (
          <Icon as={Chevron} boxSize={3} color={palette.chevron} />
        ) : (
          <Box w="12px" />
        )}
        <Icon as={meta.icon} boxSize={4} color={meta.color} />
        <Text flex="1" fontSize="sm" fontWeight={selected ? "800" : "600"} noOfLines={1}>
          {getItemName(item)}
        </Text>
        {item.count > 0 && (
          <Badge borderRadius="full" colorScheme={meta.colorScheme} fontSize="0.68rem">
            {item.count}
          </Badge>
        )}
      </Flex>

      {hasChildren && (
        <Collapse in={expanded} animateOpacity>
          <VStack align="stretch" spacing={1}>
            {item.children.map((child) => (
              <TreeNode
                forceOpen={forceOpen}
                item={child}
                key={`${child.type}-${child.id}`}
                level={level + 1}
                onSelect={onSelect}
                palette={palette}
                selectedItem={selectedItem}
              />
            ))}
          </VStack>
        </Collapse>
      )}
    </VStack>
  );
};

const InfoTile = ({ icon, label, value, colorScheme }) => (
  <Flex
    align="center"
    bg={`${colorScheme}.50`}
    border="1px solid"
    borderColor={`${colorScheme}.100`}
    borderRadius="2xl"
    gap={3}
    p={4}
  >
    <Flex
      align="center"
      bg="white"
      borderRadius="xl"
      color={`${colorScheme}.600`}
      h="42px"
      justify="center"
      w="42px"
    >
      <Icon as={icon} />
    </Flex>
    <Box>
      <Text color={`${colorScheme}.700`} fontSize="2xl" fontWeight="900" lineHeight="1">
        {value}
      </Text>
      <Text color={`${colorScheme}.700`} fontSize="sm" fontWeight="700">
        {label}
      </Text>
    </Box>
  </Flex>
);

const RelatedItemCard = ({ item, onOpen, onPreview }) => {
  const meta = item.type === "document" ? getDocumentIcon(item) : getTypeMeta(item.type);
  const cardBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      boxShadow="0 14px 32px rgba(15, 23, 42, 0.07)"
      h="100%"
      p={4}
      transition="all 0.18s ease"
      _hover={{ transform: "translateY(-2px)", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.12)" }}
    >
      <VStack align="stretch" h="100%" spacing={4}>
        <HStack align="flex-start" spacing={3}>
          <Flex
            align="center"
            bg={mutedBg}
            borderRadius="xl"
            h="44px"
            justify="center"
            w="44px"
          >
            <Icon as={meta.icon} boxSize={5} color={meta.color} />
          </Flex>
          <Box minW={0}>
            <Text color={headingColor} fontSize="md" fontWeight="900" noOfLines={2}>
              {getItemName(item)}
            </Text>
            <HStack flexWrap="wrap" mt={2} spacing={2}>
              <Badge borderRadius="full" colorScheme={meta.colorScheme || "blue"} px={2}>
                {meta.label}
              </Badge>
              {getQrCode(item) && (
                <Badge borderRadius="full" colorScheme="gray" px={2}>
                  {getQrCode(item)}
                </Badge>
              )}
            </HStack>
          </Box>
        </HStack>

        <Text color={mutedText} flex="1" fontSize="sm" noOfLines={3}>
          {item.description || "No description added."}
        </Text>

        <Button
          colorScheme={item.type === "document" ? "blue" : getTypeMeta(item.type).colorScheme}
          onClick={() => (item.type === "document" ? onPreview(item) : onOpen(item))}
          variant={item.type === "document" ? "solid" : "outline"}
        >
          {item.type === "document" ? "Preview document" : "View details"}
        </Button>
      </VStack>
    </Box>
  );
};

const GlobalTreePage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [allData, setAllData] = useState(null);
  const [treeData, setTreeData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const selectedBg = useColorModeValue("teal.50", "teal.900");
  const selectedHoverBg = useColorModeValue("teal.100", "teal.800");
  const selectedText = useColorModeValue("teal.800", "teal.100");
  const chevronColor = useColorModeValue("gray.500", "gray.400");

  const palette = useMemo(
    () => ({
      hoverBg,
      selectedBg,
      selectedHoverBg,
      selectedText,
      textColor: headingColor,
      chevron: chevronColor,
    }),
    [hoverBg, selectedBg, selectedHoverBg, selectedText, headingColor, chevronColor]
  );

  const filteredTree = useMemo(() => filterTree(treeData, search), [treeData, search]);

  const selectedItemContent = useMemo(() => {
    if (!selectedItem || !allData) return [];

    if (selectedItem.type === "shelf") {
      const containers = allData.containers.filter((container) =>
        sameId(container.shelf_id, selectedItem.id)
      );
      const directDocuments = allData.documents.filter(
        (document) =>
          !hasValue(document.folder_id) &&
          !hasValue(document.container_id) &&
          sameId(document.shelf_id, selectedItem.id)
      );
      return [...containers, ...directDocuments];
    }

    if (selectedItem.type === "container") {
      const folders = allData.folders.filter((folder) =>
        sameId(folder.container_id, selectedItem.id)
      );
      const directDocuments = allData.documents.filter(
        (document) => !hasValue(document.folder_id) && sameId(document.container_id, selectedItem.id)
      );
      return [...folders, ...directDocuments];
    }

    if (selectedItem.type === "folder") {
      return allData.documents.filter((document) => sameId(document.folder_id, selectedItem.id));
    }

    return [];
  }, [allData, selectedItem]);

  const selectedPath = useMemo(
    () => getPathForItem(selectedItem, allData),
    [selectedItem, allData]
  );

  const summary = useMemo(() => {
    if (!allData) {
      return { shelves: 0, containers: 0, folders: 0, documents: 0 };
    }

    return {
      shelves: allData.shelves.length,
      containers: allData.containers.length,
      folders: allData.folders.length,
      documents: allData.documents.length,
    };
  }, [allData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const [shelvesData, containersData, foldersData, documentsData] =
          await Promise.all([
            getAllData("Shelves"),
            getAllData("Containers"),
            getAllData("Folders"),
            getAllData("Documents"),
          ]);

        const nextData = {
          shelves: normalizeItems(shelvesData, "shelf"),
          containers: normalizeItems(containersData, "container"),
          folders: normalizeItems(foldersData, "folder"),
          documents: normalizeItems(documentsData, "document"),
        };

        const nextTree = buildTree(nextData);
        setAllData(nextData);
        setTreeData(nextTree);
        setSelectedItem((current) => current || nextTree[0] || null);
      } catch (error) {
        console.error("Failed to fetch tree data:", error);
        setErrorMessage(error.message || "Unable to load File Organizer tree.");
        toast({
          title: "Unable to load tree",
          description: error.message,
          status: "error",
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    const fileUrl = resolveFileUrl(selectedFile?.file_url);

    if (!selectedFile || !isText(fileUrl)) {
      setPreviewText("");
      setPreviewError("");
      setPreviewLoading(false);
      return;
    }

    let active = true;
    setPreviewLoading(true);
    setPreviewError("");

    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load text preview.");
        return response.text();
      })
      .then((text) => {
        if (active) setPreviewText(text.slice(0, 12000));
      })
      .catch((error) => {
        if (active) setPreviewError(error.message || "Unable to load text preview.");
      })
      .finally(() => {
        if (active) setPreviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedFile]);

  const openFileModal = (file) => {
    setSelectedFile(file);
    onOpen();
  };

  const renderPreview = () => {
    const fileUrl = resolveFileUrl(selectedFile?.file_url);

    if (!fileUrl) {
      return (
        <Center bg={mutedBg} borderRadius="2xl" minH="360px" p={8} textAlign="center">
          <VStack color={mutedText} spacing={3}>
            <Icon as={FaFileAlt} boxSize={10} />
            <Text fontWeight="800">No file URL saved for this document.</Text>
          </VStack>
        </Center>
      );
    }

    if (isImage(fileUrl)) {
      return (
        <Center bg={mutedBg} borderRadius="2xl" minH="360px" p={4}>
          <Image alt={getItemName(selectedFile)} maxH="70vh" objectFit="contain" src={fileUrl} />
        </Center>
      );
    }

    if (isPDF(fileUrl)) {
      return (
        <Box border="1px solid" borderColor={borderColor} borderRadius="2xl" overflow="hidden">
          <iframe
            src={fileUrl}
            title={getItemName(selectedFile)}
            style={{ width: "100%", height: "72vh", border: "none" }}
          />
        </Box>
      );
    }

    if (isText(fileUrl)) {
      return (
        <Box bg={mutedBg} borderRadius="2xl" maxH="70vh" overflow="auto" p={5}>
          {previewLoading ? (
            <Center minH="260px">
              <Spinner color="teal.500" size="lg" />
            </Center>
          ) : previewError ? (
            <Alert borderRadius="xl" status="error">
              <AlertIcon />
              {previewError}
            </Alert>
          ) : (
            <Text as="pre" fontFamily="mono" fontSize="sm" whiteSpace="pre-wrap">
              {previewText || "This text file is empty."}
            </Text>
          )}
        </Box>
      );
    }

    return (
      <Center bg={mutedBg} borderRadius="2xl" minH="360px" p={8} textAlign="center">
        <VStack color={mutedText} spacing={4}>
          <Icon
            as={isWord(fileUrl) ? FaFileWord : isPowerPoint(fileUrl) ? FaFilePowerpoint : FaFileAlt}
            boxSize={12}
            color={isWord(fileUrl) ? "blue.500" : isPowerPoint(fileUrl) ? "orange.500" : "gray.500"}
          />
          <Box>
            <Heading color={headingColor} size="md">
              Preview not available in the browser
            </Heading>
            <Text mt={2} maxW="480px">
              Word and PowerPoint files usually need to be opened or downloaded.
            </Text>
          </Box>
        </VStack>
      </Center>
    );
  };

  const renderSelectedDetails = () => {
    if (!selectedItem) {
      return (
        <Center bg={panelBg} borderRadius="3xl" minH="460px" p={8} textAlign="center">
          <VStack color={mutedText} spacing={3}>
            <Icon as={FaSitemap} boxSize={12} />
            <Heading color={headingColor} size="md">
              Select an item
            </Heading>
            <Text>Choose a shelf, container, folder, or document from the tree.</Text>
          </VStack>
        </Center>
      );
    }

    const meta = selectedItem.type === "document" ? getDocumentIcon(selectedItem) : getTypeMeta(selectedItem.type);

    return (
      <VStack align="stretch" spacing={6}>
        <Box
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="3xl"
          boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
          p={{ base: 5, md: 6 }}
        >
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" spacing={5}>
            <HStack align="flex-start" spacing={4}>
              <Flex
                align="center"
                bg={mutedBg}
                borderRadius="2xl"
                h="56px"
                justify="center"
                w="56px"
              >
                <Icon as={meta.icon} boxSize={7} color={meta.color} />
              </Flex>
              <Box minW={0}>
                <HStack flexWrap="wrap" mb={2} spacing={2}>
                  <Badge borderRadius="full" colorScheme={meta.colorScheme || "blue"} px={3} py={1}>
                    {meta.label}
                  </Badge>
                  {getQrCode(selectedItem) && (
                    <Badge borderRadius="full" colorScheme="gray" px={3} py={1}>
                      {getQrCode(selectedItem)}
                    </Badge>
                  )}
                </HStack>
                <Heading color={headingColor} size="lg" noOfLines={2}>
                  {getItemName(selectedItem)}
                </Heading>
                <Text color={mutedText} fontSize="sm" mt={2} maxW="680px">
                  {selectedItem.description || "No description added."}
                </Text>
              </Box>
            </HStack>

            {selectedItem.type === "document" && (
              <Button colorScheme="blue" onClick={() => openFileModal(selectedItem)}>
                Preview document
              </Button>
            )}
          </Stack>

          {selectedPath.length > 0 && (
            <>
              <Divider my={5} />
              <HStack flexWrap="wrap" spacing={2}>
                {selectedPath.map((pathItem, index) => {
                  const pathMeta = getTypeMeta(pathItem.type);
                  return (
                    <HStack key={`${pathItem.type}-${pathItem.id}-${index}`} spacing={2}>
                      {index > 0 && <Text color={mutedText}>/</Text>}
                      <Badge
                        borderRadius="full"
                        colorScheme={pathMeta.colorScheme}
                        cursor="pointer"
                        onClick={() => setSelectedItem(pathItem)}
                        px={3}
                        py={1}
                      >
                        <HStack spacing={1}>
                          <Icon as={pathMeta.icon} />
                          <Text>{getItemName(pathItem)}</Text>
                        </HStack>
                      </Badge>
                    </HStack>
                  );
                })}
              </HStack>
            </>
          )}
        </Box>

        {selectedItemContent.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
            {selectedItemContent.map((item) => (
              <RelatedItemCard
                item={item}
                key={`${item.type}-${item.id}`}
                onOpen={setSelectedItem}
                onPreview={openFileModal}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center
            bg={panelBg}
            border="1px dashed"
            borderColor={borderColor}
            borderRadius="3xl"
            minH="220px"
            p={8}
            textAlign="center"
          >
            <VStack color={mutedText} spacing={3}>
              <Icon as={FaRegFolderOpen} boxSize={10} />
              <Heading color={headingColor} size="md">
                No child items
              </Heading>
              <Text>
                {selectedItem.type === "document"
                  ? "This document has no child items."
                  : `This ${selectedItem.type} does not contain anything yet.`}
              </Text>
            </VStack>
          </Center>
        )}
      </VStack>
    );
  };

  return (
    <Box bg={pageBg} minH="100vh" mt={12} px={{ base: 3, md: 5 }} py={6} w="full">
      <Box w="full">
        <Flex
          align={{ base: "flex-start", lg: "center" }}
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="3xl"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.08)"
          direction={{ base: "column", lg: "row" }}
          gap={6}
          justify="space-between"
          p={{ base: 5, md: 8 }}
        >
          <HStack align="flex-start" spacing={4}>
            <Flex
              align="center"
              bg="teal.50"
              borderRadius="2xl"
              color="teal.600"
              h="58px"
              justify="center"
              w="58px"
            >
              <Icon as={FaSitemap} boxSize={7} />
            </Flex>
            <Box>
              <Badge borderRadius="full" colorScheme="teal" mb={3} px={3} py={1}>
                Tree view
              </Badge>
              <Heading color={headingColor} size="xl">
                File Organizer Tree
              </Heading>
              <Text color={mutedText} fontSize={{ base: "md", md: "lg" }} mt={2}>
                Browse every shelf, container, folder, and document in one connected view.
              </Text>
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} w={{ base: "100%", lg: "560px" }}>
            <InfoTile colorScheme="teal" icon={FaLayerGroup} label="Shelves" value={summary.shelves} />
            <InfoTile colorScheme="orange" icon={BsBoxSeam} label="Containers" value={summary.containers} />
            <InfoTile colorScheme="yellow" icon={FaFolder} label="Folders" value={summary.folders} />
            <InfoTile colorScheme="blue" icon={FaFileAlt} label="Documents" value={summary.documents} />
          </SimpleGrid>
        </Flex>

        {loading ? (
          <Center minH="520px">
            <VStack spacing={4}>
              <Spinner color="teal.500" size="xl" />
              <Text color={mutedText}>Loading File Organizer tree...</Text>
            </VStack>
          </Center>
        ) : errorMessage ? (
          <Alert borderRadius="2xl" mt={6} status="error">
            <AlertIcon />
            {errorMessage}
          </Alert>
        ) : (
          <Flex
            align="stretch"
            direction={{ base: "column", lg: "row" }}
            gap={6}
            mt={6}
          >
            <Box
              bg={panelBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="3xl"
              boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
              flexShrink={0}
              maxH={{ base: "none", lg: "calc(100vh - 220px)" }}
              overflow="hidden"
              w={{ base: "100%", lg: "380px" }}
            >
              <Box borderBottom="1px solid" borderColor={borderColor} p={5}>
                <Heading color={headingColor} size="md">
                  Explorer
                </Heading>
                <Text color={mutedText} fontSize="sm" mt={1}>
                  Search by name, type, or generated code.
                </Text>
                <InputGroup mt={4}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    borderRadius="xl"
                    placeholder="Search tree"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </InputGroup>
              </Box>

              <Box maxH={{ base: "460px", lg: "calc(100vh - 390px)" }} overflowY="auto" p={3}>
                {filteredTree.length > 0 ? (
                  <VStack align="stretch" spacing={1}>
                    {filteredTree.map((shelf) => (
                      <TreeNode
                        forceOpen={Boolean(search)}
                        item={shelf}
                        key={`shelf-${shelf.id}`}
                        onSelect={setSelectedItem}
                        palette={palette}
                        selectedItem={selectedItem}
                      />
                    ))}
                  </VStack>
                ) : (
                  <Center minH="220px" textAlign="center">
                    <VStack color={mutedText} spacing={3}>
                      <Icon as={FaSitemap} boxSize={8} />
                      <Text fontWeight="800">No matching items</Text>
                      <Text fontSize="sm">Try a different search word.</Text>
                    </VStack>
                  </Center>
                )}
              </Box>
            </Box>

            <Box flex="1" minW={0}>
              {renderSelectedDetails()}
            </Box>
          </Flex>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader pr={12}>
            <HStack spacing={3}>
              <Icon as={getDocumentIcon(selectedFile).icon} color={getDocumentIcon(selectedFile).color} />
              <Text noOfLines={1}>{getItemName(selectedFile)}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>{selectedFile && renderPreview()}</ModalBody>
          <ModalFooter gap={3}>
            {selectedFile?.file_url && (
              <>
                <Button
                  as={Link}
                  colorScheme="blue"
                  download
                  href={resolveFileUrl(selectedFile.file_url)}
                  leftIcon={<DownloadIcon />}
                >
                  Download
                </Button>
                <Button
                  as={Link}
                  href={resolveFileUrl(selectedFile.file_url)}
                  isExternal
                  leftIcon={<ExternalLinkIcon />}
                  variant="outline"
                >
                  Open in new tab
                </Button>
              </>
            )}
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GlobalTreePage;
