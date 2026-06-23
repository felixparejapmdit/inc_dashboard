import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
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
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { BsBoxSeam } from "react-icons/bs";
import { FaFileAlt, FaFolder, FaLayerGroup } from "react-icons/fa";
import AddShelfForm from "./AddShelfForm";
import ShelfCard from "./ShelfCard";
import {
  createShelf,
  deleteShelf,
  getShelves,
  updateShelf,
} from "../../utils/FileOrganizer/shelvesService";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";
import { handleError } from "../../utils/FileOrganizer/handleError";
import FormActionModal from "../../components/FileOrganizer/FormActionModal";

const SummaryTile = ({ icon, label, value, colorScheme }) => (
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
      <Text color={`${colorScheme}.700`} fontSize="2xl" fontWeight="800" lineHeight="1">
        {value}
      </Text>
      <Text color={`${colorScheme}.700`} fontSize="sm" fontWeight="600">
        {label}
      </Text>
    </Box>
  </Flex>
);

const ShelvesPage = () => {
  const [shelves, setShelves] = useState([]);
  const [containers, setContainers] = useState([]);
  const [folderCount, setFolderCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const loadOrganizerData = async () => {
    try {
      setLoading(true);
      const [shelvesData, containersData, foldersData, documentsData] =
        await Promise.all([
          getShelves(),
          getAllData("Containers"),
          getAllData("Folders"),
          getAllData("Documents"),
        ]);

      setShelves(shelvesData || []);
      setContainers(containersData || []);
      setFolderCount((foldersData || []).length);
      setDocumentCount((documentsData || []).length);
    } catch (error) {
      handleError(error, toast, "Failed to load File Organizer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganizerData();
  }, []);

  const filteredShelves = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return shelves;
    return shelves.filter((shelf) =>
      [shelf.name, shelf.description, shelf.generated_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [search, shelves]);

  const handleAddOrEditShelf = async (shelfData) => {
    try {
      if (editingShelf) {
        await updateShelf(editingShelf.id, shelfData);
        toast({ title: "Shelf updated", status: "success", isClosable: true });
      } else {
        await createShelf(shelfData);
        toast({ title: "Shelf created", status: "success", isClosable: true });
      }
      setEditingShelf(null);
      setShowAddForm(false);
      await loadOrganizerData();
    } catch (error) {
      handleError(
        error,
        toast,
        editingShelf ? "Error updating shelf" : "Error adding shelf"
      );
    }
  };

  const handleDelete = async (shelf) => {
    const shelfContainers = containers.filter(
      (container) => String(container.shelf_id) === String(shelf?.id)
    );

    if (shelfContainers.length > 0) {
      toast({
        title: "Shelf is not empty",
        description: "Move or delete its containers first.",
        status: "warning",
        isClosable: true,
      });
      return;
    }

    try {
      await deleteShelf(shelf.id);
      toast({ title: "Shelf deleted", status: "success", isClosable: true });
      await loadOrganizerData();
    } catch (error) {
      handleError(error, toast, "Error deleting shelf");
    }
  };

  const openNewShelfForm = () => {
    setEditingShelf(null);
    setShowAddForm(true);
  };

  const openEditShelfForm = (shelf) => {
    setEditingShelf(shelf);
    setShowAddForm(true);
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
          <Box>
            <Badge borderRadius="full" colorScheme="teal" mb={3} px={3} py={1}>
              File Organizer
            </Badge>
            <Heading color={headingColor} size="xl">
              Shelves
            </Heading>
            <Text color={mutedText} fontSize={{ base: "md", md: "lg" }} mt={2}>
              Start with a shelf, then organize records into containers, folders, and documents.
            </Text>
          </Box>

          <Button
            colorScheme="teal"
            leftIcon={<AddIcon />}
            onClick={openNewShelfForm}
            size="lg"
          >
            New shelf
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} mt={6} spacing={4}>
          <SummaryTile icon={FaLayerGroup} label="Shelves" value={shelves.length} colorScheme="teal" />
          <SummaryTile icon={BsBoxSeam} label="Containers" value={containers.length} colorScheme="orange" />
          <SummaryTile icon={FaFolder} label="Folders" value={folderCount} colorScheme="yellow" />
          <SummaryTile icon={FaFileAlt} label="Documents" value={documentCount} colorScheme="blue" />
        </SimpleGrid>

        <FormActionModal
          colorScheme="teal"
          description="Create a top-level place for related containers, folders, and documents."
          eyebrow="Shelf setup"
          helperItems={[
            "Use a simple name that describes the records area.",
            "Add a short description so teammates know what belongs here.",
            "Containers can be added after the shelf is saved.",
          ]}
          icon={FaLayerGroup}
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditingShelf(null);
          }}
          title={editingShelf ? "Edit shelf" : "Create new shelf"}
        >
          <AddShelfForm
            initialData={editingShelf}
            onCancel={() => {
              setShowAddForm(false);
              setEditingShelf(null);
            }}
            onSave={handleAddOrEditShelf}
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
              All shelves
            </Heading>
            <Text color={mutedText} fontSize="sm">
              {filteredShelves.length} {filteredShelves.length === 1 ? "shelf" : "shelves"} shown
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
              placeholder="Search shelves"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
        </Stack>

        {loading ? (
          <Center minH="320px">
            <Spinner color="teal.500" size="xl" />
          </Center>
        ) : filteredShelves.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} mt={5} spacing={5}>
            {filteredShelves.map((shelf) => (
              <ShelfCard
                key={shelf.id}
                containers={containers.filter(
                  (container) => String(container.shelf_id) === String(shelf.id)
                )}
                onDelete={() => handleDelete(shelf)}
                onEdit={() => openEditShelfForm(shelf)}
                shelf={shelf}
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
            <Icon as={FaLayerGroup} boxSize={10} color="teal.400" mb={4} />
            <Heading size="md">No shelves found</Heading>
            <Text color={mutedText} maxW="420px" mt={2}>
              {search
                ? "Try a different search word."
                : "Create your first shelf to start organizing files."}
            </Text>
            {!search && (
              <Button colorScheme="teal" leftIcon={<AddIcon />} mt={5} onClick={openNewShelfForm}>
                New shelf
              </Button>
            )}
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default ShelvesPage;
