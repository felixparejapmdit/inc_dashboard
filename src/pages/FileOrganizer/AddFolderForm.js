// src/pages/FileOrganizer/AddFolderForm.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";

const AddFolderForm = ({ onSave, editData, containerId }) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dataToSave = {
      ...editData,
      name,
      containerId,
    };

    onSave(dataToSave);
    setName("");
  };

  const formBg = useColorModeValue("white", "gray.800");

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
            bg="orange.50"
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
