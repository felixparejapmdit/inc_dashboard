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

  const formBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("1px solid #E2E8F0", "1px solid #4A5568");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputColor = useColorModeValue("gray.800", "white");
  const inputFocusBorder = useColorModeValue("teal.400", "teal.300");

  // Prefill when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName("");
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
          >
            Cancel
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default AddShelfForm;
