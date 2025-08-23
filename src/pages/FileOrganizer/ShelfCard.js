import React, { useState } from "react";
import {
  Box,
  Text,
  HStack,
  Tag,
  useColorModeValue,
  useDisclosure,
  VStack,
  Flex,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Button
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import { BsBoxSeam } from "react-icons/bs";

const ShelfCard = ({
  shelf,
  containers = [],
  onEdit,
  onDelete,
  onGenerateQR,
}) => {
  const navigate = useNavigate();

  // State to manage the card's background color
  const defaultCardColor = useColorModeValue("white", "gray.700");
  const [cardColor, setCardColor] = useState(shelf.color || defaultCardColor);

  // Theme colors
  const cardBorderColor = useColorModeValue("gray.300", "gray.600");
  const shelfNameBg = useColorModeValue("gray.200", "gray.700");
  const shelfNameColor = useColorModeValue("gray.800", "gray.100");
  const containerTagBg = useColorModeValue("gray.100", "gray.600");
  const containerTagText = useColorModeValue("gray.700", "gray.200");
  const moreTagBg = useColorModeValue("gray.200", "gray.600");
  const moreTagText = useColorModeValue("gray.600", "gray.300");
  const emptyStateColor = useColorModeValue("gray.400", "gray.500");
  // FIX: Call useColorModeValue at the top level
  const buttonTextColor = useColorModeValue("black", "white");

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
  
  // New disclosure for the color modal
  const {
    isOpen: isColorModalOpen,
    onOpen: onColorModalOpen,
    onClose: onColorModalClose,
  } = useDisclosure();

  const colors = [
    { name: "White", value: "white" },
    { name: "Gray", value: "gray.200" },
    { name: "Teal", value: "teal.200" },
    { name: "Red", value: "red.200" },
    { name: "Blue", value: "blue.200" },
    { name: "Yellow", value: "yellow.200" },
  ];

  const handleCardClick = (e) => {
    const isButton = e.target.closest("button,[role=menuitem]");
    if (!isButton) {
      navigate(`/file-organizer/shelves/${shelf.id}/containers`);
    }
  };

  const handleColorChange = (newColor) => {
    setCardColor(newColor);
    onColorModalClose();
    // You would also need to call a service to update the color in the backend
    console.log(`Updating shelf ${shelf.name} to color ${newColor}`);
  };

  return (
    <Box position="relative">
      <Box
        borderRadius="xl"
        border="1px solid"
        borderColor={cardBorderColor}
        bg={cardColor}
        boxShadow="md"
        cursor="pointer"
        transition="all 0.25s"
        _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
        onClick={handleCardClick}
        minH="220px"
        display="flex"
        flexDirection="column"
        position="relative"
      >
        {/* Shelf Name and Menu */}
        <Flex
          px={4}
          py={2}
          bg={shelfNameBg}
          borderTopRadius="xl"
          justify="space-between"
          align="center"
          position="relative"
        >
          <Text
            fontWeight="bold"
            fontSize="md"
            color={shelfNameColor}
            noOfLines={1}
            flex="1"
          >
            {shelf.name}
          </Text>

          <Box
            position="absolute"
            top="50%"
            right={2}
            transform="translateY(-50%)"
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
              onColorChange={onColorModalOpen} // This now opens the modal
              generatedCode={shelf.generated_code}
              type="shelf"
            />
          </Box>
        </Flex>

        {/* Containers preview */}
        <VStack
          flex="1"
          p={4}
          justify="center"
          align="center"
          spacing={3}
          textAlign="center"
        >
          {containers && containers.length > 0 ? (
            <VStack spacing={2}>
              <HStack spacing={2} wrap="wrap" justify="center">
                {containers.slice(0, 3).map((container) => (
                  <Tag
                    key={container.id}
                    size="md"
                    px={3}
                    py={1.5}
                    borderRadius="lg"
                    bg={containerTagBg}
                    color={containerTagText}
                    noOfLines={1}
                    title={container.name}
                  >
                    <HStack>
                      <Icon as={BsBoxSeam} />
                      <Text>{container.name}</Text>
                    </HStack>
                  </Tag>
                ))}
              </HStack>
              {containers.length > 3 && (
                <Text
                  fontSize="sm"
                  color={moreTagText}
                  bg={moreTagBg}
                  px={2}
                  py={1}
                  borderRadius="full"
                  fontWeight="medium"
                  mt={2}
                >
                  +{containers.length - 3} more
                </Text>
              )}
            </VStack>
          ) : (
            <VStack spacing={2} color={emptyStateColor}>
              <Icon as={BsBoxSeam} boxSize="2em" />
              <Text fontSize="sm" fontStyle="italic">
                No containers yet
              </Text>
            </VStack>
          )}
        </VStack>

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

      {/* Color Picker Modal */}
      <Modal isOpen={isColorModalOpen} onClose={onColorModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Shelf Color</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={3} spacing={4}>
              {colors.map((color) => (
                <Button
                  key={color.name}
                  bg={color.value}
                  color={buttonTextColor}
                  onClick={() => handleColorChange(color.value)}
                  border="1px solid"
                  borderColor="gray.300"
                  boxShadow={color.value === cardColor ? "0 0 0 3px teal" : "none"}
                >
                  {color.name}
                </Button>
              ))}
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ShelfCard;
