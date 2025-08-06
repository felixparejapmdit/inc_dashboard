// src/pages/FileOrganizer/ShelvesPage.jsx
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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { getShelves, createShelf, updateShelf, deleteShelf } from "../../utils/FileOrganizer/shelvesService";
import ShelfCard from "./ShelfCard";
import AddShelfForm from "./AddShelfForm";
import { handleError } from "../../utils/FileOrganizer/handleError";

const ShelvesPage = () => {
  const [shelves, setShelves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchShelves();
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

  return (
    <Box p={[4, 6, 10]}>
      <HStack justify="space-between" mb={6}>
        <Heading>📚 File Organizer — Shelves</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme={showForm ? "red" : "teal"}
          onClick={() => { setEditingShelf(null); setShowForm(!showForm); }}
        >
          {showForm ? "Cancel" : editingShelf ? "Cancel Edit" : "Add Shelf"}
        </Button>
      </HStack>

      {showForm && (
        <Box mb={6}>
          <AddShelfForm
            initialData={editingShelf}
            onSave={handleAddOrEditShelf}
          />
          <Divider mt={6}/>
        </Box>
      )}

      {loading ? (
        <Center><Spinner size="xl" color="teal.500" /></Center>
      ) : shelves.length > 0 ? (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {shelves.map((shelf) => (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              onEdit={() => { setEditingShelf(shelf); setShowForm(true); }}
              onDelete={() => handleDelete(shelf)}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center><Text>No shelves found.</Text></Center>
      )}
    </Box>
  );
};

export default ShelvesPage;
