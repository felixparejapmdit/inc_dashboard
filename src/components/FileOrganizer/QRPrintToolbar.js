import React from "react";
import {
  Badge,
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const QRPrintToolbar = ({
  category,
  setCategory,
  search,
  setSearch,
  totalItems = 0,
  selectableItems = 0,
  selectedCount = 0,
}) => {
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  return (
    <Flex
      align={{ base: "stretch", lg: "end" }}
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
      direction={{ base: "column", lg: "row" }}
      gap={4}
      p={{ base: 4, md: 5 }}
    >
      <FormControl maxW={{ base: "100%", lg: "240px" }}>
        <FormLabel color={labelColor} fontSize="sm" fontWeight="800">
          QR category
        </FormLabel>
        <Select
          borderRadius="xl"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="Shelves">Shelves</option>
          <option value="Containers">Containers</option>
          <option value="Folders">Folders</option>
          <option value="Documents">Documents</option>
        </Select>
      </FormControl>

      <FormControl flex="1">
        <FormLabel color={labelColor} fontSize="sm" fontWeight="800">
          Search
        </FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            borderRadius="xl"
            placeholder="Search by name or QR code"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
      </FormControl>

      <Box minW={{ base: "100%", lg: "260px" }}>
        <Text color={labelColor} fontSize="sm" fontWeight="800" mb={2}>
          Current list
        </Text>
        <HStack flexWrap="wrap" spacing={2}>
          <Badge borderRadius="full" colorScheme="gray" px={3} py={1}>
            {totalItems} shown
          </Badge>
          <Badge borderRadius="full" colorScheme="teal" px={3} py={1}>
            {selectableItems} printable
          </Badge>
          <Badge borderRadius="full" colorScheme="blue" px={3} py={1}>
            {selectedCount} selected
          </Badge>
        </HStack>
        <Text color={mutedText} fontSize="xs" mt={2}>
          Items without a generated code cannot be printed.
        </Text>
      </Box>
    </Flex>
  );
};

export default QRPrintToolbar;
