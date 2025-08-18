import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  VStack,
  Flex,
  Divider,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaFolder } from "react-icons/fa";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";

const ContainerCard = ({ container, folders = [], onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Theme colors
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("teal.600", "teal.300");
  const footerBg = useColorModeValue("gray.50", "gray.700");
  const folderBg = useColorModeValue("gray.100", "gray.700");
  const folderHoverBg = useColorModeValue("gray.200", "gray.600");
  const folderTextColor = useColorModeValue("gray.700", "gray.300");

  const handleCardClick = (e) => {
    if (!e.target.closest("button")) {
      navigate(`/containers/${container.id}/folders`);
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        borderColor={border}
        borderRadius="xl"
        bg={bg}
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
        cursor="pointer"
        onClick={handleCardClick}
        display="flex"
        flexDirection="column"
        h="100%"
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

        {/* Footer / Shelf Section */}
        <Flex
          bg={footerBg}
          p={3}
          borderTop="1px solid"
          borderColor={border}
          flex="1"
          direction="column"
          justify="space-between"
        >
          {/* Global Menu Button */}
          <Flex justify="flex-end" mb={2}>
            <GlobalMenuButton
              onEdit={() => onUpdate(container)}
              onDelete={() => setIsDeleteOpen(true)} // Only open DeleteConfirmModal
              onGenerateQr={() => setIsQROpen(true)}
            />
          </Flex>

          <Divider my={1} />

          {/* Folder Shelf Preview */}
          <VStack spacing={1} align="stretch" flex="1" overflow="hidden" mt={2} px={1}>
            {folders && folders.length > 0 ? (
              <>
                {folders.slice(0, 3).map((folder) => (
                  <Flex
                    key={folder.id}
                    align="center"
                    gap={2}
                    p={1}
                    bg={folderBg}
                    borderRadius="md"
                    _hover={{ bg: folderHoverBg }}
                  >
                    <Icon as={FaFolder} boxSize={4} color="gray.500" />
                    <Text
                      fontSize="sm"
                      color={folderTextColor}
                      noOfLines={1}
                      flex="1"
                      title={folder.name}
                    >
                      {folder.name}
                    </Text>
                  </Flex>
                ))}
                {folders.length > 3 && (
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" textAlign="right">
                    +{folders.length - 3} more
                  </Text>
                )}
              </>
            ) : (
              <Text fontSize="sm" color="gray.400" fontStyle="italic" textAlign="center">
                No folders yet
              </Text>
            )}
          </VStack>
        </Flex>
      </Box>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        value={container.id.toString()}
        title={container.name}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          onDelete && onDelete(container.id);
          setIsDeleteOpen(false);
        }}
        title="Delete Container"
        description={`Are you sure you want to delete "${container.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default ContainerCard;
