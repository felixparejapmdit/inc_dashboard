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

const LanguagesManagement = () => {
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState({ name: "", code: "" });
  const toast = useToast();

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/languages`
      );
      setLanguages(response.data);
    } catch (error) {
      toast({
        title: "Error loading languages",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddLanguage = async () => {
    try {
      await axios.post("/api/languages", newLanguage);
      fetchLanguages();
      setNewLanguage({ name: "", code: "" });
      toast({ title: "Language added", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error adding language",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteLanguage = async (id) => {
    try {
      await axios.delete(`/api/languages/${id}`);
      fetchLanguages();
      toast({ title: "Language deleted", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error deleting language",
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
            placeholder="Language Name"
            value={newLanguage.name}
            onChange={(e) =>
              setNewLanguage({ ...newLanguage, name: e.target.value })
            }
            mr={2}
          />
          <Input
            placeholder="Language Code"
            value={newLanguage.code}
            onChange={(e) =>
              setNewLanguage({ ...newLanguage, code: e.target.value })
            }
            mr={2}
          />
          <Button onClick={handleAddLanguage} colorScheme="teal">
            Add Language
          </Button>
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Code</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {languages.map((language) => (
              <Tr key={language.id}>
                <Td>{language.id}</Td>
                <Td>{language.name}</Td>
                <Td>{language.code}</Td>
                <Td>
                  <Button
                    onClick={() => handleDeleteLanguage(language.id)}
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

export default LanguagesManagement;
