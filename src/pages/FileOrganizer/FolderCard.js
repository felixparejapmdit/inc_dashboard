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
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaFolder } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { QRCodeSVG } from "qrcode.react";

const FolderCard = ({ folder, shelfId, containerId, onDelete, onUpdate }) => {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const labelBg = useColorModeValue("blue.100", "blue.700");
  const codeColor = useColorModeValue("gray.600", "gray.400");
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
        <Icon as={FaFolder} boxSize={4} color="blue.600" />
        <Text
          fontWeight="bold"
          fontSize="sm"
          color="blue.800"
          noOfLines={1}
          flex="1"
        >
          {folder.name}
        </Text>
      </Box>

      {/* Body */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        px={4}
        py={5}
        cursor="pointer"
        onClick={() =>
          navigate(
            `/shelves/${shelfId}/containers/${containerId}/folders/${folder.id}/documents`
          )
        }
      >
        {folder.description && (
          <Text
            fontSize="xs"
            color="gray.500"
            noOfLines={2}
            textAlign="center"
            px={1}
          >
            {folder.description}
          </Text>
        )}
      </Flex>

      {/* QR Code (Bottom Left) */}
      {folder.generated_code && (
        <Box position="absolute" bottom={2} left={2}>
          <Tooltip label={`Code: ${folder.generated_code}`} placement="top">
            <Flex
              justify="center"
              align="center"
              border="1px solid"
              borderColor={border}
              borderRadius="md"
              p={1}
              bg="white"
              boxShadow="sm"
            >
              <QRCodeSVG
                value={folder.generated_code}
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

      {/* Action Buttons (Bottom Right) */}
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
              onUpdate(folder);
            }}
            aria-label="Edit"
          />
        </Tooltip>
        <Tooltip label="Delete">
          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder.id);
            }}
            aria-label="Delete"
            colorScheme="red"
          />
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default FolderCard;
