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
import { BsBoxSeam } from "react-icons/bs";
import { FaFolder } from "react-icons/fa";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";

const ContainerCard = ({ container, folders = [], onUpdate, onDelete, onClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isQROpen, setIsQROpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const panelBg = useColorModeValue("orange.50", "gray.900");
  const border = useColorModeValue("orange.200", "gray.700");
  const strongBorder = useColorModeValue("orange.300", "orange.500");
  const textColor = useColorModeValue("gray.900", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const accent = useColorModeValue("orange.600", "orange.300");

  const handleCardClick = (event) => {
    if (event.target.closest("button,[role=menuitem]")) return;

    if (location.pathname.includes("/file-organizer/tree")) {
      onClick?.(container);
      return;
    }

    navigate(`/containers/${container.id}/folders`);
  };

  return (
    <>
      <Box
        bg={bg}
        border="1px solid"
        borderColor={border}
        borderRadius="2xl"
        boxShadow="0 16px 38px rgba(124, 45, 18, 0.08)"
        cursor="pointer"
        h="100%"
        minH="250px"
        minW={0}
        onClick={handleCardClick}
        overflow="hidden"
        transition="all 0.2s ease"
        w="100%"
        _hover={{
          borderColor: strongBorder,
          boxShadow: "0 22px 48px rgba(124, 45, 18, 0.16)",
          transform: "translateY(-3px)",
        }}
      >
        <Flex align="flex-start" justify="space-between" gap={3} p={5} pb={4}>
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
              <Icon as={BsBoxSeam} boxSize={6} color={accent} />
            </Flex>
            <Box minW={0}>
              <Text color={textColor} fontSize="lg" fontWeight="800" noOfLines={1}>
                {container.name}
              </Text>
              <Text color={mutedText} fontSize="sm" mt={1} noOfLines={2}>
                {container.description || "A container for folders inside this shelf."}
              </Text>
            </Box>
          </HStack>

          <Box onClick={(event) => event.stopPropagation()}>
            <GlobalMenuButton
              itemType="container"
              generatedCode={container.generated_code}
              onEdit={() => onUpdate?.(container)}
              onDelete={() => setIsDeleteOpen(true)}
              onGenerateQr={() => setIsQROpen(true)}
              onShowQr={() => setIsQROpen(true)}
            />
          </Box>
        </Flex>

        <HStack px={5} pb={4}>
          <Badge borderRadius="full" colorScheme="orange" px={3} py={1}>
            {folders.length} folder{folders.length === 1 ? "" : "s"}
          </Badge>
          {container.generated_code && (
            <Badge borderRadius="full" colorScheme="gray" px={3} py={1}>
              {container.generated_code}
            </Badge>
          )}
        </HStack>

        <Divider borderColor={border} />

        <VStack align="stretch" bg={panelBg} minH="118px" p={5} spacing={2}>
          {folders.length > 0 ? (
            <>
              {folders.slice(0, 3).map((folder) => (
                <Flex
                  key={folder.id}
                  align="center"
                  bg={bg}
                  border="1px solid"
                  borderColor={border}
                  borderRadius="lg"
                  gap={2}
                  px={3}
                  py={2}
                >
                  <Icon as={FaFolder} color={accent} />
                  <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                    {folder.name}
                  </Text>
                </Flex>
              ))}
              {folders.length > 3 && (
                <Text color={mutedText} fontSize="sm" fontWeight="600" textAlign="right">
                  +{folders.length - 3} more folders
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
              minH="90px"
              textAlign="center"
            >
              <Icon as={FaFolder} boxSize={6} />
              <Text fontSize="sm">No folders yet</Text>
            </Flex>
          )}
        </VStack>
      </Box>

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        code={container.generated_code || String(container.id)}
        title={`QR Code for ${container.name}`}
        name={container.name}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          onDelete?.(container.id);
          setIsDeleteOpen(false);
        }}
        title="Delete Container"
        description={`Are you sure you want to delete "${container.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default ContainerCard;
