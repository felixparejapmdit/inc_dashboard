import React from "react";
import {
  Box,
  Text,
  HStack,
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
   minHeight = 220
}) => {
  const navigate = useNavigate();

  // Shelf wood gradient + optional texture
  const shelfBg = useColorModeValue(
    "linear-gradient(135deg, #f9e7d2, #e3c8a6)",
    "linear-gradient(135deg, #3a2f23, #5a4633)"
  );
  const shelfTexture = useColorModeValue(
    "url('/textures/light-wood.png')",
    "url('/textures/dark-wood.png')"
  );

  const labelBg = useColorModeValue("orange.300", "orange.600");
  const textColor = useColorModeValue("orange.900", "orange.100");
  const plankColor = useColorModeValue("#d6a66e", "#4a3525");
  const containerBg = useColorModeValue("white", "gray.700");
  const containerText = useColorModeValue("gray.700", "gray.200");

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
    <Box position="relative" mb={10}>
      <Box
        borderRadius="xl"
        bg={shelfBg}
        backgroundImage={shelfTexture}
        backgroundBlendMode="overlay"
        backgroundSize="cover"
        boxShadow="lg"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ boxShadow: "xl", transform: "translateY(-2px)" }}
        onClick={handleCardClick}
        overflow="hidden"
        position="relative"
        minH={`${minHeight}px`}
        pb={6} // give space for the plank
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
          borderRadius="md"
          boxShadow="sm"
          zIndex={2}
        >
          <Text fontWeight="bold" fontSize="sm" color={textColor} noOfLines={1}>
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
          />
        </Box>

        {/* Container section */}
        <Box
          p={4}
          pt={12}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minH={`${minHeight}px`}
          boxShadow="inset 0 2px 6px rgba(0,0,0,0.25)"
        >
          {containers && containers.length > 0 ? (
            <>
              <HStack spacing={3} wrap="wrap" justify="center">
                {containers.slice(0, 3).map((container) => (
                  <Box
                    key={container.id}
                    px={3}
                    py={2}
                    borderRadius="md"
                    bg={containerBg}
                    color={containerText}
                    boxShadow="sm"
                    fontSize="xs"
                    noOfLines={1}
                    title={container.name}
                  >
                    📦 {container.name}
                  </Box>
                ))}
              </HStack>
              {containers.length > 3 && (
                <Text
                  fontSize="xs"
                  color="gray.500"
                  fontWeight="medium"
                  mt={2}
                  textAlign="center"
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
        </Box>

        {/* Plank (tight under the card) */}
        <Box
          position="absolute"
          bottom={0}
          left={4}
          right={4}
          height="10px"
          bg={plankColor}
          borderRadius="full"
          boxShadow="0 3px 6px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.3)"
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
