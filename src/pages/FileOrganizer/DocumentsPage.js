// src/pages/FileOrganizer/DocumentsPage.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, ChevronRightIcon, SearchIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useParams } from "react-router-dom";
import { BsBoxSeam } from "react-icons/bs";
import { FaFileAlt, FaFolder, FaLayerGroup } from "react-icons/fa";
import AddDocumentForm from "./AddDocumentForm";
import DocumentCard from "./DocumentCard";
import {
  deleteDocument,
  getDocumentsByFolderId,
} from "../../utils/FileOrganizer/documentsService";
import { getFolderById } from "../../utils/FileOrganizer/foldersService";
import { getContainerById } from "../../utils/FileOrganizer/containersService";
import { getShelfById } from "../../utils/FileOrganizer/shelvesService";
import { handleError } from "../../utils/FileOrganizer/handleError";
import FormActionModal from "../../components/FileOrganizer/FormActionModal";

const DocumentsPage = () => {
  const { containerId, folderId } = useParams();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [folder, setFolder] = useState(null);
  const [container, setContainer] = useState(null);
  const [shelf, setShelf] = useState(null);

  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [folderData, documentsData] = await Promise.all([
        getFolderById(folderId),
        getDocumentsByFolderId(folderId),
      ]);
      setFolder(folderData);
      setDocuments(documentsData || []);

      const containerData = await getContainerById(folderData.container_id || containerId);
      setContainer(containerData);

      if (containerData?.shelf_id) {
        const shelfData = await getShelfById(containerData.shelf_id);
        setShelf(shelfData);
      }
    } catch (error) {
      handleError(error, toast, "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [folderId]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((document) =>
      [
        document.name,
        document.description,
        document.generated_code,
        document.tags,
        document.type,
        document.file_url,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [documents, search]);

  const openNewDocumentForm = () => {
    setEditingDocument(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      toast({ title: "Document deleted", status: "success", isClosable: true });
      await loadDocuments();
    } catch (error) {
      handleError(error, toast, "Error deleting document");
    }
  };

  const handleDocumentSaved = async () => {
    setShowForm(false);
    setEditingDocument(null);
    await loadDocuments();
  };

  return (
    <Box bg={pageBg} minH="100vh" mt={12} px={{ base: 3, md: 5 }} py={6} w="full">
      <Box w="full">
        <Breadcrumb
          color={mutedText}
          fontSize="sm"
          fontWeight="600"
          mb={5}
          separator={<ChevronRightIcon color="gray.400" />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/file-organizer/shelves">
              <HStack spacing={2}>
                <Icon as={FaLayerGroup} color="teal.500" />
                <Text>Shelves</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to={`/file-organizer/shelves/${shelf?.id}/containers`}>
              <HStack spacing={2}>
                <Icon as={FaLayerGroup} color="teal.500" />
                <Text>{shelf?.name || "Shelf"}</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to={`/containers/${container?.id || containerId}/folders`}>
              <HStack spacing={2}>
                <Icon as={BsBoxSeam} color="orange.500" />
                <Text>{container?.name || "Container"}</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <HStack spacing={2}>
                <Icon as={FaFolder} color="blue.500" />
                <Text>{folder?.name || "Folder"}</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <HStack spacing={2}>
                <Icon as={FaFileAlt} color="gray.600" />
                <Text>Documents</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

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
              bg="blue.50"
              borderRadius="2xl"
              color="blue.600"
              h="58px"
              justify="center"
              w="58px"
            >
              <Icon as={FaFileAlt} boxSize={7} />
            </Flex>
            <Box>
              <Badge borderRadius="full" colorScheme="blue" mb={3} px={3} py={1}>
                Folder documents
              </Badge>
              <Heading color={headingColor} size="xl">
                {folder?.name || "Documents"}
              </Heading>
              <Text color={mutedText} fontSize={{ base: "md", md: "lg" }} mt={2}>
                Upload, open, tag, and manage documents in this folder.
              </Text>
            </Box>
          </HStack>

          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={openNewDocumentForm}
            size="lg"
          >
            Upload document
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} mt={6} spacing={4}>
          <Flex align="center" bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" gap={3} p={4}>
            <Icon as={FaFolder} color="yellow.500" />
            <Text color={mutedText}>Current folder:</Text>
            <Text fontWeight="800">{folder?.name || "Loading"}</Text>
          </Flex>
          <Flex align="center" bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" gap={3} p={4}>
            <Icon as={FaFileAlt} color="blue.500" />
            <Text fontWeight="800">{documents.length}</Text>
            <Text color={mutedText}>documents in this folder</Text>
          </Flex>
        </SimpleGrid>

        <FormActionModal
          colorScheme="blue"
          description="Upload a document and add simple details so it is easy to find later."
          eyebrow="Document upload"
          helperItems={[
            "Use a clear document title.",
            "Add tags for quick searching.",
            "Drop a file into the upload area or click to browse.",
          ]}
          icon={FaFileAlt}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingDocument(null);
          }}
          title={editingDocument ? "Edit document" : "Upload document"}
        >
          <AddDocumentForm
            containerId={container?.id || containerId}
            editData={editingDocument}
            folderId={folderId}
            onSave={handleDocumentSaved}
            shelfId={shelf?.id}
          />
        </FormActionModal>

        <Stack
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          mt={8}
          spacing={4}
        >
          <Box>
            <Heading color={headingColor} size="md">
              Documents
            </Heading>
            <Text color={mutedText} fontSize="sm">
              {filteredDocuments.length} document{filteredDocuments.length === 1 ? "" : "s"} shown
            </Text>
          </Box>

          <InputGroup maxW={{ base: "100%", md: "380px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              bg={panelBg}
              borderColor={borderColor}
              borderRadius="xl"
              placeholder="Search documents"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
        </Stack>

        {loading ? (
          <Center minH="320px">
            <Spinner color="blue.500" size="xl" />
          </Center>
        ) : filteredDocuments.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} mt={5} spacing={5}>
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDelete}
                onUpdate={(item) => {
                  setEditingDocument(item);
                  setShowForm(true);
                }}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center
            bg={panelBg}
            border="1px dashed"
            borderColor={borderColor}
            borderRadius="2xl"
            flexDirection="column"
            mt={5}
            minH="280px"
            p={8}
            textAlign="center"
          >
            <Icon as={FaFileAlt} boxSize={10} color="blue.400" mb={4} />
            <Heading size="md">No documents found</Heading>
            <Text color={mutedText} maxW="420px" mt={2}>
              {search
                ? "Try a different search word."
                : "Upload a document to this folder."}
            </Text>
            {!search && (
              <Button colorScheme="blue" leftIcon={<AddIcon />} mt={5} onClick={openNewDocumentForm}>
                Upload document
              </Button>
            )}
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default DocumentsPage;
