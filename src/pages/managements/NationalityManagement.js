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

const NationalityManagement = () => {
  const [nationalities, setNationalities] = useState([]);
  const [newNationality, setNewNationality] = useState({
    country_name: "",
    nationality: "",
  });
  const toast = useToast();

  useEffect(() => {
    fetchNationalities();
  }, []);

  const fetchNationalities = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/nationalities`
      );
      setNationalities(response.data);
    } catch (error) {
      toast({
        title: "Error loading nationalities",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddNationality = async () => {
    try {
      await axios.post("/api/nationalities", newNationality);
      fetchNationalities();
      setNewNationality({ country_name: "", nationality: "" });
      toast({ title: "Nationality added", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error adding nationality",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteNationality = async (id) => {
    try {
      await axios.delete(`/api/nationalities/${id}`);
      fetchNationalities();
      toast({
        title: "Nationality deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting nationality",
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
            placeholder="Country Name"
            value={newNationality.country_name}
            onChange={(e) =>
              setNewNationality({
                ...newNationality,
                country_name: e.target.value,
              })
            }
            mr={2}
          />
          <Input
            placeholder="Nationality"
            value={newNationality.nationality}
            onChange={(e) =>
              setNewNationality({
                ...newNationality,
                nationality: e.target.value,
              })
            }
            mr={2}
          />
          <Button onClick={handleAddNationality} colorScheme="teal">
            Add Nationality
          </Button>
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Country Name</Th>
              <Th>Nationality</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {nationalities.map((nation) => (
              <Tr key={nation.id}>
                <Td>{nation.id}</Td>
                <Td>{nation.country_name}</Td>
                <Td>{nation.nationality}</Td>
                <Td>
                  <Button
                    onClick={() => handleDeleteNationality(nation.id)}
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

export default NationalityManagement;
