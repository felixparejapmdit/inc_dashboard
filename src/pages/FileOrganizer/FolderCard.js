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
import {
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaFolder,
} from "react-icons/fa";
import { motion } from "framer-motion";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";

const MotionFlex = motion(Flex);
const MotionVStack = motion(VStack);

const FolderCard = ({
  folder,
  shelfId,
  containerId,
  documents = [],
  onDelete,
  onUpdate,
}) => {
  const navigate = useNavigate();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Theming
  const cardBg = useColorModeValue("white", "gray.700");
  const cardBorder = useColorModeValue("gray.200", "gray.600");
  const folderHeaderBg = useColorModeValue("yellow.400", "yellow.600");
  const folderTabBg = useColorModeValue("yellow.500", "yellow.700");
  const docSectionBg = useColorModeValue("gray.50", "gray.800");
  const nameColor = useColorModeValue("gray.800", "white");
  const docColor = useColorModeValue("gray.600", "gray.300");
  const emptyColor = useColorModeValue("gray.400", "gray.500");

  const handleCardClick = (e) => {
    if (!e.target.closest("button")) {
      navigate(
        `/shelves/${shelfId}/containers/${containerId}/folders/${folder.id}/documents`
      );
    }
  };

  // --- FIX APPLIED HERE ---
  // Pick icon based on file extension, with a safety check
  const getFileIcon = (filename) => {
    if (!filename || typeof filename !== 'string') {
      return <FaFileAlt color="#4A5568" />;
    }
    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <FaFilePdf color="#E53E3E" />;
      case "doc":
      case "docx":
        return <FaFileWord color="#3182CE" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel color="#38A169" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FaFileImage color="#D69E2E" />;
      case "zip":
      case "rar":
        return <FaFileArchive color="#805AD5" />;
      default:
        return <FaFileAlt color="#4A5568" />;
    }
  };
  // --- END OF FIX ---

  return (
    <>
      <Box
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="xl"
        bg={cardBg}
        boxShadow="md"
        transition="all 0.2s"
        _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
        cursor="pointer"
        onClick={handleCardClick}
        display="flex"
        flexDirection="column"
        h="100%"
        position="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Folder tab */}
        <Box
          bg={folderTabBg}
          w="40%"
          h="20px"
          borderTopRadius="md"
          ml={4}
          mt={-2}
          zIndex={2}
        />

        {/* Folder header (lid effect) */}
        <MotionFlex
          bg={folderHeaderBg}
          p={3}
          borderTopRadius="xl"
          align="center"
          justify="center"
          flexShrink={0}
          position="relative"
          style={{ transformOrigin: "bottom center" }}
          animate={{ rotateX: isHovered ? 25 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <Box position="absolute" top={2} right={2} zIndex={3}>
            <GlobalMenuButton
              onEdit={() => onUpdate(folder)}
              onDelete={() => setIsDeleteOpen(true)}
              onGenerateQr={() => setIsQROpen(true)}
              itemType="folder"
            />
          </Box>
          <Flex align="center" gap={2}>
            <Icon as={FaFolder} boxSize={5} color="gray.700" />
            <Text
              fontWeight="bold"
              fontSize="md"
              color={nameColor}
              noOfLines={1}
              textAlign="center"
              px={2}
            >
              {folder.name}
            </Text>
          </Flex>
        </MotionFlex>

        <Divider borderColor={cardBorder} />

        {/* Document preview reveal */}
        <MotionVStack
          bg={docSectionBg}
          p={4}
          spacing={2}
          flex="1"
          align="stretch"
          borderBottomRadius="xl"
          overflow="hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: isHovered ? "auto" : 0,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {documents && documents.length > 0 ? (
            <>
              {documents.slice(0, 3).map((doc) => (
                <Flex key={doc.id} align="center" gap={2}>
                  <Icon boxSize={4}>{getFileIcon(doc.file_url)}</Icon>
                  <Text
                    fontSize="sm"
                    color={docColor}
                    noOfLines={1}
                    flex="1"
                    title={doc.name}
                  >
                    {doc.name}
                  </Text>
                </Flex>
              ))}
              {documents.length > 3 && (
                <Text
                  fontSize="xs"
                  color={emptyColor}
                  fontWeight="medium"
                  textAlign="right"
                >
                  +{documents.length - 3} more
                </Text>
              )}
            </>
          ) : (
            <Flex
              align="center"
              justify="center"
              h="100%"
              minH="80px"
              direction="column"
              gap={2}
            >
              <Icon as={FaFileAlt} boxSize={8} color={emptyColor} opacity={0.5} />
              <Text
                fontSize="sm"
                color={emptyColor}
                fontStyle="italic"
                textAlign="center"
              >
                No documents yet
              </Text>
            </Flex>
          )}
        </MotionVStack>
      </Box>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        value={folder.id.toString()}
        code={folder.generated_code}
        title={folder.name}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          onDelete && onDelete(folder.id);
          setIsDeleteOpen(false);
        }}
        title="Delete Folder"
        description={`Are you sure you want to delete "${folder.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default FolderCard;
