// src/pages/FileOrganizer/DocumentCard.js
import React from "react";
import {
  Box,
  Text,
  HStack,
  IconButton,
  useColorModeValue,
  Tooltip,
  Flex,
  Icon,
  VStack,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { AiFillFileText } from "react-icons/ai";
import { QRCodeSVG } from "qrcode.react";

// Optional: Map document types to different icons
const getDocumentIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "pdf":
      return AiFillFileText; // Replace with AiFillFilePdf if installed
    case "word":
      return AiFillFileText; // Replace with AiFillFileWord if installed
    default:
      return AiFillFileText;
  }
};

const DocumentCard = ({ document, onDelete, onUpdate }) => {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const labelBg = useColorModeValue("green.100", "green.700");
  const labelColor = useColorModeValue("green.800", "green.100");

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="md"
      bg={bg}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
      w="full"
      maxW="220px"
      mx="auto"
      overflow="hidden"
    >
      {/* Header with icon depending on type */}
      <Flex
        bg={labelBg}
        px={3}
        py={2}
        align="center"
        gap={2}
        borderBottom="1px solid"
        borderColor={border}
      >
        <Icon as={getDocumentIcon(document.type)} boxSize={5} color={labelColor} />
        <Text
          fontWeight="semibold"
          fontSize="sm"
          color={labelColor}
          noOfLines={1}
          flex="1"
        >
          {document.name}
        </Text>
      </Flex>

      {/* Body */}
      <VStack spacing={3} px={3} py={3} align="stretch">
        {/* Description */}
        <Text fontSize="xs" color="gray.500" noOfLines={3}>
          {document.description || "No description available."}
        </Text>

        {/* QR Code + Actions in same row */}
        <HStack spacing={3} justify="center">
          {document.generated_code && (
            <Tooltip
              label={`Code: ${document.generated_code}`}
              placement="top"
              hasArrow
            >
              <Box
                border="1px solid"
                borderColor={border}
                borderRadius="md"
                p={2}
                bg="white"
                boxShadow="sm"
              >
                <QRCodeSVG value={document.generated_code} size={42} level="H" />
              </Box>
            </Tooltip>
          )}

          {/* Action Buttons */}
          <HStack spacing={1}>
            <Tooltip label="View File" hasArrow>
              <IconButton
                icon={<ViewIcon />}
                onClick={() => window.open(document.file_url, "_blank")}
                aria-label="View File"
                size="sm"
                colorScheme="blue"
                variant="ghost"
              />
            </Tooltip>
            <Tooltip label="Edit" hasArrow>
              <IconButton
                icon={<EditIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(document);
                }}
                aria-label="Edit"
                size="sm"
                variant="ghost"
              />
            </Tooltip>
            <Tooltip label="Delete" hasArrow>
              <IconButton
                icon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(document.id);
                }}
                aria-label="Delete"
                size="sm"
                colorScheme="red"
                variant="ghost"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
};

export default DocumentCard;
