// src/pages/FileOrganizer/ScanningQrCode.js
import React, { useState, useEffect } from "react";
import QrScanner from "react-qr-scanner";
import {
  Box,
  Text,
  Stack,
  IconButton,
  Flex,
  Center,
  VStack,
  Collapse,
  Divider,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { FiCamera } from "react-icons/fi";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";

const ScanningQrCode = () => {
  const [scanResult, setScanResult] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState("");
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [loading, setLoading] = useState(false);
// At the top of your component (inside the function body)
const boxBackground = useColorModeValue("gray.50", "gray.600");
  // On scan, find the location hierarchy of scanned QR code
  const handleScan = async (data) => {
    if (data?.text || data) {
      const qrValue = (data.text || data).toLowerCase();
      setScanResult(qrValue);
      setLoading(true);
      setError("");
      setLocationData(null);

      try {
        // Fetch all relevant collections at once
        const [documents, folders, containers, shelves] = await Promise.all([
          getAllData("Documents"),
          getAllData("Folders"),
          getAllData("Containers"),
          getAllData("Shelves"),
        ]);

        // Helper to find by QR or generated_code (assuming documents/folders/containers have 'qrCodeValue' or 'generated_code' field)
        const findMatch = (arr) =>
          arr.find(
            (item) =>
              (item.qrCodeValue || item.generated_code || "").toLowerCase() ===
              qrValue
          );

        const document = findMatch(documents);
        if (document) {
          // Get folder of document
          const folder = folders.find((f) => f.id === document.folder_id);
          // Get container and shelf from folder
          const container = containers.find((c) => c.id === folder?.container_id);
          const shelf = shelves.find((s) => s.id === container?.shelf_id);

          setLocationData({
            type: "document",
            document,
            folder,
            container,
            shelf,
          });
          setLoading(false);
          return;
        }

        const folder = findMatch(folders);
        if (folder) {
          const container = containers.find((c) => c.id === folder.container_id);
          const shelf = shelves.find((s) => s.id === container?.shelf_id);
          // Get documents under this folder
          const docsUnderFolder = documents.filter(
            (doc) => doc.folder_id === folder.id
          );

          setLocationData({
            type: "folder",
            folder,
            container,
            shelf,
            documents: docsUnderFolder,
          });
          setLoading(false);
          return;
        }

        const container = findMatch(containers);
        if (container) {
          const shelf = shelves.find((s) => s.id === container.shelf_id);
          // Get folders under container
          const foldersUnderContainer = folders.filter(
            (f) => f.container_id === container.id
          );
          // Get documents under all these folders
          const docsUnderContainer = documents.filter((doc) =>
            foldersUnderContainer.some((f) => f.id === doc.folder_id)
          );

          setLocationData({
            type: "container",
            container,
            shelf,
            folders: foldersUnderContainer,
            documents: docsUnderContainer,
          });
          setLoading(false);
          return;
        }

        // If nothing matched
        setError("No matching document, folder, or container found for this QR code.");
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error fetching data.");
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    setError("QR scanning failed.");
  };

  const toggleCamera = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const clearScan = () => {
    setScanResult("");
    setLocationData(null);
    setError("");
  };

  // Colors and styles for light/dark mode
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const boxShadow = useColorModeValue(
    "0 4px 6px rgba(160, 174, 192, 0.6)",
    "0 4px 6px rgba(9, 17, 28, 0.9)"
  );

  return (
    <Center minH="100vh" p={6} bg={useColorModeValue("gray.50", "gray.800")}>
      <VStack
        spacing={6}
        bg={bgColor}
        p={6}
        borderRadius="lg"
        boxShadow={boxShadow}
        maxW="lg"
        w="100%"
      >
        <Text fontSize="2xl" fontWeight="extrabold" color="teal.600">
          📷 Scan QR Code
        </Text>

        <Box
          position="relative"
          borderWidth="2px"
          borderColor={borderColor}
          borderRadius="md"
          w="300px"
          h="300px"
          overflow="hidden"
          boxShadow="md"
          bg="black"
        >
          <QrScanner
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
            top="8px"
            right="8px"
            onClick={toggleCamera}
            bg="whiteAlpha.800"
            _hover={{ bg: "whiteAlpha.900" }}
            zIndex={10}
            boxShadow="md"
          />
        </Box>

        <Stack direction="row" spacing={4}>
          <IconButton
            aria-label="Clear scan result"
            icon={<Text fontSize="lg">✕</Text>}
            onClick={clearScan}
            colorScheme="red"
            size="md"
            boxShadow="md"
          />
        </Stack>

        {loading && <Spinner color="teal.400" size="lg" />}

        {!loading && scanResult && locationData && (
    // Later in JSX
<Box
  p={4}
  borderWidth="1px"
  borderColor={borderColor}
  borderRadius="md"
  w="100%"
  maxH="400px"
  overflowY="auto"
  bg={boxBackground}
>
            <Text fontSize="xl" fontWeight="bold" mb={3} color="teal.600">
              Location Details
            </Text>

            {/* Document View */}
            {locationData.type === "document" && (
              <>
                <Text>
                  <b>Document:</b> {locationData.document.title}
                </Text>
                <Divider my={2} />
                <Text>
                  <b>Folder:</b> {locationData.folder?.name || "N/A"}
                </Text>
                <Text>
                  <b>Container:</b> {locationData.container?.name || "N/A"}
                </Text>
                <Text>
                  <b>Shelf:</b> {locationData.shelf?.name || "N/A"}
                </Text>
              </>
            )}

            {/* Folder View */}
            {locationData.type === "folder" && (
              <>
                <Text>
                  <b>Folder:</b> {locationData.folder.name}
                </Text>
                <Text>
                  <b>Container:</b> {locationData.container?.name || "N/A"}
                </Text>
                <Text>
                  <b>Shelf:</b> {locationData.shelf?.name || "N/A"}
                </Text>
                <Divider my={2} />
                <Text fontWeight="semibold" mb={2}>
                  Documents under this folder:
                </Text>
                {locationData.documents.length > 0 ? (
                  <VStack spacing={1} pl={4} maxH="150px" overflowY="auto" align="start">
                    {locationData.documents.map((doc) => (
                      <Text key={doc.id} fontSize="sm" noOfLines={1}>
                        - {doc.title}
                      </Text>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" fontStyle="italic" color="gray.500">
                    No documents found.
                  </Text>
                )}
              </>
            )}

            {/* Container View */}
            {locationData.type === "container" && (
              <>
                <Text>
                  <b>Container:</b> {locationData.container.name}
                </Text>
                <Text>
                  <b>Shelf:</b> {locationData.shelf?.name || "N/A"}
                </Text>
                <Divider my={2} />
                <Text fontWeight="semibold" mb={2}>
                  Folders under this container:
                </Text>
                {locationData.folders.length > 0 ? (
                  <VStack spacing={1} pl={4} maxH="120px" overflowY="auto" align="start">
                    {locationData.folders.map((folder) => (
                      <Text key={folder.id} fontSize="sm" noOfLines={1}>
                        - {folder.name}
                      </Text>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" fontStyle="italic" color="gray.500">
                    No folders found.
                  </Text>
                )}
                <Divider my={2} />
                <Text fontWeight="semibold" mb={2}>
                  Documents under this container:
                </Text>
                {locationData.documents.length > 0 ? (
                  <VStack spacing={1} pl={4} maxH="150px" overflowY="auto" align="start">
                    {locationData.documents.map((doc) => (
                      <Text key={doc.id} fontSize="sm" noOfLines={1}>
                        - {doc.title}
                      </Text>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" fontStyle="italic" color="gray.500">
                    No documents found.
                  </Text>
                )}
              </>
            )}
          </Box>
        )}

        {!loading && scanResult && !locationData && error && (
          <Text color="red.500" fontWeight="semibold" fontSize="md" textAlign="center">
            ❌ {error}
          </Text>
        )}
      </VStack>
    </Center>
  );
};

export default ScanningQrCode;
