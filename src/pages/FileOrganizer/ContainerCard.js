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
  Icon,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { QRCodeSVG } from "qrcode.react";
import { FaFolder } from "react-icons/fa";

const ContainerCard = ({ container, folders = [], onUpdate, onDelete }) => {
  const navigate = useNavigate();

  // Theme colors
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("teal.600", "teal.300");
  const footerBg = useColorModeValue("gray.50", "gray.700");

  const handleCardClick = (e) => {
    const isButton = e.target.closest("button");
    if (!isButton) {
      navigate(`/containers/${container.id}/folders`);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      bg={bg}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
      cursor="pointer"
      onClick={handleCardClick}
      display="flex"
      flexDirection="column"
      h="100%" // 🔹 Let the grid decide the equal height
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
          fontSize="lg"
          color={textColor}
          noOfLines={2}
          textAlign="center"
        >
          {container.name}
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
          {container.generated_code ? (
            <Tooltip label={`Code: ${container.generated_code}`} placement="top">
              <Box
                border="1px solid"
                borderColor={border}
                borderRadius="md"
                p={1}
                bg="white"
                boxShadow="sm"
              >
                <QRCodeSVG
                  value={container.generated_code}
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

          <HStack spacing={2}>
            <Tooltip label="Edit">
              <IconButton
                size="sm"
                icon={<EditIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate && onUpdate(container.id, container);
                }}
                aria-label="Edit"
                variant="outline"
              />
            </Tooltip>
            <Tooltip label="Delete">
              <IconButton
                size="sm"
                icon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(container.id);
                }}
                aria-label="Delete"
                colorScheme="red"
                variant="outline"
              />
            </Tooltip>
          </HStack>
        </Flex>

        <Divider my={2} />

        {/* Folder Preview */}
        <VStack spacing={1} align="stretch" flex="1" overflow="hidden">
          {folders && folders.length > 0 ? (
            <>
              {folders.slice(0, 3).map((folder) => (
                <Flex key={folder.id} align="center" gap={2}>
                  <Icon as={FaFolder} boxSize={3.5} color="gray.500" />
                  <Text
                    fontSize="xs"
                    color="gray.600"
                    noOfLines={1}
                    flex="1"
                    title={folder.name}
                  >
                    {folder.name}
                  </Text>
                </Flex>
              ))}
              {folders.length > 3 && (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontWeight="medium"
                  textAlign="right"
                >
                  +{folders.length - 3} more
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
              No folders yet
            </Text>
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

export default ContainerCard;
