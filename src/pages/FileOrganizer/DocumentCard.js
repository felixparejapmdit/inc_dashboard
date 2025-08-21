// src/pages/FileOrganizer/DocumentCard.js
import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  Flex,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  AiFillFileText,
  AiFillFilePdf,
  AiFillFileWord,
  AiFillFileExcel,
  AiFillFileImage,
} from "react-icons/ai";

import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";

// Map document types to icons + colors
const getDocumentIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "pdf":
      return { icon: AiFillFilePdf, color: "red.500" };
    case "word":
    case "doc":
    case "docx":
      return { icon: AiFillFileWord, color: "blue.500" };
    case "excel":
    case "xls":
    case "xlsx":
      return { icon: AiFillFileExcel, color: "green.500" };
    case "image":
    case "jpg":
    case "png":
      return { icon: AiFillFileImage, color: "yellow.500" };
    default:
      return { icon: AiFillFileText, color: "gray.500" };
  }
};

const DocumentCard = ({ document, onDelete, onUpdate }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const descColor = useColorModeValue("gray.600", "gray.300");

  const { icon, color } = getDocumentIcon(document.file_url?.split('.').pop());

  const openFile = () => {
    if (document?.file_url) {
      window.open(document.file_url, "_blank", "noopener,noreferrer");
    }
  };

  const openQR = () => setIsQRModalOpen(true);
  const confirmDelete = () => setIsDeleteOpen(true);

  return (
    <>
      <Box
        position="relative"
        borderWidth="1px"
        borderColor={border}
        borderRadius="md"
        bg={bg}
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
        w="full"
        maxW="240px"
        mx="auto"
        overflow="hidden"
        minH="140px"
      >
        {/* Folded corner effect */}
        <Box
          position="absolute"
          top="0"
          right="0"
          w="0"
          h="0"
          borderTop="32px solid"
          borderLeft="32px solid transparent"
          borderTopColor={useColorModeValue("gray.100", "gray.700")}
        />

        {/* Header */}
        <Flex
          px={3}
          py={2}
          align="center"
          gap={2}
          borderBottom="1px solid"
          borderColor={border}
        >
          <Icon as={icon} boxSize={6} color={color} />
          <Text
            fontWeight="semibold"
            fontSize="sm"
            noOfLines={1}
            flex="1"
            title={document.name}
          >
            {document.name}
          </Text>

          {/* Global menu (all actions handled here) */}
          <GlobalMenuButton
            onView={openFile}
            onEdit={() => onUpdate(document)}
            onDelete={confirmDelete}
            onGenerateQr={openQR}
            onShowQr={openQR}
            generatedCode={document.generated_code}
            itemType="document"
          />
        </Flex>

        {/* Body */}
        <VStack spacing={3} px={3} py={3} align="stretch" minH="60px">
          <Text fontSize="xs" color={descColor} noOfLines={3}>
            {document.description || "No description available."}
          </Text>
        </VStack>
      </Box>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => onDelete(document.id)}
        title="Delete Document"
        description={`Are you sure you want to delete "${document.name}"? This action cannot be undone.`}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        value={String(document.id)}
        code={document.generated_code}
        title={document.name}
      />
    </>
  );
};

export default DocumentCard;
