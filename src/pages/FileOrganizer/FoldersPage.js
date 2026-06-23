// src/pages/FileOrganizer/FoldersPage.js
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
import AddFolderForm from "./AddFolderForm";
import FolderCard from "./FolderCard";
import {
  createFolder,
  deleteFolder,
  getFoldersByContainerId,
  updateFolder,
} from "../../utils/FileOrganizer/foldersService";
import { getContainerById } from "../../utils/FileOrganizer/containersService";
import { getShelfById } from "../../utils/FileOrganizer/shelvesService";
import { handleError } from "../../utils/FileOrganizer/handleError";
import FormActionModal from "../../components/FileOrganizer/FormActionModal";

const FoldersPage = () => {
  const { containerId } = useParams();
  const toast = useToast();

  const [shelf, setShelf] = useState(null);
  const [container, setContainer] = useState(null);
  const [folders, setFolders] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const loadFolders = async () => {
    try {
      setLoading(true);
      const [containerData, foldersData] = await Promise.all([
        getContainerById(containerId),
        getFoldersByContainerId(containerId),
      ]);
      setContainer(containerData);
      setFolders(foldersData || []);

      if (containerData?.shelf_id) {
        const shelfData = await getShelfById(containerData.shelf_id);
        setShelf(shelfData);
      }
    } catch (error) {
      handleError(error, toast, "Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [containerId]);

  const filteredFolders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return folders;
    return folders.filter((folder) =>
      [folder.name, folder.description, folder.generated_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [folders, search]);

  const documentCount = useMemo(
    () => folders.reduce((total, folder) => total + (folder.documents?.length || 0), 0),
    [folders]
  );

  const openNewFolderForm = () => {
    setEditingFolder(null);
    setShowForm(true);
  };

  const handleSaveFolder = async (data) => {
    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, data);
        toast({ title: "Folder updated", status: "success", isClosable: true });
      } else {
        await createFolder({ ...data, container_id: parseInt(containerId, 10) });
        toast({ title: "Folder created", status: "success", isClosable: true });
      }

      setShowForm(false);
      setEditingFolder(null);
      setSearch("");
      await loadFolders();
    } catch (error) {
      handleError(
        error,
        toast,
        editingFolder ? "Error updating folder" : "Error adding folder"
      );
    }
  };

  const handleDeleteFolder = async (folderId) => {
    try {
      await deleteFolder(folderId);
      toast({ title: "Folder deleted", status: "success", isClosable: true });
      await loadFolders();
    } catch (error) {
      handleError(error, toast, "Error deleting folder");
    }
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
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
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
                <Text>Folders</Text>
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
              bg="yellow.50"
              borderRadius="2xl"
              color="yellow.600"
              h="58px"
              justify="center"
              w="58px"
            >
              <Icon as={FaFolder} boxSize={7} />
            </Flex>
            <Box>
              <Badge borderRadius="full" colorScheme="yellow" mb={3} px={3} py={1}>
                Container folders
              </Badge>
              <Heading color={headingColor} size="xl">
                {container?.name || "Folders"}
              </Heading>
              <Text color={mutedText} fontSize={{ base: "md", md: "lg" }} mt={2}>
                Folders keep related documents together inside this container.
              </Text>
            </Box>
          </HStack>

          <Button
            colorScheme="yellow"
            leftIcon={<AddIcon />}
            onClick={openNewFolderForm}
            size="lg"
          >
            New folder
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} mt={6} spacing={4}>
          <Flex align="center" bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" gap={3} p={4}>
            <Icon as={FaFolder} color="yellow.500" />
            <Text fontWeight="800">{folders.length}</Text>
            <Text color={mutedText}>folders in this container</Text>
          </Flex>
          <Flex align="center" bg={panelBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" gap={3} p={4}>
            <Icon as={FaFileAlt} color="blue.500" />
            <Text fontWeight="800">{documentCount}</Text>
            <Text color={mutedText}>documents across folders</Text>
          </Flex>
        </SimpleGrid>

        <FormActionModal
          colorScheme="yellow"
          description="Create a folder to group documents that belong together."
          eyebrow="Folder setup"
          helperItems={[
            "Keep folder names short and easy to scan.",
            "Use the description for notes about what belongs in this folder.",
            "Documents can be uploaded after the folder is saved.",
          ]}
          icon={FaFolder}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingFolder(null);
          }}
          title={editingFolder ? "Edit folder" : "Create new folder"}
        >
          <AddFolderForm
            containerId={containerId}
            editData={editingFolder}
            onSave={handleSaveFolder}
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
              Folders
            </Heading>
            <Text color={mutedText} fontSize="sm">
              {filteredFolders.length} folder{filteredFolders.length === 1 ? "" : "s"} shown
            </Text>
          </Box>

          <InputGroup maxW={{ base: "100%", md: "360px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              bg={panelBg}
              borderColor={borderColor}
              borderRadius="xl"
              placeholder="Search folders"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
        </Stack>

        {loading ? (
          <Center minH="320px">
            <Spinner color="yellow.500" size="xl" />
          </Center>
        ) : filteredFolders.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} mt={5} spacing={5}>
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                containerId={containerId}
                documents={folder.documents || []}
                folder={folder}
                onDelete={handleDeleteFolder}
                onUpdate={(item) => {
                  setEditingFolder(item);
                  setShowForm(true);
                }}
                shelfId={container?.shelf_id}
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
            <Icon as={search ? BsBoxSeam : FaFolder} boxSize={10} color="yellow.500" mb={4} />
            <Heading size="md">No folders found</Heading>
            <Text color={mutedText} maxW="420px" mt={2}>
              {search
                ? "Try a different search word."
                : "Create a folder for related documents."}
            </Text>
            {!search && (
              <Button colorScheme="yellow" leftIcon={<AddIcon />} mt={5} onClick={openNewFolderForm}>
                New folder
              </Button>
            )}
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default FoldersPage;
