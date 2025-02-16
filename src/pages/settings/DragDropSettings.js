import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  VStack,
} from "@chakra-ui/react";

const DragDropSettings = () => {
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);

  // Load the setting from localStorage when the component mounts
  useEffect(() => {
    const storedValue = localStorage.getItem("enableDragDropMobile");
    setIsDragDropEnabled(storedValue === "true");
  }, []);

  // Function to toggle drag & drop setting
  const handleToggle = () => {
    const newValue = !isDragDropEnabled;
    setIsDragDropEnabled(newValue);
    localStorage.setItem("enableDragDropMobile", newValue.toString());
  };

  return (
    <Box p={6} maxW="500px" mx="auto">
      <Heading as="h2" size="lg" mb={4}>
        Drag & Drop Settings
      </Heading>
      <VStack align="start" spacing={4}>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Enable Drag & Drop on Mobile</FormLabel>
          <Switch isChecked={isDragDropEnabled} onChange={handleToggle} />
        </FormControl>
      </VStack>
    </Box>
  );
};

export default DragDropSettings;
