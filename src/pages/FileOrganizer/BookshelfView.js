import React from "react";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import ShelfCard from "./ShelfCard";

const BookshelfView = ({ shelves = [], onEditShelf, onDeleteShelf }) => {
  const plankColor = useColorModeValue("orange.200", "gray.600");
  const rowBg = useColorModeValue("gray.50", "gray.800");

  // Group shelves into rows of 3 (you can adjust this)
  const shelvesPerRow = 3;
  const rows = [];
  for (let i = 0; i < shelves.length; i += shelvesPerRow) {
    rows.push(shelves.slice(i, i + shelvesPerRow));
  }

  return (
    <Box w="100%">
      {rows.map((row, idx) => (
        <Box key={idx} mb={10} position="relative">
          {/* Plank under entire row */}
          <Box
            position="absolute"
            bottom={-4}
            left={0}
            right={0}
            height="8px"
            bg={plankColor}
            borderRadius="full"
          />

          {/* Shelf row */}
          <Flex gap={6} wrap="nowrap" justify="flex-start" bg={rowBg} p={4} borderRadius="lg">
            {row.map((shelf) => (
              <ShelfCard
                key={shelf.id}
                shelf={shelf}
                containers={shelf.containers || []}
                onEdit={() => onEditShelf(shelf)}
                onDelete={() => onDeleteShelf(shelf)}
              />
            ))}
          </Flex>
        </Box>
      ))}

      {shelves.length === 0 && (
        <Text textAlign="center" color="gray.500" fontStyle="italic" mt={10}>
          No shelves available
        </Text>
      )}
    </Box>
  );
};

export default BookshelfView;
