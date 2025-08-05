// src/pages/FileOrganizer/AddShelfForm.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";

const AddShelfForm = ({ onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, description });
    setName("");
    setDescription("");
  };

  return (
    <Box as="form" onSubmit={handleSubmit} mt={4}>
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Shelf Name</FormLabel>
          <Input
            placeholder="Enter shelf name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description (optional)</FormLabel>
          <Input
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>

        <Button type="submit" colorScheme="teal">
          Save
        </Button>
      </Stack>
    </Box>
  );
};

export default AddShelfForm;
