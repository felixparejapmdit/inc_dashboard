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
} from "@chakra-ui/react";
import axios from "axios";

const DistrictManagement = () => {
  const [districts, setDistricts] = useState([]);
  const [newDistrict, setNewDistrict] = useState({ name: "" });
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
    try {
      await axios.post("/api/districts", newDistrict);
      fetchDistricts();
      setNewDistrict({ name: "" });
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
      await axios.put(`/api/districts/${editingDistrict.id}`, editingDistrict);
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
      await axios.delete(`/api/districts/${id}`);
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
        <Flex>
          <Input
            placeholder="District Name"
            value={newDistrict.name}
            onChange={(e) =>
              setNewDistrict({ ...newDistrict, name: e.target.value })
            }
            mr={2}
          />
          <Button onClick={handleAddDistrict} colorScheme="blue">
            Add District
          </Button>
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
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
                    />
                  ) : (
                    district.name
                  )}
                </Td>
                <Td>
                  {editingDistrict && editingDistrict.id === district.id ? (
                    <Button
                      onClick={handleUpdateDistrict}
                      colorScheme="green"
                      mr={2}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingDistrict(district)}
                      colorScheme="yellow"
                      mr={2}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteDistrict(district.id)}
                    colorScheme="red"
                  >
                    Delete
                  </Button>
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
