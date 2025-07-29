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

import {
  fetchData,
  postData,
  putData,
  deleteData,
  putSetting,
  fetchSetting,
} from "../../utils/fetchData";

const DragDropSettings = () => {
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);
  const toast = useToast();

  const fetchSetting = () => {
    fetchData(
      "settings/drag-drop",
      (data) => {
        if (typeof data.enableDragDropMobile === "boolean") {
          setIsDragDropEnabled(data.enableDragDropMobile);
        }
      },
      (err) =>
        toast({
          title: "Error fetching setting",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch drag & drop setting"
    );
  };

  // ✅ Fetch current setting
  useEffect(() => {
    fetchSetting();
  }, [toast]);

  // ✅ Update setting using putSetting
  const handleToggle = async () => {
    const newValue = !isDragDropEnabled;
    setIsDragDropEnabled(newValue);

    try {
      await putSetting("settings/drag-drop", {
        enableDragDropMobile: newValue,
      });

      toast({
        title: "Updated!",
        description: `Drag & Drop is now ${
          newValue ? "Enabled" : "Disabled"
        } on Mobile.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating setting:", error.message);

      toast({
        title: "Error",
        description: "Failed to update Drag & Drop setting.",
        status: "error",
        duration: 3000,
        isClosable: true,
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
