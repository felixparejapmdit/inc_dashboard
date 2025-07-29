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
  Select,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25];

const LocationManagement = () => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    const filtered = locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLocations(filtered);
    setCurrentPage(1);
  }, [searchQuery, locations]);

  const fetchLocations = () => {
    fetchData(
      "locations",
      (data) => {
        setLocations(data);
        setFilteredLocations(data);
      },
      (err) =>
        toast({
          title: "Error loading locations",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch locations"
    );
  };

  const handleAddLocation = async () => {
    if (!newLocation.trim()) {
      toast({
        title: "Location name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await postData("locations", { name: newLocation });
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

  const handleUpdateLocation = async () => {
    if (!editingLocation?.name.trim()) {
      toast({
        title: "Location name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await putData("locations", editingLocation.id, {
        name: editingLocation.name,
      });
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

  const handleDeleteLocation = async () => {
    if (!deletingLocation) return;

    try {
      await deleteData("locations", deletingLocation.id);
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

  // Pagination Logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLocations = filteredLocations.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Event Locations
          </Text>
          <Flex gap={3}>
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
              width="200px"
            />
            <Select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              size="sm"
              width="100px"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                <option key={num} value={num}>
                  {num} / page
                </option>
              ))}
            </Select>
          </Flex>
        </Flex>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th textAlign="right">
                <Flex justify="flex-end" align="center">
                  <Text mr={2}>Actions</Text>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add location"
                      variant="ghost"
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
            {paginatedLocations.map((location) => (
              <Tr key={location.id}>
                <Td>
                  {editingLocation?.id === location.id ? (
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
                    {editingLocation?.id === location.id ? (
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

        {/* Pagination Controls */}
        <Flex justify="center" mt={2} gap={2} align="center">
          <Button
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
          >
            Prev
          </Button>
          <Text fontSize="sm">
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
            }
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
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

export default LocationManagement;
