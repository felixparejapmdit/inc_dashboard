import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  HStack,
  useToast,
  SimpleGrid,
  useColorModeValue,
  Center,
  Spinner,
  Text,
  Button,
} from "@chakra-ui/react";
import { PlusSquareIcon, AddIcon } from "@chakra-ui/icons";
import {
  getShelves,
  createShelf,
  updateShelf,
  deleteShelf,
} from "../../utils/FileOrganizer/shelvesService";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";
import ShelfCard from "./ShelfCard";
import AddShelfForm from "./AddShelfForm";
import { handleError } from "../../utils/FileOrganizer/handleError";

const ShelvesPage = () => {
  const [shelves, setShelves] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const toast = useToast();

  const primaryColor = useColorModeValue("teal.700", "teal.300");
  const headerBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const init = async () => {
      await fetchShelves();
      await fetchGlobalData();
    };
    init();
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
      const shelvesData = await getAllData("Shelves");
      const containersData = await getAllData("Containers");
      const folders = await getAllData("Folders");
      const documents = await getAllData("Documents");

      setContainers(containersData);

      // This section of code is not used for rendering, but kept for context.
      // const tagData = (items, type) => items.map((item) => ({ ...item, type }));
      // setAllData([
      //   ...tagData(shelvesData, "shelf"),
      //   ...tagData(containersData, "container"),
      //   ...tagData(folders, "folder"),
      //   ...tagData(documents, "document"),
      // ]);
    } catch (error) {
      console.error("Failed to fetch global data:", error);
    }
  };

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
      fetchShelves();
    } catch (error) {
      handleError(
        error,
        toast,
        editingShelf ? "Error updating shelf" : "Error adding shelf"
      );
    }
  };

  const handleDelete = async (shelf) => {
    if (shelf.container_count > 0) {
      toast({
        title: "Shelf not empty",
        description: "Cannot delete shelf with containers",
        status: "warning",
        isClosable: true,
      });
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

  const handleAddShelfClick = () => {
    setEditingShelf(null);
    setShowAddForm(true);
  };

  const handleEditShelfClick = (shelf) => {
    setEditingShelf(shelf);
    setShowAddForm(true);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingShelf(null);
  };

  return (
    <Box p={[4, 6, 10]} bg={headerBg} minH="100vh" pt={20} mt={12}>
      <HStack justify="space-between" mb={6}>
        <Heading size="xl" color={primaryColor}>
          📚 File Organizer — Shelves
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          onClick={handleAddShelfClick}
        >
          Add Shelf
        </Button>
      </HStack>
      
      {showAddForm && (
        <Box mb={6}>
          <AddShelfForm
            initialData={editingShelf}
            onSave={handleAddOrEditShelf}
            onCancel={handleCancelForm}
          />
        </Box>
      )}

      {loading ? (
        <Center minH="calc(100vh - 200px)">
          <Spinner size="xl" color={primaryColor} />
        </Center>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {shelves.map((shelf) => (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              containers={containers.filter(
                (container) => container.shelf_id === shelf.id
              )}
              onEdit={() => handleEditShelfClick(shelf)}
              onDelete={() => handleDelete(shelf)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default ShelvesPage;
