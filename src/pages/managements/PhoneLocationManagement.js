import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, DownloadIcon } from "@chakra-ui/icons";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import Papa from "papaparse";

const PhoneLocationManagement = () => {
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const cancelRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchLocations = () => {
    fetchData(
      "phonelocations",
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

  useEffect(() => {
    fetchLocations();
  }, []);

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
      await postData("phonelocations", { name: newLocation });
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
    if (!editingLocation?.name) {
      toast({
        title: "Location name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await putData("phonelocations", editingLocation.id, {
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
      await deleteData("phonelocations", deletingLocation.id);
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
      onClose();
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = locations.filter((loc) =>
      loc.name.toLowerCase().includes(query)
    );
    setFilteredLocations(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedLocations = [...filteredLocations].sort((a, b) => {
    const order = sortConfig.direction === "asc" ? 1 : -1;
    return a[sortConfig.key].localeCompare(b[sortConfig.key]) * order;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

  const exportToCSV = () => {
    const csv = Papa.unparse(
      locations.map((loc) => ({ ID: loc.id, Name: loc.name }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "phone_locations.csv";
    link.click();
  };

  return (
    <Box p={4}>
      <Flex mb={4} justify="space-between" align="center">
        <Input
          placeholder="Search location"
          value={searchQuery}
          onChange={handleSearch}
          maxW="300px"
        />
        <Flex gap={2}>
          <Button leftIcon={<DownloadIcon />} onClick={exportToCSV}>
            Export CSV
          </Button>
          <Select
            w="120px"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 25, 50].map((num) => (
              <option key={num} value={num}>
                {num}/page
              </option>
            ))}
          </Select>
          {!isAdding && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => setIsAdding(true)}
            >
              Add
            </Button>
          )}
        </Flex>
      </Flex>

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th cursor="pointer" onClick={() => handleSort("name")}>
              Name{" "}
              {sortConfig.key === "name"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </Th>
            <Th isNumeric pr="20px">
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isAdding && (
            <Tr>
              <Td>
                <Input
                  placeholder="New location name"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  autoFocus
                />
              </Td>
              <Td isNumeric pr="20px">
                <Flex justify="end" gap={2}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={handleAddLocation}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                </Flex>
              </Td>
            </Tr>
          )}
          {currentItems.map((location) => (
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
              <Td isNumeric pr="20px">
                <Flex justify="end" gap={2}>
                  {editingLocation?.id === location.id ? (
                    <>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={handleUpdateLocation}
                      >
                        Update
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="gray"
                        onClick={() => setEditingLocation(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <IconButton
                        size="sm"
                        colorScheme="blue"
                        icon={<EditIcon />}
                        aria-label="Edit"
                        onClick={() => setEditingLocation(location)}
                      />
                      <IconButton
                        size="sm"
                        colorScheme="red"
                        icon={<DeleteIcon />}
                        aria-label="Delete"
                        onClick={() => {
                          setDeletingLocation(location);
                          onOpen();
                        }}
                      />
                    </>
                  )}
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Pagination */}
      <Flex justify="center" mt={4} gap={2}>
        <Button
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>
        <Text alignSelf="center">
          Page {currentPage} of {totalPages}
        </Text>
        <Button
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          isDisabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Flex>

      {/* Delete Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Location</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete <b>{deletingLocation?.name}</b>?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={handleDeleteLocation}>
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
