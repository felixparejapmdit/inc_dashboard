import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BsBoxSeam } from "react-icons/bs";
import { FaLayerGroup } from "react-icons/fa";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";

const colors = [
  { name: "Teal", value: "#0f766e" },
  { name: "Blue", value: "#2563eb" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#be123c" },
  { name: "Slate", value: "#475569" },
  { name: "Green", value: "#15803d" },
];

const ShelfCard = ({
  shelf,
  containers = [],
  onEdit,
  onDelete,
  onGenerateQR,
}) => {
  const navigate = useNavigate();
  const [accentColor, setAccentColor] = useState(shelf.color || "#0f766e");
  const [deleteTarget, setDeleteTarget] = useState(null);

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
  const {
    isOpen: isColorModalOpen,
    onOpen: onColorModalOpen,
    onClose: onColorModalClose,
  } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const openShelf = () => {
    navigate(`/file-organizer/shelves/${shelf.id}/containers`);
  };

  const handleCardClick = (event) => {
    if (!event.target.closest("button,[role=menuitem]")) {
      openShelf();
    }
  };

  const handleColorChange = (newColor) => {
    setAccentColor(newColor);
    onColorModalClose();
  };

  return (
    <Box position="relative">
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        boxShadow="0 18px 45px rgba(15, 23, 42, 0.08)"
        cursor="pointer"
        minH="260px"
        overflow="hidden"
        onClick={handleCardClick}
        transition="all 0.2s ease"
        _hover={{
          borderColor: accentColor,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.14)",
          transform: "translateY(-3px)",
        }}
      >
        <Box h="8px" bg={accentColor} />

        <Flex align="flex-start" justify="space-between" gap={4} p={5} pb={3}>
          <HStack align="flex-start" spacing={3} minW={0}>
            <Flex
              align="center"
              bg={mutedBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              h="44px"
              justify="center"
              w="44px"
            >
              <Icon as={FaLayerGroup} color={accentColor} boxSize={5} />
            </Flex>
            <Box minW={0}>
              <Text
                color={headingColor}
                fontSize="lg"
                fontWeight="800"
                lineHeight="1.2"
                noOfLines={1}
                title={shelf.name}
              >
                {shelf.name}
              </Text>
              <Text color={mutedText} fontSize="sm" noOfLines={2} mt={1}>
                {shelf.description || "A shelf for related containers and records."}
              </Text>
            </Box>
          </HStack>

          <Box onClick={(event) => event.stopPropagation()}>
            <GlobalMenuButton
              itemType="shelf"
              generatedCode={shelf.generated_code}
              onEdit={() => onEdit?.()}
              onDelete={() => {
                setDeleteTarget(shelf);
                onDeleteOpen();
              }}
              onShowQr={onQrOpen}
              onGenerateQr={() => onGenerateQR?.(shelf)}
              onColorChange={onColorModalOpen}
            />
          </Box>
        </Flex>

        <HStack px={5} pb={4} spacing={2}>
          <Badge borderRadius="full" colorScheme="teal" px={3} py={1}>
            {containers.length} container{containers.length === 1 ? "" : "s"}
          </Badge>
          {shelf.generated_code && (
            <Badge borderRadius="full" colorScheme="gray" px={3} py={1}>
              {shelf.generated_code}
            </Badge>
          )}
        </HStack>

        <Divider borderColor={borderColor} />

        <VStack align="stretch" p={5} spacing={3}>
          <Text color={mutedText} fontSize="xs" fontWeight="700" textTransform="uppercase">
            Container preview
          </Text>

          {containers.length > 0 ? (
            <VStack align="stretch" spacing={2}>
              {containers.slice(0, 3).map((container) => (
                <Flex
                  key={container.id}
                  align="center"
                  bg={mutedBg}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  gap={2}
                  px={3}
                  py={2}
                >
                  <Icon as={BsBoxSeam} color={accentColor} />
                  <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                    {container.name}
                  </Text>
                </Flex>
              ))}
              {containers.length > 3 && (
                <Text color={mutedText} fontSize="sm" fontWeight="600">
                  +{containers.length - 3} more containers
                </Text>
              )}
            </VStack>
          ) : (
            <Flex
              align="center"
              bg={mutedBg}
              border="1px dashed"
              borderColor={borderColor}
              borderRadius="xl"
              color={mutedText}
              direction="column"
              gap={2}
              justify="center"
              minH="92px"
              textAlign="center"
            >
              <Icon as={BsBoxSeam} boxSize={6} />
              <Text fontSize="sm">No containers yet</Text>
            </Flex>
          )}
        </VStack>
      </Box>

      <QRCodeModal
        isOpen={isQrOpen}
        onClose={onQrClose}
        title={`QR Code for ${shelf.name}`}
        code={shelf.generated_code}
        name={shelf.name}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        title="Delete Shelf"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={() => {
          onDelete?.(deleteTarget);
          onDeleteClose();
        }}
      />

      <Modal isOpen={isColorModalOpen} onClose={onColorModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change shelf color</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={3} spacing={3}>
              {colors.map((color) => (
                <Button
                  key={color.name}
                  bg={color.value}
                  color="white"
                  onClick={() => handleColorChange(color.value)}
                  _hover={{ opacity: 0.86 }}
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
