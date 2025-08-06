import React from "react";
import {
  Box,
  Text,
  Flex,
  IconButton,
  Tooltip,
  HStack,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaWarehouse } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ShelfCard = ({ shelf, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const labelBg = useColorModeValue("orange.100", "orange.300");
  const labelColor = useColorModeValue("orange.800", "orange.900");

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
      cursor="pointer"
      onClick={handleCardClick}
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
        <Icon as={FaWarehouse} boxSize={4} color="orange.600" />
        <Text
          fontWeight="bold"
          fontSize="sm"
          color={labelColor}
          noOfLines={1}
          flex="1"
        >
          {shelf.name}
        </Text>
      </Box>

      {/* Body (empty for now) */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        px={4}
        py={5}
        textAlign="center"
      >
        {/* You can add shelf.description or other details here if needed */}
      </Flex>

      {/* QR Code (Bottom Left) */}
      {shelf.generated_code && (
        <Box position="absolute" bottom={2} left={2}>
          <Tooltip label={`Code: ${shelf.generated_code}`} placement="top">
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
                value={shelf.generated_code}
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
      </HStack>
    </Box>
  );
};

export default ShelfCard;
