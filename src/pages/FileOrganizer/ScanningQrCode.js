// src/pages/FileOrganizer/ScanningQrCode.js
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
} from "@chakra-ui/react";
import { FiCamera } from "react-icons/fi";
import { getShelves } from "../../utils/FileOrganizer/shelvesService";
import { getContainers } from "../../utils/FileOrganizer/containersService";
import { getFolders } from "../../utils/FileOrganizer/foldersService";
import { getDocuments } from "../../utils/FileOrganizer/documentsService";

const ScanningQrCode = () => {
  const [scanResult, setScanResult] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [error, setError] = useState("");
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [loading, setLoading] = useState(false);

  const boxBackground = useColorModeValue("gray.50", "gray.600");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const boxShadow = useColorModeValue(
    "0 4px 6px rgba(160, 174, 192, 0.6)",
    "0 4px 6px rgba(9, 17, 28, 0.9)"
  );

  const [cameraAvailable, setCameraAvailable] = useState(true);

  useEffect(() => {
    // Check if browser supports camera
    if (
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== "function"
    ) {
      setCameraAvailable(false);
    }
  }, []);

  const handleScan = async (data) => {
    if (data?.text || data) {
      const qrValue = (data.text || data).trim().toLowerCase();

      // Allow scanning multiple times: clear previous error and location
      setScanResult(qrValue);
      setLoading(true);
      setError("");
      setLocationData(null);

      try {
        // Fetch all data upfront
        const [shelves, containers, folders, documents] = await Promise.all([
          getShelves(),
          getContainers(),
          getFolders(),
          getDocuments(),
        ]);

        // Helper to find item by generated_code
        const findMatch = (arr) =>
          arr.find(
            (item) =>
              (item.generated_code || "").trim().toLowerCase() === qrValue
          );

        /** ----------------
         * SHELF MATCH
         * ----------------*/
        const shelf = findMatch(shelves);
        if (shelf) {
          const containersUnderShelf = containers.filter(
            (c) => c.shelf_id === shelf.id
          );

          const foldersUnderShelf = folders.filter((f) =>
            containersUnderShelf.some((c) => c.id === f.container_id)
          );

          // Docs inside folders
          const docsFromFolders = documents.filter((doc) =>
            foldersUnderShelf.some((f) => f.id === doc.folder_id)
          );

          // Docs directly inside containers under this shelf
          const docsDirectInContainers = documents.filter(
            (doc) =>
              !doc.folder_id &&
              containersUnderShelf.some((c) => c.id === doc.container_id)
          );

          const documentsUnderShelf = [
            ...docsFromFolders,
            ...docsDirectInContainers,
          ];

          console.log("Shelf match:", {
            shelf,
            containersUnderShelf,
            foldersUnderShelf,
            documentsUnderShelf,
          });

          setLocationData({
            type: "shelf",
            shelf,
            containers: containersUnderShelf,
            folders: foldersUnderShelf,
            documents: documentsUnderShelf,
          });
          setLoading(false);
          return;
        }

        /** ----------------
         * CONTAINER MATCH
         * ----------------*/
        const container = findMatch(containers);
        if (container) {
          const shelfOfContainer = shelves.find(
            (s) => s.id === container.shelf_id
          );

          const foldersUnderContainer = folders.filter(
            (f) => f.container_id === container.id
          );

          const docsFromFolders = documents.filter((doc) =>
            foldersUnderContainer.some((f) => f.id === doc.folder_id)
          );

          const docsDirectInContainer = documents.filter(
            (doc) => !doc.folder_id && doc.container_id === container.id
          );

          const documentsUnderContainer = [
            ...docsFromFolders,
            ...docsDirectInContainer,
          ];

          console.log("Container match:", {
            container,
            shelfOfContainer,
            foldersUnderContainer,
            documentsUnderContainer,
          });

          setLocationData({
            type: "container",
            container,
            shelf: shelfOfContainer,
            folders: foldersUnderContainer,
            documents: documentsUnderContainer,
          });
          setLoading(false);
          return;
        }
        /** ----------------
         * FOLDER MATCH
         * ----------------*/
        const folder = findMatch(folders);
        if (folder) {
          const containerOfFolder = containers.find(
            (c) => String(c.id) === String(folder.container_id)
          );
          const shelfOfFolder = shelves.find(
            (s) => String(s.id) === String(containerOfFolder?.shelf_id)
          );

          // ✅ Prefer related docs from Directus, fallback to global array
          const docsUnderFolder =
            Array.isArray(folder.documents) && folder.documents.length > 0
              ? folder.documents
              : documents.filter(
                  (doc) => String(doc.folder_id) === String(folder.id)
                );

          console.log("Folder match:", {
            folder,
            containerOfFolder,
            shelfOfFolder,
            docsUnderFolder,
          });

          setLocationData({
            type: "folder",
            folder,
            container: containerOfFolder,
            shelf: shelfOfFolder,
            documents: docsUnderFolder,
          });
          setLoading(false);
          return;
        }

        /** ----------------
         * DOCUMENT MATCH
         * ----------------*/
        const document = findMatch(documents);
        if (document) {
          const folderOfDoc = folders.find((f) => f.id === document.folder_id);
          const containerOfFolder = containers.find(
            (c) =>
              c.id === folderOfDoc?.container_id ||
              c.id === document.container_id
          );
          const shelfOfContainer = shelves.find(
            (s) =>
              s.id === containerOfFolder?.shelf_id || s.id === document.shelf_id
          );

          console.log("Document match:", {
            document,
            folderOfDoc,
            containerOfFolder,
            shelfOfContainer,
          });

          setLocationData({
            type: "document",
            document,
            folder: folderOfDoc,
            container: containerOfFolder,
            shelf: shelfOfContainer,
          });
          setLoading(false);
          return;
        }

        /** ----------------
         * NO MATCH
         * ----------------*/
        setError(
          "No matching shelf, container, folder, or document found for this QR code."
        );
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
    setCameraFacing((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  };

  const clearScan = () => {
    setScanResult("");
    setLocationData(null);
    setError("");
  };

  const Section = ({ title, items }) => (
    <>
      <Text fontWeight="semibold" mb={3} fontSize="md">
        {title}:
      </Text>
      {items.length > 0 ? (
        <VStack spacing={2} pl={4} maxH="150px" overflowY="auto" align="start">
          {items.map((item) => (
            <Text key={item.id} fontSize="sm" noOfLines={1}>
              • {item.name}
            </Text>
          ))}
        </VStack>
      ) : (
        <Text fontSize="sm" fontStyle="italic" color="gray.500">
          No {title.toLowerCase()} found.
        </Text>
      )}
    </>
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
          <Box
            p={6}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            w="100%"
            maxH="500px"
            overflowY="auto"
            bg={boxBackground}
          >
            <Text fontSize="2xl" fontWeight="bold" mb={6} color="teal.600">
              Location Details
            </Text>

            {/* Shelf View */}
            {locationData.type === "shelf" && (
              <>
                <Text fontSize="lg" fontWeight="semibold" mb={1}>
                  Shelf:{" "}
                  <Box as="span" fontWeight="normal">
                    {locationData.shelf.name}
                  </Box>
                </Text>

                <Divider my={4} />

                <Section
                  title="Containers under this shelf"
                  items={locationData.containers}
                />
                <Divider my={4} />
                <Section
                  title="Folders under this shelf"
                  items={locationData.folders}
                />
                <Divider my={4} />
                <Section
                  title="Documents under this shelf"
                  items={locationData.documents}
                />
              </>
            )}

            {/* Container View */}
            {locationData.type === "container" && (
              <>
                <Text fontSize="lg" fontWeight="semibold" mb={1}>
                  Container:{" "}
                  <Box as="span" fontWeight="normal">
                    {locationData.container.name}
                  </Box>
                </Text>
                <Text fontSize="md" mb={4}>
                  Shelf: {locationData.shelf?.name || "N/A"}
                </Text>

                <Divider my={4} />

                <Section
                  title="Folders under this container"
                  items={locationData.folders}
                />
                <Divider my={4} />
                <Section
                  title="Documents under this container"
                  items={locationData.documents}
                />
              </>
            )}

            {/* Folder View */}
            {locationData.type === "folder" && (
              <>
                <Text fontSize="lg" fontWeight="semibold" mb={1}>
                  Folder:{" "}
                  <Box as="span" fontWeight="normal">
                    {locationData.folder.name}
                  </Box>
                </Text>
                <Text fontSize="md">
                  Container: {locationData.container?.name || "N/A"}
                </Text>
                <Text fontSize="md" mb={4}>
                  Shelf: {locationData.shelf?.name || "N/A"}
                </Text>

                <Divider my={4} />

                <Section
                  title="Documents under this folder"
                  items={locationData.documents}
                />
              </>
            )}

            {/* Document View */}
            {locationData.type === "document" && (
              <>
                <Text fontSize="lg" fontWeight="semibold" mb={1}>
                  Document:{" "}
                  <Box as="span" fontWeight="normal">
                    {locationData.document.name}
                  </Box>
                </Text>
                <Divider my={4} />
                <Text fontSize="md">
                  Folder: {locationData.folder?.name || "N/A"}
                </Text>
                <Text fontSize="md">
                  Container: {locationData.container?.name || "N/A"}
                </Text>
                <Text fontSize="md">
                  Shelf: {locationData.shelf?.name || "N/A"}
                </Text>
              </>
            )}
          </Box>
        )}

        {!loading && scanResult && !locationData && error && (
          <Text
            color="red.500"
            fontWeight="semibold"
            fontSize="md"
            textAlign="center"
          >
            ❌ {error}
          </Text>
        )}
      </VStack>
    </Center>
  );
};

export default ScanningQrCode;
