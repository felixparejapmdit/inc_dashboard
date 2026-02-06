// src/pages/FileOrganizer/DocumentsPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  useToast,
  Input,
  Text,
  Center,
  Spinner,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
  Button,
  Tooltip,
  useColorModeValue,
  Progress,
} from "@chakra-ui/react";
import { ChevronRightIcon, AddIcon } from "@chakra-ui/icons";
import { useParams, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import AddDocumentForm from "./AddDocumentForm";
import DocumentCard from "./DocumentCard";

import {
  getDocumentsByFolderId,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../../utils/FileOrganizer/documentsService";

import { getFolderById } from "../../utils/FileOrganizer/foldersService";
import { getContainerById } from "../../utils/FileOrganizer/containersService";
import { getShelfById } from "../../utils/FileOrganizer/shelvesService";
import { handleError } from "../../utils/FileOrganizer/handleError";

const MotionBox = motion.create(Box);

const DocumentsPage = () => {
  const { containerId, folderId } = useParams();
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [folder, setFolder] = useState(null);
  const [container, setContainer] = useState(null);
  const [shelf, setShelf] = useState(null);

  const bgColor = useColorModeValue("white", "gray.800");

  useEffect(() => {
    fetchNames();
    refreshDocuments();
  }, [folderId]);

  const fetchNames = async () => {
    try {
      const folderRes = await getFolderById(folderId);
      const containerRes = await getContainerById(folderRes.container_id);
      const shelfRes = await getShelfById(containerRes.shelf_id);

      setFolder(folderRes);
      setContainer(containerRes);
      setShelf(shelfRes);
    } catch (error) {
      handleError(error, toast, "Failed to fetch names");
    }
  };

  const refreshDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocumentsByFolderId(folderId);
      setDocuments(data);
      setFilteredDocuments(filterBySearch(data, search));
    } catch (error) {
      handleError(error, toast, "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const filterBySearch = (list, searchText) => {
    if (!searchText.trim()) return list;
    return list.filter((doc) =>
      doc.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      toast({ title: "Document deleted", status: "success" });
      await refreshDocuments();
    } catch (error) {
      handleError(error, toast, "Error deleting document");
    }
  };

  const handleUpdate = (doc) => {
    setEditingDocument(doc);
    setShowForm(true);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    setFilteredDocuments(filterBySearch(documents, search));
  }, [search, documents]);

  return (
    <Box p={[4, 6, 10]} mt={12}>


      {/* Simple Breadcrumb */}
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.400" boxSize={4} />}
        fontWeight="medium"
        fontSize={{ base: "xs", sm: "sm", md: "sm" }}
        color="gray.600"
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/file-organizer/shelves">
            📁 Shelves
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            as={RouterLink}
            to={`/file-organizer/shelves/${shelf?.id}/containers`}
            color="teal.700"
            fontWeight="semibold"
          >
            {shelf ? shelf.name : "Loading..."}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            as={RouterLink}
            to={`/containers/${containerId}/folders`}
            color="gray.700"
            fontWeight="semibold"
          >
            🗂 Folders
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink color="gray.700" fontWeight="semibold">
            📄 Documents
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>



      {/* Heading */}
      <HStack
        justifyContent="space-between"
        alignItems="center"
        mb={6}
        mt={6}
        flexWrap="wrap"
      >
        <HStack spacing={2} alignItems="baseline">
          <Heading size="lg" color="teal.700">
            📄 Documents in{" "}
            <Text as="span" fontWeight="bold" color="teal.800">
              {folder?.name || "..."}
            </Text>
          </Heading>
          {filteredDocuments.length > 0 && (
            <Text fontSize="sm" color="gray.500">
              ({filteredDocuments.length} total)
            </Text>
          )}
        </HStack>

        <Button
          leftIcon={<AddIcon />}
          colorScheme={showForm ? "red" : "teal"}
          onClick={() => {
            setShowForm(!showForm);
            setEditingDocument(null);
          }}
          mt={{ base: 3, md: 0 }}
        >
          {showForm ? "Cancel" : "Document"}
        </Button>
      </HStack>

      {/* Add/Edit Form */}
      {showForm && (
        <Box mb={6}>
          <AddDocumentForm
            onSave={async (data) => {
              try {
                if (editingDocument) {
                  await updateDocument(editingDocument.id, data);
                  toast({ title: "Document updated", status: "success" });
                } else {
                  await createDocument({
                    ...data,
                    folder_id: parseInt(folderId),
                  });
                  toast({ title: "Document created", status: "success" });
                }
                setShowForm(false);
                setEditingDocument(null);
                await refreshDocuments();
              } catch (error) {
                handleError(error, toast, "Error saving document");
              }
            }}
            editData={editingDocument}
            folderId={folderId}
          />
        </Box>
      )}

      {/* Search */}
      <HStack mb={6}>
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </HStack>

      {/* Document List */}
      {loading ? (
        <Center>
          <Spinner size="xl" color="teal.500" />
        </Center>
      ) : filteredDocuments.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} spacing={4} mt={4}>
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center>
          <Text color="gray.500">No documents found.</Text>
        </Center>
      )}
    </Box>
  );
};

export default DocumentsPage;
