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
  VStack,
  Button,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaQrcode, FaPrint, FaHome, FaTree } from "react-icons/fa";
import GlobalSearchPage from "../../pages/FileOrganizer/GlobalSearchPage";

const GlobalSearchBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // Theme colors
  const topBarBg = useColorModeValue("white", "gray.800");
  const topBarBorder = useColorModeValue("gray.200", "gray.700");
  const searchBtnBg = useColorModeValue("teal.500", "teal.400");
  const searchBtnHoverBg = useColorModeValue("teal.600", "teal.500");
  const searchBtnColor = useColorModeValue("white", "gray.800");
  const navBtnStyles = {
    bg: useColorModeValue("gray.100", "gray.700"),
    color: useColorModeValue("teal.600", "teal.300"),
    _hover: { bg: useColorModeValue("gray.200", "gray.600"), color: useColorModeValue("teal.700", "teal.200") },
    _active: { bg: useColorModeValue("gray.300", "gray.500") },
    size: "md",
  };

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

  return (
    <>
      {/* Top menu background */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        height="4rem"
        bg={topBarBg}
        boxShadow="sm"
        borderBottom="1px solid"
        borderColor={topBarBorder}
        display="flex"
        alignItems="center"
        px={[4, 6, 8]}
        zIndex={10}
      >
        <Flex w="100%" justify="space-between" align="center">
          {/* Left Icons */}
          <HStack spacing={[2, 3, 4]}>
            <IconButton
              icon={<FaHome size={20} />}
              onClick={() => navigate("/shelvespage")}
              aria-label="Go to Shelves Page"
              {...navBtnStyles}
            />
            <IconButton
              icon={<FaQrcode size={20} />}
              onClick={() => navigate("/file-organizer/scancode")}
              aria-label="Scan QR Code"
              {...navBtnStyles}
            />
            <IconButton
              icon={<FaPrint size={20} />}
              onClick={() => navigate("/file-organizer/qrcode")}
              aria-label="Print"
              {...navBtnStyles}
            />
            <IconButton
              icon={<FaTree size={20} />}
              onClick={() => navigate("/file-organizer/tree")}
              aria-label="File Tree View"
              {...navBtnStyles}
            />
          </HStack>

          {/* Search Button */}
          <IconButton
            icon={<SearchIcon boxSize={5} />}
            onClick={onOpen}
            aria-label="Open Global Search"
            bg={searchBtnBg}
            color={searchBtnColor}
            _hover={{ bg: searchBtnHoverBg }}
            _active={{ bg: searchBtnHoverBg }}
            size="lg"
            borderRadius="md"
            boxShadow="md"
            transition="all 0.2s"
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
          bg={topBarBg}
          color={useColorModeValue("gray.800", "white")}
          borderLeft="1px solid"
          borderColor={topBarBorder}
          zIndex={21}
        >
          <DrawerHeader
            px={[4, 6, 8]}
            py={[4, 6]}
            borderBottom="1px solid"
            borderColor={topBarBorder}
          >
            <HStack spacing={4} align="center">
              <Icon as={SearchIcon} boxSize={6} color={searchBtnColor} />
              <VStack align="start" spacing={0}>
                <Text fontSize={["lg", "2xl"]} fontWeight="bold" color={searchBtnColor}>
                  Global Search
                </Text>
                <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")}>
                  Search Shelves, Containers, Folders, and Documents.
                </Text>
              </VStack>
            </HStack>
          </DrawerHeader>
          <DrawerBody px={[4, 6, 8]} pt={4} pb={8}>
            <GlobalSearchPage onResultClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default GlobalSearchBar;
