import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  FaFileAlt,
  FaFileArchive,
  FaFileExcel,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaFolder,
} from "react-icons/fa";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";

const getFileIcon = (filename = "") => {
  const ext = String(filename).split(".").pop().toLowerCase();
  if (ext === "pdf") return { icon: FaFilePdf, color: "red.500" };
  if (["doc", "docx"].includes(ext)) return { icon: FaFileWord, color: "blue.500" };
  if (["xls", "xlsx"].includes(ext)) return { icon: FaFileExcel, color: "green.500" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return { icon: FaFileImage, color: "yellow.500" };
  if (["zip", "rar", "7z"].includes(ext)) return { icon: FaFileArchive, color: "purple.500" };
  return { icon: FaFileAlt, color: "gray.500" };
};

const FolderCard = ({
  folder,
  shelfId,
  containerId,
  documents = [],
  onDelete,
  onUpdate,
  onClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const panelBg = useColorModeValue("yellow.50", "gray.900");
  const border = useColorModeValue("yellow.200", "gray.700");
  const strongBorder = useColorModeValue("yellow.400", "yellow.500");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const accent = useColorModeValue("yellow.600", "yellow.300");

  const handleCardClick = (event) => {
    if (event.target.closest("button,[role=menuitem]")) return;

    if (location.pathname.includes("/file-organizer/tree")) {
      onClick?.(folder);
      return;
    }

    navigate(`/shelves/${shelfId}/containers/${containerId}/folders/${folder.id}/documents`);
  };

  return (
    <>
      <Box
        bg={bg}
        border="1px solid"
        borderColor={border}
        borderRadius="2xl"
        boxShadow="0 16px 38px rgba(113, 63, 18, 0.08)"
        cursor="pointer"
        h="100%"
        minH="245px"
        onClick={handleCardClick}
        overflow="hidden"
        position="relative"
        transition="all 0.2s ease"
        _hover={{
          borderColor: strongBorder,
          boxShadow: "0 22px 48px rgba(113, 63, 18, 0.16)",
          transform: "translateY(-3px)",
        }}
      >
        <Box bg={accent} borderTopRadius="2xl" h="14px" ml={5} mt={0} w="42%" />

        <Flex align="flex-start" justify="space-between" gap={3} p={5} pt={4} pb={4}>
          <HStack align="flex-start" minW={0} spacing={3}>
            <Flex
              align="center"
              bg={panelBg}
              border="1px solid"
              borderColor={border}
              borderRadius="xl"
              h="46px"
              justify="center"
              w="46px"
            >
              <Icon as={FaFolder} boxSize={6} color={accent} />
            </Flex>
            <Box minW={0}>
              <Text color={textColor} fontSize="lg" fontWeight="800" noOfLines={1}>
                {folder.name}
              </Text>
              <Text color={mutedText} fontSize="sm" mt={1} noOfLines={2}>
                {folder.description || "A folder for related documents."}
              </Text>
            </Box>
          </HStack>

          <Box onClick={(event) => event.stopPropagation()}>
            <GlobalMenuButton
              itemType="folder"
              generatedCode={folder.generated_code}
              onEdit={() => onUpdate?.(folder)}
              onDelete={() => setIsDeleteOpen(true)}
              onGenerateQr={() => setIsQROpen(true)}
              onShowQr={() => setIsQROpen(true)}
            />
          </Box>
        </Flex>

        <HStack px={5} pb={4}>
          <Badge borderRadius="full" colorScheme="yellow" px={3} py={1}>
            {documents.length} document{documents.length === 1 ? "" : "s"}
          </Badge>
          {folder.generated_code && (
            <Badge borderRadius="full" colorScheme="gray" px={3} py={1}>
              {folder.generated_code}
            </Badge>
          )}
        </HStack>

        <Divider borderColor={border} />

        <VStack align="stretch" bg={panelBg} minH="108px" p={5} spacing={2}>
          {documents.length > 0 ? (
            <>
              {documents.slice(0, 3).map((document) => {
                const fileIcon = getFileIcon(document.file_url || document.name);
                return (
                  <Flex key={document.id} align="center" gap={2}>
                    <Icon as={fileIcon.icon} color={fileIcon.color} />
                    <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                      {document.name}
                    </Text>
                  </Flex>
                );
              })}
              {documents.length > 3 && (
                <Text color={mutedText} fontSize="sm" fontWeight="600" textAlign="right">
                  +{documents.length - 3} more documents
                </Text>
              )}
            </>
          ) : (
            <Flex
              align="center"
              border="1px dashed"
              borderColor={border}
              borderRadius="xl"
              color={mutedText}
              direction="column"
              gap={2}
              justify="center"
              minH="84px"
              textAlign="center"
            >
              <Icon as={FaFileAlt} boxSize={6} />
              <Text fontSize="sm">No documents yet</Text>
            </Flex>
          )}
        </VStack>
      </Box>

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        code={folder.generated_code || String(folder.id)}
        title={`QR Code for ${folder.name}`}
        name={folder.name}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          onDelete?.(folder.id);
          setIsDeleteOpen(false);
        }}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folder.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default FolderCard;
