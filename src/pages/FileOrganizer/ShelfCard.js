// src/pages/FileOrganizer/ShelfCard.js
import React from "react";
import {
  Box,
  Text,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

const ShelfCard = ({ shelf, containers = [], onEdit, onDelete }) => {
  const navigate = useNavigate();
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("orange.700", "orange.200"); // 🔹 Keep original shelf.name color
  const footerBg = useColorModeValue("gray.50", "gray.700");

  const handleCardClick = (e) => {
    const isButton = e.target.closest("button");
    if (!isButton) {
      navigate(`/file-organizer/shelves/${shelf.id}/containers`);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="xl"
      bg={bg}
      boxShadow="md"
      transition="all 0.2s"
      _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
      cursor="pointer"
      onClick={handleCardClick}
      display="flex"
      flexDirection="column"
      h="100%" // 🔹 Allow equal height in grid
    >
      {/* Title Section */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        p={4}
        minH="100px"
        maxH="100px"
        flexShrink={0}
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

      {/* Footer Section */}
      <Flex
        bg={footerBg}
        p={3}
        borderTop="1px solid"
        borderColor={border}
        flex="1"
        direction="column"
        justify="space-between"
      >
        {/* QR & Actions */}
        <Flex justify="space-between" align="center">
          {shelf.generated_code ? (
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
                  size={48}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </Box>
            </Tooltip>
          ) : (
            <Box w="48px" />
          )}

          <Flex gap={2}>
            <Tooltip label="Edit Shelf">
              <IconButton
                size="sm"
                icon={<EditIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Edit Shelf"
                variant="outline"
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
                variant="outline"
              />
            </Tooltip>
          </Flex>
        </Flex>

        <Divider my={2} />

        {/* Container Preview */}
        <VStack spacing={1} align="stretch" flex="1" overflow="hidden">
          {containers && containers.length > 0 ? (
            <>
              {containers.slice(0, 3).map((container) => (
                <Text
                  key={container.id}
                  fontSize="xs"
                  color="gray.600"
                  noOfLines={1}
                  title={container.name}
                >
                  📦 {container.name}
                </Text>
              ))}
              {containers.length > 3 && (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontWeight="medium"
                  textAlign="right"
                >
                  +{containers.length - 3} more
                </Text>
              )}
            </>
          ) : (
            <Text
              fontSize="xs"
              color="gray.400"
              fontStyle="italic"
              textAlign="center"
            >
              No containers yet
            </Text>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

export default ShelfCard;
