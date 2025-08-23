import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  Input,
  Stack,
  HStack,
  IconButton,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon} from '@chakra-ui/icons';
const AddShelfForm = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState("");

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
    onSave({ name });
    setName("");
  };

  const inputBg = useColorModeValue("gray.100", "gray.700");
  const inputFocusBorder = useColorModeValue("teal.400", "teal.300");
  const btnCancelHoverBg = useColorModeValue("gray.200", "gray.600");

  const formWidth = useBreakpointValue({ base: "100%", md: "320px" });
  const btnSize = useBreakpointValue({ base: "md", md: "lg" });

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={[4, 6]}
    >
      <Stack spacing={6} width={formWidth}>
        <FormControl isRequired>
          <Input
            placeholder="Enter shelf name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            bg={inputBg}
            size="lg"
            fontWeight="semibold"
            textAlign="center"
            borderRadius="md"
            boxShadow="sm"
            _hover={{ boxShadow: "md" }}
            _focus={{
              borderColor: inputFocusBorder,
              boxShadow: `0 0 0 3px ${inputFocusBorder}`,
            }}
            _placeholder={{
              color: "gray.400",
              fontWeight: "medium",
              textAlign: "center",
            }}
            autoFocus
            transition="box-shadow 0.3s ease"
          />
        </FormControl>

        <HStack
  spacing={6}
  justifyContent="center"
  flexWrap="wrap"
  width="100%"
  direction={{ base: "column", md: "row" }}
>
  <IconButton
    aria-label="Save Shelf"
    icon={<CheckIcon />}
    color="orange.700"
    border="2px solid"
    borderColor="orange.700"
    bg="transparent"
    size={btnSize}
    fontWeight="bold"
    minW={["100%", "60px"]}
    maxW={{ base: "100%", md: "60px" }}
    _hover={{
      bg: "orange.700",
      color: "white",
      boxShadow: "lg",
      transform: "scale(1.1)",
    }}
    transition="all 0.3s ease"
    flex={{ base: "unset", md: "1" }}
    type="submit"
  />

  <IconButton
    aria-label="Cancel"
    icon={<CloseIcon />}
    variant="outline"
    size={btnSize}
    minW={["100%", "60px"]}
    maxW={{ base: "100%", md: "60px" }}
    onClick={() => {
      if (onCancel) onCancel();
      setName("");
    }}
    _hover={{
      bg: useColorModeValue("gray.200", "gray.600"),
      transform: "scale(1.1)",
    }}
    transition="all 0.2s ease"
    flex={{ base: "unset", md: "1" }}
  />
</HStack>
      </Stack>
    </Box>
  );
};

export default AddShelfForm;
