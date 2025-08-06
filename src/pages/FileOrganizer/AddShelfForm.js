import React, { useState, useEffect } from "react";
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

const AddShelfForm = ({ initialData, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, description });
    setName("");
    setDescription("");
  };

  const formBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("1px solid #E2E8F0", "1px solid #4A5568");
  const inputBg = useColorModeValue("orange.50", "orange.100");

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
          <FormLabel fontWeight="semibold">Shelf Name</FormLabel>
          <Input
            placeholder="Enter shelf name"
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
          Save Shelf
        </Button>
      </Stack>
    </Box>
  );
};

export default AddShelfForm;
