import React, { useState, useEffect } from "react";
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
  Avatar,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

const DistrictManagement = () => {
  const [districts, setDistricts] = useState([]);
  const [newDistrict, setNewDistrict] = useState({ name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/districts`
      );
      setDistricts(response.data);
    } catch (error) {
      toast({
        title: "Error loading districts",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddDistrict = async () => {
    if (!newDistrict.name) {
      toast({
        title: "District name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/districts`,
        newDistrict
      );
      fetchDistricts();
      setNewDistrict({ name: "" });
      setIsAdding(false);
      toast({
        title: "District added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding district",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateDistrict = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/districts/${editingDistrict.id}`,
        editingDistrict
      );
      fetchDistricts();
      setEditingDistrict(null);
      toast({
        title: "District updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating district",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteDistrict = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/districts/${id}`
      );
      fetchDistricts();
      toast({
        title: "District deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting district",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          District List
        </Text>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>District Name</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Actions</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add district"
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
                    placeholder="Type District Name"
                    value={newDistrict.name}
                    onChange={(e) =>
                      setNewDistrict({
                        ...newDistrict,
                        name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    <Button
                      onClick={handleAddDistrict}
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
            {districts.map((district) => (
              <Tr key={district.id}>
                <Td>
                  {editingDistrict && editingDistrict.id === district.id ? (
                    <Input
                      value={editingDistrict.name}
                      onChange={(e) =>
                        setEditingDistrict({
                          ...editingDistrict,
                          name: e.target.value,
                        })
                      }
                      autoFocus
                    />
                  ) : (
                    <Flex align="center">
                      <Avatar name={district.name} size="sm" mr={3} />
                      <Text>{district.name}</Text>
                    </Flex>
                  )}
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    {editingDistrict && editingDistrict.id === district.id ? (
                      <>
                        <Button
                          onClick={handleUpdateDistrict}
                          colorScheme="green"
                          size="sm"
                          mr={2}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingDistrict(null)}
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
                          onClick={() => setEditingDistrict(district)}
                          size="sm"
                          mr={2}
                          variant="ghost"
                          colorScheme="yellow"
                          aria-label="Edit district"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => handleDeleteDistrict(district.id)}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete district"
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
    </Box>
  );
};

export default DistrictManagement;
