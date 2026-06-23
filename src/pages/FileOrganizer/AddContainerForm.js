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

  const inputBg = useColorModeValue("orange.50", "gray.700");

  // Prefill when editing
  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setDescription(editData.description || "");
    } else {
      setName("");
      setDescription("");
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

    // reset only if adding a new one
    if (!editData) {
      setName("");
      setDescription("");
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      w="100%"
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

        <Button type="submit" colorScheme="orange" size="md" fontWeight="bold">
          {editData ? "Update Container" : "Save Container"}
        </Button>
      </Stack>
    </Box>
  );
};

export default AddContainerForm;
