import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  HStack,
  useToast,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import { PlusSquareIcon } from "@chakra-ui/icons";
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

const CARD_MIN_HEIGHT = 220;

const AddNewShelfCard = ({ onClick }) => {
  const bg = useColorModeValue("gray.100", "gray.600");
  const hoverBg = useColorModeValue("gray.200", "gray.500");
  const color = useColorModeValue("orange.600", "orange.300");
  const hoverColor = useColorModeValue("orange.500", "orange.400");

  return (
    <Box
      bg={bg}
      borderRadius="md"
      p={6}
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onClick={onClick}
      minH={`${CARD_MIN_HEIGHT}px`}
      h="100%"
      w="100%"
      color={color}
      userSelect="none"
      textAlign="center"
      opacity={0.4}
      fontSize="8xl"
      transition="opacity 0.3s ease, transform 0.3s ease, color 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        opacity: 1,
        bg: hoverBg,
        color: hoverColor,
        transform: "scale(1.05)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <PlusSquareIcon boxSize="72px" />
    </Box>
  );
};

const ShelvesPage = () => {
  const [shelves, setShelves] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const toast = useToast();

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

      const tagData = (items, type) => items.map((item) => ({ ...item, type }));

      setAllData([
        ...tagData(shelvesData, "shelf"),
        ...tagData(containersData, "container"),
        ...tagData(folders, "folder"),
        ...tagData(documents, "document"),
      ]);
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
      setShowAddCard(false);
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

  const cardBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box p={[4, 6, 10]}>
      <HStack justify="space-between" mt={12} mb={6}>
        <Heading>📚 File Organizer — Shelves</Heading>
      </HStack>

      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {showAddCard ? (
          <Box
            bg={cardBg}
            borderRadius="md"
            p={4}
            boxShadow="md"
            w="100%"
            minH={`${CARD_MIN_HEIGHT}px`}
            h="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <AddShelfForm
              initialData={editingShelf}
              onSave={handleAddOrEditShelf}
              onCancel={() => {
                setShowAddCard(false);
                setEditingShelf(null);
              }}
            />
          </Box>
        ) : (
          <AddNewShelfCard onClick={() => setShowAddCard(true)} />
        )}

        {shelves.map((shelf) => (
          <ShelfCard
            key={shelf.id}
            shelf={shelf}
            containers={containers.filter(
              (container) => container.shelf_id === shelf.id
            )}
            onEdit={() => {
              setEditingShelf(shelf);
              setShowAddCard(true);
            }}
            onDelete={() => handleDelete(shelf)}
            minHeight={CARD_MIN_HEIGHT}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ShelvesPage;
