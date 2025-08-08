import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  HStack,
  Text,
  useToast,
  SimpleGrid,
  Spinner,
  Center,
  Divider,
  Input,
  VStack,
  Tooltip,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { getShelves, createShelf, updateShelf, deleteShelf } from "../../utils/FileOrganizer/shelvesService";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService"; // <-- create this service
import ShelfCard from "./ShelfCard";
import AddShelfForm from "./AddShelfForm";
import { handleError } from "../../utils/FileOrganizer/handleError";
import { Link } from "react-router-dom";

const ShelvesPage = () => {
  const [shelves, setShelves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allData, setAllData] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchShelves();
    fetchGlobalData();
  }, []);

  const fetchShelves = async () => {
    try {
      setLoading(true);
      const data = await getShelves();
      setShelves(data);
    } catch (error) {
      handleError(error, toast, "Failed to fetch shelves");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalData = async () => {
    try {
      const shelves = await getAllData("shelves");
      const containers = await getAllData("containers");
      const folders = await getAllData("folders");
      const documents = await getAllData("documents");

      setAllData([...shelves, ...containers, ...folders, ...documents]);
    } catch (error) {
      console.error("Failed to fetch global data:", error);
    }
  };

  const handleAddOrEditShelf = async (shelfData) => {
    try {
      let result;
      if (editingShelf) {
        result = await updateShelf(editingShelf.id, shelfData);
        toast({ title: "Shelf updated", status: "success", isClosable: true });
      } else {
        result = await createShelf(shelfData);
        toast({ title: "Shelf created", status: "success", isClosable: true });
      }
      setEditingShelf(null);
      setShowForm(false);
      fetchShelves();
    } catch (error) {
      handleError(error, toast, editingShelf ? "Error updating shelf" : "Error adding shelf");
    }
  };

  const handleDelete = async (shelf) => {
    if (shelf.container_count > 0) {
      toast({ title: "Shelf not empty", description: "Cannot delete shelf with containers", status: "warning", isClosable: true });
      return;
    }
    try {
      await deleteShelf(shelf.id);
      toast({ title: "Shelf deleted", status: "success", isClosable: true });
      fetchShelves();
    } catch (error) {
      handleError(error, toast, "Error deleting shelf");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = allData.filter((item) =>
      item.name?.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  };

  const getPath = (item) => {
    if (item.shelf_id && item.container_id && item.folder_id) {
      return `/shelves/${item.shelf_id}/containers/${item.container_id}/folders/${item.folder_id}/documents/${item.id}`;
    } else if (item.shelf_id && item.container_id) {
      return `/shelves/${item.shelf_id}/containers/${item.container_id}/folders/${item.id}/documents`;
    } else if (item.shelf_id) {
      return `/file-organizer/shelves/${item.shelf_id}/containers/${item.id}/folders`;
    } else {
      return `/file-organizer/shelves/${item.id}/containers`;
    }
  };

  const cardBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box p={[4, 6, 10]}>
      <HStack justify="space-between" mb={6}>
        <Heading>📚 File Organizer — Shelves</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme={showForm ? "red" : "teal"}
          onClick={() => {
            setEditingShelf(null);
            setShowForm(!showForm);
          }}
        >
          {showForm ? "Cancel" : editingShelf ? "Cancel Edit" : "Shelf"}
        </Button>
      </HStack>

      {/* 🔍 Global Search Input */}
      <Box mb={8}>
        <Input
          placeholder="🔍 Search shelves, containers, folders, or documents..."
          value={searchQuery}
          onChange={handleSearch}
          size="lg"
          mb={3}
        />
        {searchQuery && (
          <VStack align="start" spacing={2} maxH="300px" overflowY="auto">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <ChakraLink
                  key={item.id}
                  as={Link}
                  to={getPath(item)}
                  _hover={{ textDecoration: "underline" }}
                  fontSize="sm"
                  bg={cardBg}
                  px={3}
                  py={2}
                  borderRadius="md"
                  w="100%"
                  boxShadow="md"
                >
                  {item.name}
                </ChakraLink>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500">
                No matching results found.
              </Text>
            )}
          </VStack>
        )}
      </Box>

      {showForm && (
        <Box mb={6}>
          <AddShelfForm
            initialData={editingShelf}
            onSave={handleAddOrEditShelf}
          />
          <Divider mt={6} />
        </Box>
      )}

      {loading ? (
        <Center>
          <Spinner size="xl" color="teal.500" />
        </Center>
      ) : shelves.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {shelves.map((shelf) => (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              onEdit={() => {
                setEditingShelf(shelf);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(shelf)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center>
          <Text>No shelves found.</Text>
        </Center>
      )}
    </Box>
  );
};

export default ShelvesPage;
