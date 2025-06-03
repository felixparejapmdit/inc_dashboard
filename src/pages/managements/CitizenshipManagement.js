import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  IconButton,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

const ITEMS_PER_PAGE = 15;

const CitizenshipManagement = () => {
  const [citizenships, setCitizenships] = useState([]);
  const [filteredCitizenships, setFilteredCitizenships] = useState([]);
  const [newCitizenship, setNewCitizenship] = useState({
    country_name: "",
    citizenship: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingCitizenship, setEditingCitizenship] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingCitizenship, setDeletingCitizenship] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchCitizenships();
  }, []);

  const fetchCitizenships = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/citizenships`
      );
      setCitizenships(response.data);
      setFilteredCitizenships(response.data);
    } catch (error) {
      toast({
        title: "Error loading citizenships",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddOrEditCitizenship = async () => {
    if (!newCitizenship.country_name || !newCitizenship.citizenship) {
      toast({
        title: "Fields Required",
        description: "Both Country Name and Citizenship are required.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      if (editingCitizenship) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/citizenships/${editingCitizenship.id}`,
          newCitizenship
        );
        toast({
          title: "Citizenship updated",
          status: "success",
          duration: 3000,
        });
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/citizenships`,
          newCitizenship
        );
        toast({
          title: "Citizenship added",
          status: "success",
          duration: 3000,
        });
      }
      fetchCitizenships();
      setNewCitizenship({ country_name: "", citizenship: "" });
      setIsAdding(false);
      setEditingCitizenship(null);
    } catch (error) {
      toast({
        title: `Error ${
          editingCitizenship ? "updating" : "adding"
        } citizenship`,
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditCitizenship = (citizen) => {
    setNewCitizenship({
      country_name: citizen.country_name,
      citizenship: citizen.citizenship,
    });
    setEditingCitizenship(citizen);
    setIsAdding(true);
  };

  const handleDeleteCitizenship = async () => {
    if (!deletingCitizenship) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/citizenships/${deletingCitizenship.id}`
      );
      fetchCitizenships();
      toast({
        title: "Citizenship deleted",
        status: "success",
        duration: 3000,
      });
      setDeletingCitizenship(null);
    } catch (error) {
      toast({
        title: "Error deleting citizenship",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    const filtered = citizenships.filter((citizen) =>
      `${citizen.country_name} ${citizen.citizenship}`
        .toLowerCase()
        .includes(event.target.value.toLowerCase())
    );
    setFilteredCitizenships(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredCitizenships.length / ITEMS_PER_PAGE);
  const currentItems = filteredCitizenships.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPages)
        : Math.max(prev - 1, 1)
    );
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          Citizenship List
        </Text>

        <Input
          placeholder="Search by Country or Citizenship"
          value={searchTerm}
          onChange={handleSearch}
          mb={4}
        />

        {/* Pagination Controls - Top */}
        <Flex justify="space-between" align="center" mb={4}>
          <Button
            onClick={() => handlePageChange("previous")}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Country Name</Th>
              <Th>Citizenship</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Actions</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add citizenship"
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
                <Td>—</Td>
                <Td>
                  <Input
                    placeholder="Country Name"
                    value={newCitizenship.country_name}
                    onChange={(e) =>
                      setNewCitizenship({
                        ...newCitizenship,
                        country_name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Citizenship"
                    value={newCitizenship.citizenship}
                    onChange={(e) =>
                      setNewCitizenship({
                        ...newCitizenship,
                        citizenship: e.target.value,
                      })
                    }
                  />
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    <Button
                      onClick={handleAddOrEditCitizenship}
                      colorScheme="green"
                      size="sm"
                      mr={2}
                    >
                      {editingCitizenship ? "Save" : "Add"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setEditingCitizenship(null);
                        setNewCitizenship({
                          country_name: "",
                          citizenship: "",
                        });
                      }}
                      colorScheme="red"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            )}
            {currentItems.map((citizen, index) => (
              // <Tr key={citizen.id}>
              <Tr key={`${citizen.id}-${index}`}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                <Td>{citizen.country_name}</Td>
                <Td>{citizen.citizenship}</Td>
                <Td>
                  <Flex justify="flex-end">
                    <IconButton
                      icon={<EditIcon />}
                      onClick={() => handleEditCitizenship(citizen)}
                      size="sm"
                      mr={2}
                      variant="ghost"
                      colorScheme="yellow"
                      aria-label="Edit citizenship"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => setDeletingCitizenship(citizen)}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Delete citizenship"
                    />
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Pagination Controls - Bottom */}
        <Flex justify="space-between" align="center" mt={4}>
          <Button
            onClick={() => handlePageChange("previous")}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingCitizenship}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingCitizenship(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Citizenship
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "
              {deletingCitizenship?.country_name}"? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingCitizenship(null)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteCitizenship}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CitizenshipManagement;
