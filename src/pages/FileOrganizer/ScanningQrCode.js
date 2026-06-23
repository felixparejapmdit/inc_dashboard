import React, { useEffect, useMemo, useState } from "react";
import QrScanner from "react-qr-scanner";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListIcon,
  ListItem,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { BsBoxSeam } from "react-icons/bs";
import { FiCamera } from "react-icons/fi";
import {
  FaBarcode,
  FaCheckCircle,
  FaExchangeAlt,
  FaFileAlt,
  FaFolder,
  FaLayerGroup,
  FaQrcode,
} from "react-icons/fa";
import { getShelves } from "../../utils/FileOrganizer/shelvesService";
import { getContainers, updateContainer } from "../../utils/FileOrganizer/containersService";
import { getFolders, updateFolder } from "../../utils/FileOrganizer/foldersService";
import { getDocuments, updateDocument } from "../../utils/FileOrganizer/documentsService";

const sameId = (left, right) => String(left ?? "") === String(right ?? "");
const hasValue = (value) => value !== undefined && value !== null && String(value) !== "";
const getItemName = (item) => item?.name || item?.title || "Untitled item";

const normalizeQrValue = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const codeFromQuery = url.searchParams.get("code") || url.searchParams.get("qr");
    if (codeFromQuery) return codeFromQuery.trim().toLowerCase();

    const lastPathSegment = url.pathname.split("/").filter(Boolean).pop();
    return (lastPathSegment || raw).trim().toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
};

const findLocationData = (qrValue, allData) => {
  const { shelves, containers, folders, documents } = allData;

  const findMatch = (arr) =>
    arr.find((item) => normalizeQrValue(item.generated_code) === qrValue);

  const document = findMatch(documents);
  if (document) {
    const folderOfDoc = folders.find((folder) => sameId(folder.id, document.folder_id));
    const containerOfDoc = containers.find(
      (container) =>
        sameId(container.id, folderOfDoc?.container_id) ||
        sameId(container.id, document.container_id)
    );
    const shelfOfDoc = shelves.find(
      (shelf) =>
        sameId(shelf.id, containerOfDoc?.shelf_id) ||
        sameId(shelf.id, document.shelf_id)
    );

    return {
      type: "document",
      document,
      folder: folderOfDoc,
      container: containerOfDoc,
      shelf: shelfOfDoc,
    };
  }

  const folder = findMatch(folders);
  if (folder) {
    const containerOfFolder = containers.find((container) =>
      sameId(container.id, folder.container_id)
    );
    const shelfOfFolder = shelves.find((shelf) =>
      sameId(shelf.id, containerOfFolder?.shelf_id)
    );
    const docsUnderFolder = documents.filter((doc) => sameId(doc.folder_id, folder.id));

    return {
      type: "folder",
      folder,
      container: containerOfFolder,
      shelf: shelfOfFolder,
      documents: docsUnderFolder,
    };
  }

  const container = findMatch(containers);
  if (container) {
    const shelfOfContainer = shelves.find((shelf) =>
      sameId(shelf.id, container.shelf_id)
    );
    const foldersUnderContainer = folders.filter((folder) =>
      sameId(folder.container_id, container.id)
    );
    const docsFromFolders = documents.filter((doc) =>
      foldersUnderContainer.some((folder) => sameId(folder.id, doc.folder_id))
    );
    const docsDirectInContainer = documents.filter(
      (doc) => !hasValue(doc.folder_id) && sameId(doc.container_id, container.id)
    );

    return {
      type: "container",
      container,
      shelf: shelfOfContainer,
      folders: foldersUnderContainer,
      documents: [...docsFromFolders, ...docsDirectInContainer],
    };
  }

  const shelf = findMatch(shelves);
  if (shelf) {
    const containersUnderShelf = containers.filter((container) =>
      sameId(container.shelf_id, shelf.id)
    );
    const foldersUnderShelf = folders.filter((folder) =>
      containersUnderShelf.some((container) => sameId(container.id, folder.container_id))
    );
    const docsFromFolders = documents.filter((doc) =>
      foldersUnderShelf.some((folder) => sameId(folder.id, doc.folder_id))
    );
    const docsDirectInContainers = documents.filter(
      (doc) =>
        !hasValue(doc.folder_id) &&
        containersUnderShelf.some((container) => sameId(container.id, doc.container_id))
    );
    const docsDirectInShelf = documents.filter(
      (doc) =>
        !hasValue(doc.folder_id) &&
        !hasValue(doc.container_id) &&
        sameId(doc.shelf_id, shelf.id)
    );

    return {
      type: "shelf",
      shelf,
      containers: containersUnderShelf,
      folders: foldersUnderShelf,
      documents: [...docsFromFolders, ...docsDirectInContainers, ...docsDirectInShelf],
    };
  }

  return null;
};

