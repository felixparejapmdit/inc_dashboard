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

const CitizenshipManagement = () => {
  const [citizenships, setCitizenships] = useState([]);
  const [newCitizenship, setNewCitizenship] = useState({
    country_name: "",
    citizenship: "",
  });
  const [editingCitizenship, setEditingCitizenship] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchCitizenships();
  }, []);

  const fetchCitizenships = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/citizenships`
      );
      setCitizenships(response.data);
    } catch (error) {
      toast({
        title: "Error loading citizenships11",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddOrEditCitizenship = async () => {
    try {
      if (editingCitizenship) {
        await axios.put(
          `/api/citizenships/${editingCitizenship.id}`,
          newCitizenship
        );
        toast({
          title: "Citizenship updated",
          status: "success",
          duration: 3000,
        });
      } else {
        await axios.post("/api/citizenships", newCitizenship);
        toast({
          title: "Citizenship added",
          status: "success",
          duration: 3000,
        });
      }
      fetchCitizenships();
      setNewCitizenship({ country_name: "", citizenship: "" });
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
  };

  const handleDeleteCitizenship = async (id) => {
    try {
      await axios.delete(`/api/citizenships/${id}`);
      fetchCitizenships();
      toast({
        title: "Citizenship deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting citizenship",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex gap={2}>
          <Input
            placeholder="Country Name"
            value={newCitizenship.country_name}
            onChange={(e) =>
              setNewCitizenship({
                ...newCitizenship,
                country_name: e.target.value,
              })
            }
          />
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
          <Button onClick={handleAddOrEditCitizenship} colorScheme="teal">
            {editingCitizenship ? "Update" : "Add"} Citizenship
          </Button>
          {editingCitizenship && (
            <Button
              onClick={() => setEditingCitizenship(null)}
              colorScheme="gray"
            >
              Cancel
            </Button>
          )}
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Country Name</Th>
              <Th>Citizenship</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {citizenships.map((citizen) => (
              <Tr key={citizen.id}>
                <Td>{citizen.id}</Td>
                <Td>{citizen.country_name}</Td>
                <Td>{citizen.citizenship}</Td>
                <Td>
                  <Button
                    onClick={() => handleEditCitizenship(citizen)}
                    colorScheme="blue"
                    size="sm"
                    mr={2}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteCitizenship(citizen.id)}
                    colorScheme="red"
                    size="sm"
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

export default CitizenshipManagement;
