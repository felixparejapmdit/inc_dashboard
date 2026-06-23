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
  HStack
} from "@chakra-ui/react";

const AddShelfForm = ({ initialData,onSave, onCancel }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputColor = useColorModeValue("gray.800", "white");
  const inputFocusBorder = useColorModeValue("teal.400", "teal.300");

  // Prefill when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dataToSave = {
      ...initialData,
      name,
      description,
    };

    onSave(dataToSave);
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      w="100%"
    >
      <Stack spacing={5}>
        <FormControl isRequired>
          <FormLabel fontWeight="semibold">Shelf Name</FormLabel>
          <Input
            placeholder="Enter shelf name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            bg={inputBg}
            color={inputColor}
            _focus={{
              borderColor: inputFocusBorder,
              boxShadow: `0 0 0 1px ${inputFocusBorder}`,
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontWeight="semibold">Description (optional)</FormLabel>
          <Textarea
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            bg={inputBg}
            color={inputColor}
            _focus={{
              borderColor: inputFocusBorder,
              boxShadow: `0 0 0 1px ${inputFocusBorder}`,
            }}
          />
        </FormControl>

        <HStack spacing={4}>
          <Button
            type="submit"
            colorScheme="teal"
            size="md"
            fontWeight="bold"
            flex="1"
          >
            {initialData ? "Update Shelf" : "Save Shelf"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            size="md"
            flex="1"
            display={onCancel ? "inline-flex" : "none"}
          >
            Cancel
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default AddShelfForm;
