import React from "react";
import {
  Box,
  Text,
  HStack,
  Tag,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";

const ShelfCard = ({
  shelf,
  containers = [],
  onEdit,
  onDelete,
  onGenerateQR,
  minHeight = 220,
}) => {
  const navigate = useNavigate();

  // Theme colors
  const shelfBg = useColorModeValue("#fdfdfc", "gray.800");
  const labelBg = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.900", "gray.100");
  const containerBg = useColorModeValue("gray.50", "gray.700");
  const containerText = useColorModeValue("gray.700", "gray.200");
  const moreTagBg = useColorModeValue("gray.200", "gray.600");

  const [deleteTarget, setDeleteTarget] = React.useState(null);

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isQrOpen,
    onOpen: onQrOpen,
    onClose: onQrClose,
  } = useDisclosure();

  const handleCardClick = (e) => {
    const isButton = e.target.closest("button,[role=menuitem]");
    if (!isButton) {
      navigate(`/file-organizer/shelves/${shelf.id}/containers`);
    }
  };

  return (
    <Box position="relative" mb={14}>
      <Box
        borderRadius="xl"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        bg={shelfBg}
        boxShadow="sm"
        cursor="pointer"
        transition="all 0.25s"
        _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
        onClick={handleCardClick}
        overflow="hidden"
        position="relative"
        minH={`${minHeight}px`}
        pb={10} // space for plank
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
      >
        {/* Shelf label */}
        <Box
          position="absolute"
          top={2}
          left="50%"
          transform="translateX(-50%)"
          bg={labelBg}
          px={4}
          py={1}
          borderRadius="full"
          boxShadow="md"
          zIndex={2}
        >
          <Text fontWeight="semibold" fontSize="sm" color={textColor} noOfLines={1}>
            {shelf.name}
          </Text>
        </Box>

        {/* Menu Button */}
        <Box
          position="absolute"
          top={2}
          left={2}
          zIndex={3}
          onClick={(e) => e.stopPropagation()}
        >
          <GlobalMenuButton
            onEdit={() => onEdit()}
            onDelete={() => {
              setDeleteTarget(shelf);
              onDeleteOpen();
            }}
            onShowQr={onQrOpen}
            onGenerateQr={() => onGenerateQR(shelf)}
            generatedCode={shelf.generated_code}
            type="shelf"
          />
        </Box>

        {/* Containers */}
        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          px={4}
          pt={12}
          pb={6}
        >
          {containers && containers.length > 0 ? (
            <>
              <HStack spacing={2} wrap="wrap" justify="center" gap={2}>
                {containers.slice(0, 3).map((container) => (
                  <Box
                    key={container.id}
                    px={3}
                    py={1.5}
                    borderRadius="lg"
                    bg={containerBg}
                    color={containerText}
                    boxShadow="sm"
                    fontSize="xs"
                    fontWeight="medium"
                    noOfLines={1}
                    title={container.name}
                  >
                    📦 {container.name}
                  </Box>
                ))}
              </HStack>
              {containers.length > 3 && (
                <Tag
                  size="sm"
                  mt={2}
                  bg={moreTagBg}
                  color={textColor}
                  borderRadius="full"
                >
                  +{containers.length - 3} more
                </Tag>
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
        </Box>

        {/* Wooden plank */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="16px"
          borderTopRadius="sm"
          bgGradient="linear(to-r, gray.200, gray.300, gray.400, gray.200)"
          backgroundSize="200% 100%"
          backgroundPosition="center"
          filter="contrast(115%) brightness(100%)"
          boxShadow="inset 0 2px 4px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)"
        />
      </Box>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQrOpen}
        onClose={onQrClose}
        title={`QR Code for ${shelf.name}`}
        code={shelf.generated_code}
        name={shelf.name}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title="Delete Shelf"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={() => {
          onDelete(deleteTarget);
          onDeleteClose();
        }}
      />
    </Box>
  );
};

export default ShelfCard;
