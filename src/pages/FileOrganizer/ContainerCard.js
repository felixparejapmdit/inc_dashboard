// src/pages/FileOrganizer/ContainerCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Tooltip,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { QRCodeSVG } from "qrcode.react";
import { FaBoxOpen, FaFolder } from "react-icons/fa";

const ContainerCard = ({ container, onUpdate, onDelete, foldersCount = 0 }) => {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const labelBg = useColorModeValue("teal.100", "teal.700");
  const navigate = useNavigate();

  return (
    <Box
      position="relative"
      borderWidth="1px"
      borderColor={border}
      borderRadius="md"
      bg={bg}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: "md" }}
      w="full"
      maxW="230px"
      minH="140px"
      mx="auto"
      overflow="hidden"
      role="group"
      onClick={() => navigate(`/containers/${container.id}/folders`)}
      cursor="pointer"
    >
      {/* Header */}
      <Box
        bg={labelBg}
        px={3}
        py={2}
        borderBottom="1px solid"
        borderColor={border}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Icon as={FaBoxOpen} boxSize={4} color="teal.600" />
        <Text
          fontWeight="bold"
          fontSize="sm"
          color="teal.800"
          noOfLines={1}
          flex="1"
        >
          {container.name}
        </Text>
      </Box>

      {/* QR Code (Bottom Left) */}
      {container.generated_code && (
        <Box position="absolute" bottom={2} left={3}>
          {/* Folder Count */}
          <HStack spacing={1}>
            <Icon as={FaFolder} boxSize={3.5} color="gray.500" />
            <Text fontSize="xs" color="gray.500">
              {foldersCount} {foldersCount === 1 ? "folder" : "folders"}
            </Text>
          </HStack>
          <Tooltip label={`Code: ${container.generated_code}`} placement="top">
            <Flex
              justify="center"
              align="center"
              border="1px solid"
              borderColor={border}
              borderRadius="md"
              p={2}
              bg="white"
              boxShadow="sm"
            >
              <QRCodeSVG
                value={container.generated_code}
                size={48}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </Flex>
          </Tooltip>
        </Box>
      )}

      {/* Action Buttons – Bottom right */}
      <HStack
        spacing={2}
        position="absolute"
        bottom={2}
        right={2}
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.2s"
        zIndex={1}
      >
        <Tooltip label="Edit">
          <IconButton
            size="sm"
            icon={<EditIcon />}
              onClick={(e) => {
              e.stopPropagation();
              onUpdate(container.id, container);
            }}
            aria-label="Edit"
          />
        </Tooltip>
        <Tooltip label="Delete">
          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            onClick={() => onDelete(container.id)}
            aria-label="Delete"
            colorScheme="red"
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default ContainerCard;
