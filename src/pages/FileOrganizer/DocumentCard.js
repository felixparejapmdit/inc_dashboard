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
  Badge,
  VStack,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { AiFillFileText } from "react-icons/ai";
import { QRCodeSVG } from "qrcode.react";

const DocumentCard = ({ document, onDelete, onUpdate }) => {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const labelBg = useColorModeValue("green.100", "green.700");

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="md"
      bg={bg}
      boxShadow="base"
      transition="all 0.2s"
      _hover={{ boxShadow: "md" }}
      w="full"
      maxW="200px"
      mx="auto"
      overflow="hidden"
      role="group"
    >
      {/* Header */}
      <Flex
        bg={labelBg}
        px={2}
        py={1}
        align="center"
        gap={2}
        borderBottom="1px solid"
        borderColor={border}
      >
        <Icon as={AiFillFileText} boxSize={4} color="green.600" />
        <Text
          fontWeight="semibold"
          fontSize="sm"
          color="green.800"
          noOfLines={1}
          flex="1"
        >
          {document.name}
        </Text>
      </Flex>

      {/* Body */}
      <VStack spacing={2} px={3} py={3} align="stretch">
        <Text fontSize="xs" color="gray.500" noOfLines={2}>
          {document.description}
        </Text>

        <Badge
          fontSize="0.65em"
          colorScheme="blue"
          variant="subtle"
          w="fit-content"
        >
          {document.type}
        </Badge>

        {/* Centered QR Code */}
        {document.generated_code && (
          <Flex justify="center">
            <Tooltip label={`Code: ${document.generated_code}`} placement="top">
              <Box
                border="1px solid"
                borderColor={border}
                borderRadius="md"
                p={1}
                bg="white"
                boxShadow="sm"
              >
                <QRCodeSVG
                  value={document.generated_code}
                  size={42}
                  level="H"
                />
              </Box>
            </Tooltip>
          </Flex>
        )}

        {/* Action Buttons */}
        <HStack justify="center" spacing={1} pt={2}>
          <Tooltip label="View File">
            <IconButton
              icon={<ViewIcon />}
              onClick={() => window.open(document.file_url, "_blank")}
              aria-label="View File"
              size="xs"
              colorScheme="blue"
              variant="ghost"
            />
          </Tooltip>
          <Tooltip label="Edit">
            <IconButton
              icon={<EditIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(document);
              }}
              aria-label="Edit"
              size="xs"
              variant="ghost"
            />
          </Tooltip>
          <Tooltip label="Delete">
            <IconButton
              icon={<DeleteIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document.id);
              }}
              aria-label="Delete"
              size="xs"
              colorScheme="red"
              variant="ghost"
            />
          </Tooltip>
        </HStack>
      </VStack>
    </Box>
  );
};

export default DocumentCard;
