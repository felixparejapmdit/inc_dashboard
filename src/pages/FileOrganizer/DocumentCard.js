// src/pages/FileOrganizer/DocumentCard.js
import React, { useState } from "react";
import {
  Badge,
  Box,
  Divider,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  AiFillFileExcel,
  AiFillFileImage,
  AiFillFilePdf,
  AiFillFileText,
  AiFillFileWord,
} from "react-icons/ai";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";
import { resolveApiBaseUrl, joinUrl } from "../../utils/urlResolvers";

const getDocumentIcon = (type = "") => {
  const value = type.toLowerCase();
  if (value.includes("pdf")) return { icon: AiFillFilePdf, color: "red.500", label: "PDF" };
  if (value.includes("word") || value.includes("doc")) return { icon: AiFillFileWord, color: "blue.500", label: "DOC" };
  if (value.includes("excel") || value.includes("xls")) return { icon: AiFillFileExcel, color: "green.500", label: "XLS" };
  if (value.includes("image") || ["jpg", "jpeg", "png", "webp"].includes(value)) {
    return { icon: AiFillFileImage, color: "yellow.500", label: "IMG" };
  }
  return { icon: AiFillFileText, color: "gray.500", label: value ? value.toUpperCase() : "FILE" };
};

const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return "";
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  return joinUrl(resolveApiBaseUrl(), fileUrl);
};

const getExtension = (document) => {
  const source = document.type || document.file_url || document.name || "";
  return String(source).split(/[/.]/).pop();
};

const formatDate = (value) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const splitTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const DocumentCard = ({ document, onDelete, onUpdate, onView }) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const panelBg = useColorModeValue("gray.50", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  const fileUrl = resolveFileUrl(document.file_url);
  const fileType = getDocumentIcon(document.type || getExtension(document));
  const tags = splitTags(document.tags);

  const openFile = () => {
    if (onView) {
      onView(document);
      return;
    }

    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const downloadFile = () => {
    if (!fileUrl) return;
    const link = window.document.createElement("a");
    link.href = fileUrl;
    link.download = document.file_name || document.name || "document";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  return (
    <>
      <Box
        bg={bg}
        border="1px solid"
        borderColor={border}
        borderRadius="2xl"
        boxShadow="0 16px 38px rgba(15, 23, 42, 0.08)"
        minH="220px"
        overflow="hidden"
        transition="all 0.2s ease"
        w="100%"
        _hover={{
          boxShadow: "0 22px 48px rgba(15, 23, 42, 0.14)",
          transform: "translateY(-3px)",
        }}
      >
        <Flex align="flex-start" justify="space-between" gap={3} p={5}>
          <HStack align="flex-start" minW={0} spacing={3}>
            <Flex
              align="center"
              bg={panelBg}
              border="1px solid"
              borderColor={border}
              borderRadius="xl"
              h="48px"
              justify="center"
              w="48px"
            >
              <Icon as={fileType.icon} boxSize={7} color={fileType.color} />
            </Flex>
            <Box minW={0}>
              <Text color={textColor} fontSize="md" fontWeight="800" noOfLines={2}>
                {document.name}
              </Text>
              <Text color={mutedText} fontSize="sm" mt={1}>
                Added {formatDate(document.created_at || document.date_added)}
              </Text>
            </Box>
          </HStack>

          <GlobalMenuButton
            itemType="document"
            generatedCode={document.generated_code}
            onView={openFile}
            onDownload={downloadFile}
            onEdit={() => onUpdate?.(document)}
            onDelete={() => setIsDeleteOpen(true)}
            onGenerateQr={() => setIsQRModalOpen(true)}
            onShowQr={() => setIsQRModalOpen(true)}
          />
        </Flex>

        <Divider borderColor={border} />

        <VStack align="stretch" bg={panelBg} minH="112px" p={5} spacing={3}>
          <Text color={mutedText} fontSize="sm" noOfLines={3}>
            {document.description || "No description added."}
          </Text>

          <HStack flexWrap="wrap" spacing={2}>
            <Badge borderRadius="full" colorScheme="gray" px={3} py={1}>
              {fileType.label}
            </Badge>
            {document.generated_code && (
              <Badge borderRadius="full" colorScheme="teal" px={3} py={1}>
                {document.generated_code}
              </Badge>
            )}
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} borderRadius="full" colorScheme="blue" px={3} py={1}>
                {tag}
              </Badge>
            ))}
          </HStack>
        </VStack>
      </Box>

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          onDelete?.(document.id);
          setIsDeleteOpen(false);
        }}
        title="Delete Document"
        description={`Are you sure you want to delete "${document.name}"? This action cannot be undone.`}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        code={document.generated_code || String(document.id)}
        title={`QR Code for ${document.name}`}
        name={document.name}
      />
    </>
  );
};

export default DocumentCard;
