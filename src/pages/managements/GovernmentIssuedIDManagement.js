import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  VStack,
  HStack,
  useToast,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import axios from "axios";

const GovernmentIssuedIDManagement = () => {
  const [governmentIDs, setGovernmentIDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newGovernmentID, setNewGovernmentID] = useState({ name: "" });
  const [editingGovernmentID, setEditingGovernmentID] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchGovernmentIDs();
  }, []);

  // Fetch Government IDs
  const fetchGovernmentIDs = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/government-issued-ids`
      );
      setGovernmentIDs(response.data);
    } catch (error) {
      toast({
        title: "Error fetching government-issued IDs.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Add a New Government ID
  const handleAddGovernmentID = async () => {
    if (!newGovernmentID.name.trim()) {
      toast({
        title: "Field Required",
        description: "Please provide a government-issued ID name.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/government-issued-ids`,
        newGovernmentID
      );
      setGovernmentIDs((prev) => [...prev, response.data]);
      toast({
        title: "Government-issued ID added successfully.",
        status: "success",
        duration: 3000,
      });
      setNewGovernmentID({ name: "" });
      setIsAddingNew(false);
    } catch (error) {
      toast({
        title: "Error adding government-issued ID.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Edit an Existing Government ID
  const handleEditGovernmentID = async () => {
    if (!editingGovernmentID.name.trim()) {
      toast({
        title: "Field Required",
        description: "Please provide a government-issued ID name.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/government-issued-ids/${editingGovernmentID.id}`,
        { name: editingGovernmentID.name }
      );
      setGovernmentIDs((prev) =>
        prev.map((id) =>
          id.id === editingGovernmentID.id ? editingGovernmentID : id
        )
      );
      toast({
        title: "Government-issued ID updated successfully.",
        status: "success",
        duration: 3000,
      });
      setEditingGovernmentID(null);
    } catch (error) {
      toast({
        title: "Error updating government-issued ID.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Delete a Government ID
  const handleDeleteGovernmentID = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/government-issued-ids/${id}`
      );
      setGovernmentIDs((prev) => prev.filter((idData) => idData.id !== id));
      toast({
        title: "Government-issued ID deleted successfully.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting government-issued ID.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Filtered Results for Search
  const filteredGovernmentIDs = governmentIDs.filter((id) =>
    id.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Input
          placeholder="Search by Government-issued ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          mb={4}
        />
      </Flex>

      <Table variant="simple" size="lg">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Government Issued ID</Th>
            <Th>
              <Flex justify="space-between" align="center">
                <span>Actions</span>
                {!isAddingNew && !editingGovernmentID && (
                  <IconButton
                    icon={<AddIcon />}
                    onClick={() => setIsAddingNew(true)}
                    size="sm"
                    aria-label="Add Government ID"
                    variant="ghost"
                    _hover={{ bg: "gray.100" }}
                  />
                )}
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isAddingNew && (
            <Tr>
              <Td>—</Td>
              <Td>
                <Input
                  placeholder="Government Issued ID Name"
                  value={newGovernmentID.name}
                  onChange={(e) =>
                    setNewGovernmentID({
                      ...newGovernmentID,
                      name: e.target.value,
                    })
                  }
                />
              </Td>
              <Td>
                <HStack>
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={handleAddGovernmentID}
                  >
                    Add
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </Td>
            </Tr>
          )}
          {filteredGovernmentIDs.map((id, index) => (
            <Tr key={id.id}>
              <Td>{index + 1}</Td>
              <Td>
                {editingGovernmentID?.id === id.id ? (
                  <Input
                    value={editingGovernmentID.name}
                    onChange={(e) =>
                      setEditingGovernmentID({
                        ...editingGovernmentID,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  id.name
                )}
              </Td>
              <Td>
                <HStack>
                  {editingGovernmentID?.id === id.id ? (
                    <>
                      <IconButton
                        icon={<CheckIcon />}
                        colorScheme="green"
                        size="sm"
                        onClick={handleEditGovernmentID}
                      />
                      <IconButton
                        icon={<CloseIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => setEditingGovernmentID(null)}
                      />
                    </>
                  ) : (
                    <>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="yellow"
                        size="sm"
                        onClick={() => setEditingGovernmentID(id)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteGovernmentID(id.id)}
                      />
                    </>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default GovernmentIssuedIDManagement;
