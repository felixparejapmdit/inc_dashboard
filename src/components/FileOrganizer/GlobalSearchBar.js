import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Flex,
  Text,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaQrcode, FaPrint, FaHome } from "react-icons/fa";
import GlobalSearchPage from "../../pages/FileOrganizer/GlobalSearchPage";

const GlobalSearchBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const handleKeyPress = (e) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onOpen();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  const buttonStyles = {
    bg: "white",
    color: "gray.800",
    border: "1px solid",
    borderColor: "gray.300",
    borderRadius: "md",
    _hover: { bg: "gray.200", borderColor: "gray.400" },
    _active: { bg: "gray.300" },
    _focus: { boxShadow: "none" },
    size: "md",
  };

  return (
    <>
      {/* Top menu background */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        height="4rem"
        bg="gray.300"
        boxShadow="sm"
        display="flex"
        alignItems="center"
        px={4}
        zIndex={10}
      >
        <Flex w="100%" justify="space-between" align="center">
          {/* Left Icons */}
          <HStack spacing={3}>
            <IconButton
              icon={<FaHome size={20} />}
              onClick={() => navigate("/shelvespage")}
              aria-label="Go to Shelves Page"
              {...buttonStyles}
            />
            <IconButton
              icon={<FaQrcode size={20} />}
              onClick={() => navigate("/file-organizer/scanqr")}
              aria-label="Scan QR Code"
              {...buttonStyles}
            />
            <IconButton
              icon={<FaPrint size={20} />}
              onClick={() => navigate("/file-organizer/qrcode")}
              aria-label="Print"
              {...buttonStyles}
            />
          </HStack>

          {/* Right Icon */}
          <IconButton
            icon={<SearchIcon boxSize={5} />}
            onClick={onOpen}
            aria-label="Open Global Search"
            {...buttonStyles}
          />
        </Flex>
      </Box>

      {/* Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
        motionPreset="slideInRight"
      >
        <DrawerOverlay bg="blackAlpha.400" zIndex={20} />
        <DrawerContent
          bg="gray.50"
          color="gray.800"
          borderLeft="1px solid"
          borderColor="gray.200"
          zIndex={21}
        >
          <DrawerHeader
            px={8}
            py={6}
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Text fontSize="2xl" fontWeight="bold" color="teal.600">
              🔍 Global Search
            </Text>
            <Text fontSize="sm" color="gray.500">
              Search Shelves, Containers, Folders, and Documents.
            </Text>
          </DrawerHeader>
          <DrawerBody px={8} pt={4} pb={8}>
            <GlobalSearchPage onResultClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default GlobalSearchBar;
