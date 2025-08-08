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

const AddFolderForm = ({ onSave, editData, containerId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const inputBg = useColorModeValue("orange.50", "gray.700");
  const formBg = useColorModeValue("white", "gray.800");

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
      name,
      description,
      container_id: parseInt(containerId),
      ...(editData?.id && { id: editData.id }), // include id if editing
    };

    onSave(dataToSave);

    // Optionally reset form after save
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
      maxW="400px"
      mx="auto"
    >
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Folder Name</FormLabel>
          <Input
            placeholder="Enter folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            bg={inputBg}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            bg={inputBg}
          />
        </FormControl>

        <Button type="submit" colorScheme="teal">
          {editData ? "Update Folder" : "Save Folder"}
        </Button>
      </Stack>
    </Box>
  );
};

export default AddFolderForm;
