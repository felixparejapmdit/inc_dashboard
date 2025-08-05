// src/pages/FileOrganizer/ShelvesPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  SimpleGrid,
  Spinner,
  Center,
  Divider,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { getShelves, createShelf } from "../../utils/FileOrganizer/shelvesService.js";
import ShelfCard from "./ShelfCard";
import AddShelfForm from "./AddShelfForm";
import { handleError } from "../../utils/FileOrganizer/handleError.js";

const ShelvesPage = () => {
  const [shelves, setShelves] = useState([]);
  const [showForm, setShowForm] = useState(false);
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

  const handleAddShelf = async (newShelf) => {
    try {
      const created = await createShelf(newShelf);
      if (created) {
        fetchShelves();
        setShowForm(false);
        toast({
          title: "Shelf added",
          description: "New shelf successfully created.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      handleError(error, toast, "Error adding shelf");
    }
  };

  return (
    <Box p={[4, 6, 10]}>
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg" color="teal.700">📚 File Organizer — Shelves</Heading>

        <Button
          leftIcon={<AddIcon />}
          colorScheme={showForm ? "red" : "teal"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Shelf"}
        </Button>
      </HStack>

      {showForm && (
        <Box mb={6}>
          <AddShelfForm onSave={handleAddShelf} />
          <Divider mt={6} />
        </Box>
      )}

      <Box mt={6}>
        {loading ? (
          <Center>
            <Spinner size="xl" color="teal.500" />
          </Center>
        ) : shelves.length > 0 ? (
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {shelves.map((shelf) => (
              <ShelfCard key={shelf.id} shelf={shelf} />
            ))}
          </SimpleGrid>
        ) : (
          <Center>
            <Text color="gray.500">No shelves found.</Text>
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default ShelvesPage;