const ScanningQrCode = () => {
  const toast = useToast();

  const [scanResult, setScanResult] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState("");
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [dataLoading, setDataLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [scanKey, setScanKey] = useState(0);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [selectedContainer, setSelectedContainer] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");

  const [allData, setAllData] = useState({
    shelves: [],
    containers: [],
    folders: [],
    documents: [],
  });

  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const strongBorder = useColorModeValue("teal.200", "teal.700");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  const filteredContainers = useMemo(
    () =>
      allData.containers.filter((container) =>
        sameId(container.shelf_id, selectedShelf)
      ),
    [allData.containers, selectedShelf]
  );

  const filteredFolders = useMemo(
    () =>
      allData.folders.filter((folder) =>
        sameId(folder.container_id, selectedContainer)
      ),
    [allData.folders, selectedContainer]
  );

  const scannedItem = locationData?.[locationData?.type];

  const fetchData = async () => {
    setDataLoading(true);
    setError("");

    try {
      const [shelves, containers, folders, documents] = await Promise.all([
        getShelves(),
        getContainers(),
        getFolders(),
        getDocuments(),
      ]);

      setAllData({
        shelves: Array.isArray(shelves) ? shelves : [],
        containers: Array.isArray(containers) ? containers : [],
        folders: Array.isArray(folders) ? folders : [],
        documents: Array.isArray(documents) ? documents : [],
      });
    } catch (err) {
      console.error("Failed to fetch scanner data:", err);
      setError("Could not load shelves, containers, folders, and documents.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      setCameraAvailable(false);
    }

    fetchData();
  }, []);

  const processQrValue = (rawValue) => {
    const qrValue = normalizeQrValue(rawValue);
    if (!qrValue || resolving || dataLoading) return;
    if (qrValue === scanResult && locationData) return;

    setResolving(true);
    setScanResult(qrValue);
    setLocationData(null);
    setError("");
    setIsMoveMode(false);
    setSelectedShelf("");
    setSelectedContainer("");
    setSelectedFolder("");

    const foundData = findLocationData(qrValue, allData);
    if (foundData) {
      setLocationData(foundData);
    } else {
      setError("No shelf, container, folder, or document matches this QR code.");
    }

    setResolving(false);
  };

  const handleScan = (data) => {
    if (data?.text) {
      processQrValue(data.text);
    }
  };

  const handleScannerError = (err) => {
    console.error("QR scanner error:", err);
    if (err?.name === "NotAllowedError" || err?.name === "NotFoundError") {
      setCameraAvailable(false);
    }
  };

  const clearScan = () => {
    setScanResult("");
    setManualCode("");
    setLocationData(null);
    setError("");
    setResolving(false);
    setScanKey((prevKey) => prevKey + 1);
    setIsMoveMode(false);
    setSelectedShelf("");
    setSelectedContainer("");
    setSelectedFolder("");
  };

  const handleMove = async () => {
    if (!locationData) return;

    const { type, container, folder, document } = locationData;

    try {
      if (type === "container") {
        if (!selectedShelf) {
          throw new Error("Please choose a shelf.");
        }

        await updateContainer(container.id, { shelf_id: Number(selectedShelf) });
      } else if (type === "folder") {
        if (!selectedContainer) {
          throw new Error("Please choose a container.");
        }

        await updateFolder(folder.id, { container_id: Number(selectedContainer) });
      } else if (type === "document") {
        if (!selectedContainer && !selectedFolder) {
          throw new Error("Please choose a container or folder.");
        }

        await updateDocument(document.id, {
          container_id: selectedFolder ? null : Number(selectedContainer),
          folder_id: selectedFolder ? Number(selectedFolder) : null,
          shelf_id: selectedShelf ? Number(selectedShelf) : document.shelf_id,
        });
      }

      toast({
        title: "Location updated",
        description: "The item was moved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      await fetchData();
      clearScan();
    } catch (err) {
      toast({
        title: "Move failed",
        description: err.message || "Please check the selected location.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const Section = ({ title, items, icon, color = "teal.500" }) => (
    <Box>
      <Text color={textColor} fontSize="sm" fontWeight="800" mb={3}>
        {title}
      </Text>
      {items && items.length > 0 ? (
        <List spacing={2}>
          {items.slice(0, 8).map((item) => (
            <ListItem key={item.id}>
              <ListIcon as={icon} color={color} />
              <Text as="span" color={mutedText} fontSize="sm" noOfLines={1}>
                {getItemName(item)}
              </Text>
            </ListItem>
          ))}
          {items.length > 8 && (
            <Text color={mutedText} fontSize="xs" fontWeight="700" pl={6}>
              +{items.length - 8} more
            </Text>
          )}
        </List>
      ) : (
        <Text color={mutedText} fontSize="sm" fontStyle="italic">
          No {title.toLowerCase()} found.
        </Text>
      )}
    </Box>
  );

  const renderMoveControls = () => {
    if (!locationData || locationData.type === "shelf") {
      return (
        <Alert borderRadius="xl" status="info">
          <AlertIcon />
          Shelves are the top level and cannot be moved.
        </Alert>
      );
    }

    return (
      <VStack align="stretch" spacing={4}>
        <FormControl>
          <FormLabel fontSize="sm" fontWeight="800">
            Shelf
          </FormLabel>
          <Select
            borderRadius="xl"
            placeholder="Choose shelf"
            value={selectedShelf}
            onChange={(event) => {
              setSelectedShelf(event.target.value);
              setSelectedContainer("");
              setSelectedFolder("");
            }}
          >
            {allData.shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.name}
              </option>
            ))}
          </Select>
        </FormControl>

        {(locationData.type === "folder" || locationData.type === "document") && (
          <FormControl isDisabled={!selectedShelf}>
            <FormLabel fontSize="sm" fontWeight="800">
              Container
            </FormLabel>
            <Select
              borderRadius="xl"
              placeholder="Choose container"
              value={selectedContainer}
              onChange={(event) => {
                setSelectedContainer(event.target.value);
                setSelectedFolder("");
              }}
            >
              {filteredContainers.map((container) => (
                <option key={container.id} value={container.id}>
                  {container.name}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        {locationData.type === "document" && (
          <FormControl isDisabled={!selectedContainer}>
            <FormLabel fontSize="sm" fontWeight="800">
              Folder
            </FormLabel>
            <Select
              borderRadius="xl"
              placeholder="Keep directly inside container"
              value={selectedFolder}
              onChange={(event) => setSelectedFolder(event.target.value)}
            >
              {filteredFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
          <Button colorScheme="teal" leftIcon={<FaCheckCircle />} onClick={handleMove}>
            Save location
          </Button>
          <Button
            onClick={() => {
              setIsMoveMode(false);
              setSelectedShelf("");
              setSelectedContainer("");
              setSelectedFolder("");
            }}
            variant="outline"
          >
            Cancel
          </Button>
        </Stack>
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
              <Icon as={FaBarcode} boxSize={7} />
            </Flex>
            <Box>
              <Badge borderRadius="full" colorScheme="teal" mb={3} px={3} py={1}>
                Scan and locate
              </Badge>
              <Heading color={textColor} size="xl">
                QR Scanner
              </Heading>
              <Text color={mutedText} fontSize={{ base: "md", md: "lg" }} mt={2}>
                Scan or type a QR code to find where an item belongs.
              </Text>
            </Box>
          </HStack>

          <Stack direction={{ base: "column", sm: "row" }} spacing={3} w={{ base: "100%", lg: "auto" }}>
            <Button onClick={fetchData} isLoading={dataLoading} variant="outline">
              Refresh data
            </Button>
            <Button colorScheme="red" onClick={clearScan} variant="ghost">
              Clear scan
            </Button>
          </Stack>
        </Flex>

        <SimpleGrid columns={{ base: 1, xl: 2 }} mt={6} spacing={6}>
          <Box
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="3xl"
            boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
            p={{ base: 5, md: 6 }}
          >
            <Flex align="center" justify="space-between" gap={4} mb={5}>
              <Box>
                <Heading color={textColor} size="md">
                  Camera scan
                </Heading>
                <Text color={mutedText} fontSize="sm">
                  Point the camera at a File Organizer QR label.
                </Text>
              </Box>
              <Badge borderRadius="full" colorScheme={cameraAvailable ? "green" : "red"} px={3} py={1}>
                {cameraAvailable ? "Camera ready" : "Manual mode"}
              </Badge>
            </Flex>

            {cameraAvailable ? (
              <Box
                bg="black"
                border="1px solid"
                borderColor={strongBorder}
                borderRadius="3xl"
                h={{ base: "300px", md: "420px" }}
                overflow="hidden"
                position="relative"
                w="100%"
              >
                <QrScanner
                  key={scanKey}
                  delay={300}
                  onError={handleScannerError}
                  onScan={handleScan}
                  constraints={{ video: { facingMode: cameraFacing } }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Box
                  border="2px solid"
                  borderColor="teal.300"
                  borderRadius="2xl"
                  inset="12%"
                  pointerEvents="none"
                  position="absolute"
                />
                <IconButton
                  aria-label="Switch camera"
                  bg="whiteAlpha.900"
                  boxShadow="md"
                  icon={<FiCamera />}
                  onClick={() =>
                    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"))
                  }
                  position="absolute"
                  right={4}
                  top={4}
                />
              </Box>
            ) : (
              <Center
                bg={mutedBg}
                border="1px dashed"
                borderColor={borderColor}
                borderRadius="3xl"
                h={{ base: "220px", md: "320px" }}
                textAlign="center"
              >
                <VStack color={mutedText} px={6}>
                  <Icon as={FaQrcode} boxSize={10} />
                  <Text fontWeight="800">Camera is unavailable</Text>
                  <Text fontSize="sm">
                    You can still type or paste the QR code below.
                  </Text>
                </VStack>
              </Center>
            )}

            <Divider my={6} />

            <FormControl>
              <FormLabel color={textColor} fontSize="sm" fontWeight="800">
                Type QR code manually
              </FormLabel>
              <Stack direction={{ base: "column", md: "row" }} spacing={3}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    borderRadius="xl"
                    placeholder="Example: s_0001, c_0003, f_0002, d_0008"
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") processQrValue(manualCode);
                    }}
                  />
                </InputGroup>
                <Button colorScheme="teal" onClick={() => processQrValue(manualCode)}>
                  Find
                </Button>
              </Stack>
            </FormControl>
          </Box>

          <Box
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="3xl"
            boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
            minH="520px"
            p={{ base: 5, md: 6 }}
          >
            <Flex align="center" justify="space-between" gap={4} mb={5}>
              <Box>
                <Heading color={textColor} size="md">
                  Scan result
                </Heading>
                <Text color={mutedText} fontSize="sm">
                  Details and move tools appear here after a match.
                </Text>
              </Box>
              {scanResult && (
                <Badge borderRadius="full" colorScheme="blue" px={3} py={1}>
                  {scanResult}
                </Badge>
              )}
            </Flex>

            {dataLoading || resolving ? (
              <Center minH="360px">
                <VStack spacing={4}>
                  <Spinner color="teal.500" size="xl" />
                  <Text color={mutedText}>
                    {dataLoading ? "Loading organizer data..." : "Checking QR code..."}
                  </Text>
                </VStack>
              </Center>
            ) : error ? (
              <Alert borderRadius="2xl" status="error">
                <AlertIcon />
                {error}
              </Alert>
            ) : locationData ? (
              <VStack align="stretch" spacing={5}>
                <Box bg={mutedBg} borderRadius="2xl" p={5}>
                  <HStack align="flex-start" spacing={4}>
                    <Flex
                      align="center"
                      bg="teal.50"
                      borderRadius="xl"
                      color="teal.600"
                      h="48px"
                      justify="center"
                      w="48px"
                    >
                      <Icon
                        as={
                          locationData.type === "shelf"
                            ? FaLayerGroup
                            : locationData.type === "container"
                            ? BsBoxSeam
                            : locationData.type === "folder"
                            ? FaFolder
                            : FaFileAlt
                        }
                        boxSize={6}
                      />
                    </Flex>
                    <Box minW={0}>
                      <Heading color={textColor} size="md" noOfLines={2}>
                        {getItemName(scannedItem)}
                      </Heading>
                      <HStack flexWrap="wrap" mt={2} spacing={2}>
                        <Badge borderRadius="full" colorScheme="teal" px={3} py={1}>
                          {locationData.type}
                        </Badge>
                        <Badge borderRadius="full" colorScheme="gray" px={3} py={1}>
                          {scannedItem?.generated_code || "No code"}
                        </Badge>
                      </HStack>
                    </Box>
                  </HStack>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text color={textColor} fontWeight="800">
                      Shelf
                    </Text>
                    <Text color={mutedText}>{locationData.shelf?.name || "Not assigned"}</Text>
                  </Box>
                  <Box>
                    <Text color={textColor} fontWeight="800">
                      Container
                    </Text>
                    <Text color={mutedText}>{locationData.container?.name || "Not assigned"}</Text>
                  </Box>
                  <Box>
                    <Text color={textColor} fontWeight="800">
                      Folder
                    </Text>
                    <Text color={mutedText}>{locationData.folder?.name || "Not assigned"}</Text>
                  </Box>
                  <Box>
                    <Text color={textColor} fontWeight="800">
                      QR code
                    </Text>
                    <Text color={mutedText} noOfLines={1}>
                      {scannedItem?.generated_code || scanResult}
                    </Text>
                  </Box>
                </SimpleGrid>

                {(locationData.type === "shelf" ||
                  locationData.type === "container" ||
                  locationData.type === "folder") && (
                  <>
                    <Divider />
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                      {locationData.type === "shelf" && (
                        <>
                          <Section
                            color="orange.500"
                            icon={BsBoxSeam}
                            items={locationData.containers}
                            title="Containers under this shelf"
                          />
                          <Section
                            color="yellow.500"
                            icon={FaFolder}
                            items={locationData.folders}
                            title="Folders under this shelf"
                          />
                          <Section
                            color="blue.500"
                            icon={FaFileAlt}
                            items={locationData.documents}
                            title="Documents under this shelf"
                          />
                        </>
                      )}
                      {locationData.type === "container" && (
                        <>
                          <Section
                            color="yellow.500"
                            icon={FaFolder}
                            items={locationData.folders}
                            title="Folders under this container"
                          />
                          <Section
                            color="blue.500"
                            icon={FaFileAlt}
                            items={locationData.documents}
                            title="Documents under this container"
                          />
                        </>
                      )}
                      {locationData.type === "folder" && (
                        <Section
                          color="blue.500"
                          icon={FaFileAlt}
                          items={locationData.documents}
                          title="Documents under this folder"
                        />
                      )}
                    </SimpleGrid>
                  </>
                )}

                <Divider />

                {!isMoveMode ? (
                  <Button
                    colorScheme="teal"
                    isDisabled={locationData.type === "shelf"}
                    leftIcon={<FaExchangeAlt />}
                    onClick={() => setIsMoveMode(true)}
                  >
                    Move to a new location
                  </Button>
                ) : (
                  <Box
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="2xl"
                    p={4}
                  >
                    {renderMoveControls()}
                  </Box>
                )}
              </VStack>
            ) : (
              <Center minH="360px" textAlign="center">
                <VStack color={mutedText} spacing={3}>
                  <Icon as={FaQrcode} boxSize={12} />
                  <Heading color={textColor} size="md">
                    Ready to scan
                  </Heading>
                  <Text maxW="420px">
                    Use the camera or type a QR code. Matching shelf, container, folder, or
                    document details will appear here.
                  </Text>
                </VStack>
              </Center>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default ScanningQrCode;
