import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from "@chakra-ui/react";

const API_URL = process.env.REACT_APP_API_URL;

const DragDropSettings = () => {
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);
  const toast = useToast();

  // Fetch setting from API
  useEffect(() => {
    fetch(`${API_URL}/api/settings/drag-drop`)
      .then((res) => res.json())
      .then((data) => {
        setIsDragDropEnabled(data.enableDragDropMobile);
      })
      .catch((error) => console.error("Error fetching setting:", error));
  }, []);

  // Update setting in API
  const handleToggle = async () => {
    const newValue = !isDragDropEnabled;
    setIsDragDropEnabled(newValue);

    try {
      const response = await fetch(`${API_URL}/api/settings/drag-drop`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enableDragDropMobile: newValue }),
      });

      if (!response.ok) throw new Error("Failed to update setting");

      toast({
        title: "Updated!",
        description: `Drag & Drop is now ${
          newValue ? "Enabled" : "Disabled"
        } on Mobile.`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting.",
        status: "error",
        duration: 3000,
      });
    }
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
