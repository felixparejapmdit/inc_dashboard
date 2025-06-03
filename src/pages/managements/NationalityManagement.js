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

const NationalityManagement = () => {
  const [nationalities, setNationalities] = useState([]);
  const [filteredNationalities, setFilteredNationalities] = useState([]);
  const [newNationality, setNewNationality] = useState({
    country_name: "",
    nationality: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingNationality, setEditingNationality] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingNationality, setDeletingNationality] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchNationalities();
  }, []);

  const fetchNationalities = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/nationalities`
      );
      setNationalities(response.data);
      setFilteredNationalities(response.data);
    } catch (error) {
      toast({
        title: "Error loading nationalities",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddOrEditNationality = async () => {
    if (!newNationality.country_name || !newNationality.nationality) {
      toast({
        title: "Fields Required",
        description: "Both Country Name and Nationality are required.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      if (editingNationality) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/nationalities/${editingNationality.id}`,
          newNationality
        );
        toast({
          title: "Nationality updated",
          status: "success",
          duration: 3000,
        });
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/nationalities`,
          newNationality
        );
        toast({
          title: "Nationality added",
          status: "success",
          duration: 3000,
        });
      }
      fetchNationalities();
      setNewNationality({ country_name: "", nationality: "" });
      setIsAdding(false);
      setEditingNationality(null);
    } catch (error) {
      toast({
        title: `Error ${
          editingNationality ? "updating" : "adding"
        } nationality`,
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditNationality = (nation) => {
    setNewNationality({
      country_name: nation.country_name,
      nationality: nation.nationality,
    });
    setEditingNationality(nation);
    setIsAdding(true);
  };

  const handleDeleteNationality = async () => {
    if (!deletingNationality) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/nationalities/${deletingNationality.id}`
      );
      fetchNationalities();
      toast({
        title: "Nationality deleted",
        status: "success",
        duration: 3000,
      });
      setDeletingNationality(null);
    } catch (error) {
      toast({
        title: "Error deleting nationality",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    const filtered = nationalities.filter((nation) =>
      `${nation.country_name} ${nation.nationality}`
        .toLowerCase()
        .includes(event.target.value.toLowerCase())
    );
    setFilteredNationalities(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredNationalities.length / ITEMS_PER_PAGE);
  const currentItems = filteredNationalities.slice(
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
          Nationality List
        </Text>

        <Input
          placeholder="Search by Country or Nationality"
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
              <Th>Nationality</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Actions</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add nationality"
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
                    value={newNationality.country_name}
                    onChange={(e) =>
                      setNewNationality({
                        ...newNationality,
                        country_name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Nationality"
                    value={newNationality.nationality}
                    onChange={(e) =>
                      setNewNationality({
                        ...newNationality,
                        nationality: e.target.value,
                      })
                    }
                  />
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    <Button
                      onClick={handleAddOrEditNationality}
                      colorScheme="green"
                      size="sm"
                      mr={2}
                    >
                      {editingNationality ? "Save" : "Add"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setEditingNationality(null);
                        setNewNationality({
                          country_name: "",
                          nationality: "",
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
            {currentItems.map((nation, index) => (
              <Tr key={`${nation.id}-${index}`}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                <Td>{nation.country_name}</Td>
                <Td>{nation.nationality}</Td>
                <Td>
                  <Flex justify="flex-end">
                    <IconButton
                      icon={<EditIcon />}
                      onClick={() => handleEditNationality(nation)}
                      size="sm"
                      mr={2}
                      variant="ghost"
                      colorScheme="yellow"
                      aria-label="Edit nationality"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => setDeletingNationality(nation)}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Delete nationality"
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
        isOpen={!!deletingNationality}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingNationality(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Nationality
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "
              {deletingNationality?.country_name}"? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingNationality(null)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteNationality}
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

export default NationalityManagement;
