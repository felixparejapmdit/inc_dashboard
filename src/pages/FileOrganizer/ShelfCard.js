// src/pages/FileOrganizer/ShelfCard.js
import React from "react";
import {
  Box,
  Text,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const ShelfCard = ({ shelf, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("orange.700", "orange.200");

  const handleCardClick = (e) => {
    const isButton = e.target.closest("button");
    if (!isButton) {
      navigate(`/file-organizer/shelves/${shelf.id}/containers`);
    }
  };

  return (
    <Box
      position="relative"
      borderWidth="1px"
      borderColor={border}
      borderRadius="xl"
      bg={bg}
      boxShadow="md"
      transition="all 0.2s"
      _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
      w="full"
      aspectRatio={1}
      maxW="200px"
      mx="auto"
      overflow="hidden"
      role="group"
      cursor="pointer"
      onClick={handleCardClick}
      p={4}
    >
      {/* Centered Shelf Name */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        h="100%"
        gap={4}
      >
        <Text
          fontWeight="bold"
          fontSize="md"
          color={textColor}
          noOfLines={2}
        >
          {shelf.name}
        </Text>
      </Flex>

      {/* QR Code - always visible at bottom left */}
      {shelf.generated_code && (
        <Box position="absolute" bottom={2} left={2}>
          <Tooltip label={`Code: ${shelf.generated_code}`} placement="top">
            <Box
              border="1px solid"
              borderColor={border}
              borderRadius="md"
              p={1}
              bg="white"
              boxShadow="sm"
            >
              <QRCodeSVG
                value={shelf.generated_code}
                size={36}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </Box>
          </Tooltip>
        </Box>
      )}

      {/* Edit/Delete Buttons - bottom right on hover */}
      <Flex
        position="absolute"
        bottom={2}
        right={2}
        gap={2}
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.2s"
        zIndex={1}
      >
        <Tooltip label="Edit Shelf">
          <IconButton
            size="sm"
            icon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit Shelf"
          />
        </Tooltip>
        <Tooltip label="Delete Shelf">
          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete Shelf"
            colorScheme="red"
          />
        </Tooltip>
      </Flex>
    </Box>
  );
};

export default ShelfCard;
