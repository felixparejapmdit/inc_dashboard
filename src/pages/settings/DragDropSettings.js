import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Card,
  CardBody,
  Text,
} from "@chakra-ui/react";

import {
  fetchData,
  putSetting,
} from "../../utils/fetchData";

const DragDropSettings = () => {
  const [isDragDropEnabled, setIsDragDropEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch current setting
  const loadSettings = async () => {
    setLoading(true);
    try {
      await fetchData(
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
            isClosable: true,
          }),
        "Failed to fetch drag & drop setting"
      );
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update setting using putSetting
  const handleToggle = async () => {
    const newValue = !isDragDropEnabled;
    setIsDragDropEnabled(newValue);

    try {
      await putSetting("settings/drag-drop", {
        enableDragDropMobile: newValue,
      });

      toast({
        title: "Updated!",
        description: `Drag & Drop is now ${newValue ? "Enabled" : "Disabled"
          } on Mobile.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating setting:", error.message);

      // Revert the toggle on error
      setIsDragDropEnabled(!newValue);

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
    <Box p={6}>
      <VStack spacing={6} align="stretch" maxW="600px">
        <Heading as="h2" size="lg" color="gray.700">
          Drag & Drop Settings
        </Heading>

        <Card variant="outline" boxShadow="sm">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <FormLabel mb="1" fontWeight="semibold">
                    Enable Drag & Drop on Mobile
                  </FormLabel>
                  <Text fontSize="sm" color="gray.600">
                    Allow users to reorder items using drag and drop on mobile devices
                  </Text>
                </Box>
                <Switch
                  isChecked={isDragDropEnabled}
                  onChange={handleToggle}
                  isDisabled={loading}
                  size="lg"
                  colorScheme="blue"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default DragDropSettings;
