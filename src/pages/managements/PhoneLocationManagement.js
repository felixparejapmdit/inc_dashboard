import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Flex,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

const PhoneLocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchLocations();
  }, []);

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/phonelocations`
      );
      setLocations(response.data);
    } catch (error) {
      toast({
        title: "Error loading locations",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Add a new location
  const handleAddLocation = async () => {
    if (!newLocation) {
      toast({
        title: "Location name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/phonelocations`, {
        name: newLocation,
      });
      fetchLocations();
      setNewLocation("");
      setIsAdding(false);
      toast({
        title: "Location added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding location",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Update an existing location
  const handleUpdateLocation = async () => {
    if (!editingLocation?.name) {
      toast({
        title: "Location name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/phonelocations/${editingLocation.id}`,
        { name: editingLocation.name }
      );
      fetchLocations();
      setEditingLocation(null);
      toast({
        title: "Location updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating location",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Delete a location
  const handleDeleteLocation = async () => {
    if (!deletingLocation) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/phonelocations/${deletingLocation.id}`
      );
      fetchLocations();
      toast({
        title: "Location deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting location",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingLocation(null);
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Phone Locations
          </Text>
        </Flex>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Actions</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add location"
                      variant="ghost"
                      _hover={{ bg: "gray.100" }}
                    />
                  )}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isAdding && (
              <Tr>
                <Td>
                  <Input
                    placeholder="Location Name"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    autoFocus
                  />
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    <Button
                      onClick={handleAddLocation}
                      colorScheme="green"
                      size="sm"
                      mr={2}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      colorScheme="red"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            )}
            {locations.map((location) => (
              <Tr key={location.id}>
                <Td>
                  {editingLocation && editingLocation.id === location.id ? (
                    <Input
                      value={editingLocation.name}
                      onChange={(e) =>
                        setEditingLocation({
                          ...editingLocation,
                          name: e.target.value,
                        })
                      }
                      autoFocus
                    />
                  ) : (
                    location.name
                  )}
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    {editingLocation && editingLocation.id === location.id ? (
                      <>
                        <Button
                          onClick={handleUpdateLocation}
                          colorScheme="green"
                          size="sm"
                          mr={2}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingLocation(null)}
                          colorScheme="red"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconButton
                          icon={<EditIcon />}
                          onClick={() => setEditingLocation(location)}
                          size="sm"
                          mr={2}
                          variant="ghost"
                          colorScheme="yellow"
                          aria-label="Edit location"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => setDeletingLocation(location)}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete location"
                        />
                      </>
                    )}
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingLocation}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingLocation(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Location
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the location "
              {deletingLocation?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingLocation(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteLocation} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PhoneLocationManagement;
