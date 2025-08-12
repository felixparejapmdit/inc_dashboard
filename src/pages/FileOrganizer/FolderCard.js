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

const FolderCard = ({
  folder,
  shelfId,
  containerId,
  documents = [],
  onDelete,
  onUpdate,
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const codeBg = useColorModeValue("gray.50", "gray.700");
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(
      `/shelves/${shelfId}/containers/${containerId}/folders/${folder.id}/documents`
    );
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
      _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
      w="full"
      maxW="230px"
      minH="230px"
      mx="auto"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      onClick={handleCardClick}
    >
      {/* Folder Info Section */}
      <Flex
        px={4}
        py={4}
        align="center"
        gap={2}
        justify="center"
        textAlign="center"
        minH="70px"
      >
        <Icon as={FaFolder} boxSize={5} color="blue.600" flexShrink={0} />
        <Text
          fontWeight="bold"
          fontSize="md"
          color={useColorModeValue("blue.800", "blue.200")}
          noOfLines={2}
          flex="1"
        >
          {folder.name}
        </Text>
      </Flex>

      {/* QR Code + Action Buttons */}
      <Flex
        px={3}
        py={2}
        borderTop="1px solid"
        borderColor={border}
        alignItems="center"
        justifyContent="space-between"
        bg={codeBg}
        flexShrink={0}
      >
        {folder.generated_code && (
          <Tooltip label={`Code: ${folder.generated_code}`} placement="top">
            <Box
              border="1px solid"
              borderColor={border}
              borderRadius="md"
              p={1}
              bg="white"
              boxShadow="sm"
              flexShrink={0}
              onClick={(e) => e.stopPropagation()} // prevent navigation
            >
              <QRCodeSVG
                value={folder.generated_code}
                size={40}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </Box>
          </Tooltip>
        )}

        <HStack spacing={2} onClick={(e) => e.stopPropagation()}>
          <Tooltip label="Edit">
            <IconButton
              size="sm"
              icon={<EditIcon />}
              onClick={() => onUpdate(folder)}
              aria-label="Edit"
            />
          </Tooltip>
          <Tooltip label="Delete">
            <IconButton
              size="sm"
              icon={<DeleteIcon />}
              onClick={() => onDelete(folder.id)}
              aria-label="Delete"
              colorScheme="red"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Documents Preview */}
      <Box
        px={3}
        py={2}
        maxH="80px"
        w="full"
        borderTop="1px solid"
        borderColor={border}
        flexShrink={0}
      >
        {documents && documents.length > 0 ? (
          <>
            {documents.slice(0, 3).map((doc) => (
              <Text
                key={doc.id}
                fontSize="xs"
                color="gray.600"
                noOfLines={1}
                title={doc.name}
              >
                📄 {doc.name}
              </Text>
            ))}
            {documents.length > 3 && (
              <Text fontSize="xs" color="gray.500" textAlign="right">
                +{documents.length - 3} more
              </Text>
            )}
          </>
        ) : (
          <Text
            fontSize="xs"
            color="gray.400"
            textAlign="center"
            fontStyle="italic"
          >
            No documents yet
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default FolderCard;
