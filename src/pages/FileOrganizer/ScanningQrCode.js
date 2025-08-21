import React, { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import {
  Box,
  Text,
  Stack,
  IconButton,
  Center,
  VStack,
  Divider,
  useColorModeValue,
  Spinner,
  Button,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
  Select,
  Heading,
} from "@chakra-ui/react";
import { FiCamera } from "react-icons/fi";
import { getShelves, updateShelf } from "../../utils/FileOrganizer/shelvesService";
import { getContainers, updateContainer } from "../../utils/FileOrganizer/containersService";
import { getFolders, updateFolder } from "../../utils/FileOrganizer/foldersService";
import { getDocuments, updateDocument } from "../../utils/FileOrganizer/documentsService";
import { FaFile, FaFolder, FaBarcode } from "react-icons/fa";

const ScanningQrCode = () => {
  const [scanResult, setScanResult] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState("");
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [loading, setLoading] = useState(true);
  const [cameraAvailable, setCameraAvailable] = useState(true);
  const [scanKey, setScanKey] = useState(0);

  const [allData, setAllData] = useState({
    shelves: [],
    containers: [],
    folders: [],
    documents: [],
  });
  
  // New state for moving functionality
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);


  const boxBackground = useColorModeValue("white", "gray.700");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const primaryColor = useColorModeValue("teal.600", "teal.300");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.400");
  const boxShadow = useColorModeValue(
    "0 4px 6px rgba(160, 174, 192, 0.6)",
    "0 4px 6px rgba(9, 17, 28, 0.9)"
  );
  
  // Moved fetchData outside of useEffect so it can be called by handleMove
  const fetchData = async () => {
    try {
      const [shelves, containers, folders, documents] = await Promise.all([
        getShelves(),
        getContainers(),
        getFolders(),
        getDocuments(),
      ]);
      setAllData({ shelves, containers, folders, documents });
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to load data for scanning. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      setCameraAvailable(false);
      setLoading(false);
      return;
    }

    fetchData();
  }, []);

  const findLocationData = (qrValue, allData) => {
    const { shelves, containers, folders, documents } = allData;

    const findMatch = (arr) =>
      arr.find((item) => (item.generated_code || "").trim().toLowerCase() === qrValue);

    const document = findMatch(documents);
    if (document) {
      const folderOfDoc = folders.find((f) => f.id === document.folder_id);
      const containerOfDoc = containers.find(
        (c) => c.id === folderOfDoc?.container_id || c.id === document.container_id
      );
      const shelfOfContainer = shelves.find(
        (s) => s.id === containerOfDoc?.shelf_id || s.id === document.shelf_id
      );

      return {
        type: "document",
        document,
        folder: folderOfDoc,
        container: containerOfDoc,
        shelf: shelfOfContainer,
      };
    }

    const folder = findMatch(folders);
    if (folder) {
      const containerOfFolder = containers.find((c) => String(c.id) === String(folder.container_id));
      const shelfOfFolder = shelves.find((s) => String(s.id) === String(containerOfFolder?.shelf_id));
      const docsUnderFolder = Array.isArray(folder.documents) && folder.documents.length > 0
        ? folder.documents
        : documents.filter((doc) => String(doc.folder_id) === String(folder.id));

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
      const shelfOfContainer = shelves.find((s) => s.id === container.shelf_id);
      const foldersUnderContainer = folders.filter((f) => f.container_id === container.id);
      const docsFromFolders = documents.filter((doc) =>
        foldersUnderContainer.some((f) => f.id === doc.folder_id)
      );
      const docsDirectInContainer = documents.filter(
        (doc) => !doc.folder_id && doc.container_id === container.id
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
      const containersUnderShelf = containers.filter((c) => c.shelf_id === shelf.id);
      const foldersUnderShelf = folders.filter((f) =>
        containersUnderShelf.some((c) => c.id === f.container_id)
      );
      const docsFromFolders = documents.filter((doc) =>
        foldersUnderShelf.some((f) => f.id === doc.folder_id)
      );
      const docsDirectInContainers = documents.filter(
        (doc) => !doc.folder_id && containersUnderShelf.some((c) => c.id === doc.container_id)
      );

      return {
        type: "shelf",
        shelf,
        containers: containersUnderShelf,
        folders: foldersUnderShelf,
        documents: [...docsFromFolders, ...docsDirectInContainers],
      };
    }

    return null;
  };

  const handleScan = (data) => {
    if (data?.text && data.text !== scanResult) {
      const qrValue = data.text.trim().toLowerCase();
      
      setScanResult(qrValue);
      setLocationData(null);
      setLoading(true);
      setError("");

      const foundData = findLocationData(qrValue, allData);
      
      if (foundData) {
        setLocationData(foundData);
      } else {
        setError("No matching shelf, container, folder, or document found for this QR code.");
      }
      setLoading(false);
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
  };

  const toggleCamera = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const clearScan = () => {
    setScanResult("");
    setLocationData(null);
    setError("");
    setLoading(false);
    setScanKey(prevKey => prevKey + 1);
    setIsMoveMode(false);
    setSelectedShelf(null);
    setSelectedContainer(null);
    setSelectedFolder(null);
  };

  const handleMove = async () => {
    if (!locationData) return;

    const { type, container, folder, document } = locationData;
    let success = false;

    try {
      if (type === "container" && selectedShelf) {
        await updateContainer(container.id, { shelf_id: parseInt(selectedShelf) });
        // Assuming your update functions handle cascading updates or you have separate functions for them
        success = true;
      } else if (type === "folder" && selectedContainer) {
        await updateFolder(folder.id, { container_id: parseInt(selectedContainer) });
        success = true;
      } else if (type === "document" && (selectedFolder || selectedContainer)) {
        const updateData = {};
        if (selectedFolder) {
          updateData.folder_id = parseInt(selectedFolder);
          updateData.container_id = null;
        } else if (selectedContainer) {
          updateData.container_id = parseInt(selectedContainer);
          // Assuming documents can also be directly in containers
          updateData.folder_id = null;
        }
        await updateDocument(document.id, updateData);
        success = true;
      }
    } catch (err) {
      console.error("Move operation failed:", err);
      success = false;
    }

    if (success) {
      alert("Move successful!");
      clearScan();
      fetchData(); // Call the now-accessible fetchData function to refresh
    } else {
      alert("Move failed. Please check your selection.");
    }
  };

  const Section = ({ title, items, icon }) => (
    <Box>
      <Text fontWeight="semibold" mb={3} fontSize={{ base: "md", md: "lg" }} color={primaryColor}>
        {title}:
      </Text>
      {items && items.length > 0 ? (
        <List spacing={2}>
          {items.map((item) => (
            <ListItem key={item.id}>
              <ListIcon as={icon} color={primaryColor} />
              <Text as="span" fontSize={{ base: "sm", md: "md" }} noOfLines={1} color={subTextColor}>
                {item.name || item.title}
              </Text>
            </ListItem>
          ))}
        </List>
      ) : (
        <Text fontSize={{ base: "sm", md: "md" }} fontStyle="italic" color="gray.500">
          No {title.toLowerCase()} found.
        </Text>
      )}
    </Box>
  );

  return (
    <Center minH="100vh" p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.800")}>
      <VStack
        spacing={{ base: 4, md: 6 }}
        bg={boxBackground}
        p={{ base: 6, md: 8 }}
        borderRadius="lg"
        boxShadow={boxShadow}
        w={{ base: "90%", md: "lg" }}
        maxW="lg"
      >
        <Heading
          size="xl"
          fontWeight="extrabold"
          color={primaryColor}
          display="flex"
          alignItems="center"
          gap={3}
        >
          <FaBarcode /> QR Scanner
        </Heading>

        {cameraAvailable ? (
          <Box
            position="relative"
            borderWidth="2px"
            borderColor={cardBorderColor}
            borderRadius="md"
            w={{ base: "100%", md: "350px" }}
            h={{ base: "300px", md: "350px" }}
            overflow="hidden"
            boxShadow="lg"
            bg="black"
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              w: "100%",
              h: "100%",
              boxShadow: "inset 0 0 0 5px teal.500",
              animation: "pulse 2s infinite ease-in-out",
            }}
          >
            <QrScanner
              key={scanKey}
              delay={300}
              onError={handleError}
              onScan={handleScan}
              constraints={{ video: { facingMode: cameraFacing } }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              aria-label="Switch camera"
              icon={<FiCamera />}
              size="md"
              position="absolute"
              top={2}
              right={2}
              onClick={toggleCamera}
              bg="whiteAlpha.800"
              _hover={{ bg: "whiteAlpha.900" }}
              zIndex={10}
              boxShadow="md"
            />
          </Box>
        ) : (
          <Box
            w={{ base: "100%", md: "350px" }}
            h={{ base: "200px", md: "350px" }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={cardBorderColor}
            borderRadius="md"
          >
            <Text textAlign="center" color={subTextColor} p={4}>
              Camera not supported or access denied.
            </Text>
          </Box>
        )}

        <Stack direction="row" spacing={4} w="100%" justifyContent="center">
          <Button
            onClick={clearScan}
            colorScheme="red"
            size="md"
            boxShadow="md"
            w="100%"
          >
            Clear Scan
          </Button>
        </Stack>

        {loading && <Spinner color={primaryColor} size="lg" mt={4} />}

        {!loading && scanResult && locationData && (
          <Box
            p={{ base: 4, md: 6 }}
            borderWidth="1px"
            borderColor={cardBorderColor}
            borderRadius="lg"
            w="100%"
            bg={cardBg}
            boxShadow="sm"
          >
            <Heading size="md" mb={6} color={primaryColor}>
              Location Details
            </Heading>
            
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <Box>
                <Text fontWeight="semibold" color={textColor}>Item:</Text>
                <Text color={subTextColor}>{locationData[locationData.type]?.name || "N/A"}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color={textColor}>Type:</Text>
                <Text textTransform="capitalize" color={subTextColor}>{locationData.type}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color={textColor}>QR Code:</Text>
                <Text isTruncated color={subTextColor}>{locationData[locationData.type]?.generated_code || "N/A"}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color={textColor}>Shelf:</Text>
                <Text color={subTextColor}>{locationData.shelf?.name || "N/A"}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color={textColor}>Container:</Text>
                <Text color={subTextColor}>{locationData.container?.name || "N/A"}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color={textColor}>Folder:</Text>
                <Text color={subTextColor}>{locationData.folder?.name || "N/A"}</Text>
              </Box>
            </SimpleGrid>

            {(locationData.type === "shelf" || locationData.type === "container" || locationData.type === "folder") && (
              <>
                <Divider my={6} borderColor={cardBorderColor} />
                <VStack spacing={4} align="stretch">
                  {locationData.type === "shelf" && (
                    <>
                      <Section title="Containers under this shelf" items={locationData.containers} icon={FaFolder} />
                      <Section title="Folders under this shelf" items={locationData.folders} icon={FaFolder} />
                      <Section title="Documents under this shelf" items={locationData.documents} icon={FaFile} />
                    </>
                  )}
                  {locationData.type === "container" && (
                    <>
                      <Section title="Folders under this container" items={locationData.folders} icon={FaFolder} />
                      <Section title="Documents under this container" items={locationData.documents} icon={FaFile} />
                    </>
                  )}
                  {locationData.type === "folder" && (
                    <Section title="Documents under this folder" items={locationData.documents} icon={FaFile} />
                  )}
                </VStack>
              </>
            )}

            {/* Move functionality UI */}
            {!isMoveMode && (
              <Button mt={6} colorScheme="teal" onClick={() => setIsMoveMode(true)} w="100%">
                Move to a new location
              </Button>
            )}

            {isMoveMode && (
              <VStack mt={6} spacing={4} align="stretch" p={4} borderWidth="1px" borderColor={cardBorderColor} borderRadius="md">
                <Text fontWeight="semibold" color={textColor}>Choose New Location:</Text>
                {locationData.type === "container" && (
                  <Select
                    placeholder="Select Shelf"
                    value={selectedShelf || ""}
                    onChange={(e) => setSelectedShelf(e.target.value)}
                  >
                    {allData.shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.name}
                      </option>
                    ))}
                  </Select>
                )}
                {(locationData.type === "folder" || locationData.type === "document") && (
                  <Select
                    placeholder="Select Shelf"
                    value={selectedShelf || ""}
                    onChange={(e) => {
                      setSelectedShelf(e.target.value);
                      setSelectedContainer(null);
                    }}
                  >
                    {allData.shelves.map((shelf) => (
                      <option key={shelf.id} value={shelf.id}>
                        {shelf.name}
                      </option>
                    ))}
                  </Select>
                )}
                {(locationData.type === "folder" || locationData.type === "document") && selectedShelf && (
                  <Select
                    placeholder="Select Container"
                    value={selectedContainer || ""}
                    onChange={(e) => setSelectedContainer(e.target.value)}
                  >
                    {allData.containers.filter(c => c.shelf_id === parseInt(selectedShelf)).map((container) => (
                      <option key={container.id} value={container.id}>
                        {container.name}
                      </option>
                    ))}
                  </Select>
                )}
                {locationData.type === "document" && selectedContainer && (
                  <Select
                    placeholder="Select Folder (optional)"
                    value={selectedFolder || ""}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                  >
                    <option value="">(None)</option>
                    {allData.folders.filter(f => f.container_id === parseInt(selectedContainer)).map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </Select>
                )}

                <Button colorScheme="green" onClick={handleMove} w="100%">
                  Save New Location
                </Button>
                <Button variant="outline" onClick={() => setIsMoveMode(false)} w="100%">
                  Cancel
                </Button>
              </VStack>
            )}
          </Box>
        )}

        {!loading && scanResult && !locationData && error && (
          <Box p={4} borderWidth="1px" borderColor="red.300" borderRadius="md" bg="red.50" color="red.700">
            <Text
              fontWeight="semibold"
              fontSize="md"
              textAlign="center"
            >
              ❌ {error}
            </Text>
          </Box>
        )}
      </VStack>
    </Center>
  );
};

export default ScanningQrCode;
