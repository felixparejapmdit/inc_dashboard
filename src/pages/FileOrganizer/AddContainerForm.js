// src/pages/FileOrganizer/AddContainerForm.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

const AddContainerForm = ({ onSave, editData }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const formBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("1px solid #E2E8F0", "1px solid #4A5568");
  const inputBg = useColorModeValue("orange.50", "orange.100");

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setDescription(editData.description || "");
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dataToSave = {
      ...editData,
      name,
      description,
    };

    onSave(dataToSave);
    setName("");
    setDescription("");
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      mt={4}
      p={6}
      borderRadius="lg"
      bg={formBg}
      boxShadow="lg"
      border={border}
      maxW="400px"
      mx="auto"
    >
      <Stack spacing={5}>
        <FormControl isRequired>
          <FormLabel fontWeight="semibold">Container Name</FormLabel>
          <Input
            placeholder="Enter container name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            bg={inputBg}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold">Description (optional)</FormLabel>
          <Textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            bg={inputBg}
          />
        </FormControl>

        <Button type="submit" colorScheme="teal" size="md" fontWeight="bold">
          {editData ? "Update Container" : "Save Container"}
        </Button>
      </Stack>
    </Box>
  );
};

export default AddContainerForm;
