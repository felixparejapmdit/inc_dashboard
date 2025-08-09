import React, { useState } from "react";
import {useNavigate } from "react-router-dom";
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
  CloseButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaQrcode, FaPrint, FaHome } from "react-icons/fa";
import GlobalSearchPage from "../../pages/FileOrganizer/GlobalSearchPage";

const GlobalSearchBar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleKeyPress = (e) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onOpen();
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <>
{/* Left-side Icons */}
    <Box position="fixed" top="1rem" left="1rem" zIndex={9999}>
      <HStack spacing={3}>
        {/* Home Icon */}
        <IconButton
          icon={<FaHome size={20} />}
          onClick={() => navigate("/shelvespage")}
          aria-label="Go to Shelves Page"
          bg="transparent"
          color="black"
          border="1px solid black"
          borderRadius="md"
          _hover={{ bg: "gray.100", color: "black" }}
          _active={{ bg: "gray.200" }}
          _focus={{ boxShadow: "none" }}
          size="md"
        />

        {/* Scan (QR Code) Icon */}
        <IconButton
          icon={<FaQrcode size={20} />}
          onClick={() => navigate("/file-organizer/scanqr")}
          aria-label="Scan QR Code"
          bg="transparent"
          color="black"
          border="1px solid black"
          borderRadius="md"
          _hover={{ bg: "gray.100", color: "black" }}
          _active={{ bg: "gray.200" }}
          _focus={{ boxShadow: "none" }}
          size="md"
        />

        {/* Print Icon */}
        <IconButton
          icon={<FaPrint size={20} />}
          onClick={() => navigate("/file-organizer/qrcode")}
          aria-label="Print"
          bg="transparent"
          color="black"
          border="1px solid black"
          borderRadius="md"
          _hover={{ bg: "gray.100", color: "black" }}
          _active={{ bg: "gray.200" }}
          _focus={{ boxShadow: "none" }}
          size="md"
        />
      </HStack>
    </Box>

    {/* Right-side Search Icon */}
    <Box position="fixed" top="1rem" right="1rem" zIndex={9999}>
      <IconButton
        icon={<SearchIcon boxSize={5} />}
        onClick={onOpen}
        aria-label="Open Global Search"
        bg="transparent"
        color="black"
        border="1px solid black"
        borderRadius="md"
        _hover={{ bg: "gray.100", color: "black" }}
        _active={{ bg: "gray.200" }}
        _focus={{ boxShadow: "none" }}
        size="md"
      />
    </Box>


      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="xl"
        motionPreset="slideInRight" // 🌀 smooth animation
      >
        <DrawerOverlay bg="blackAlpha.400" />{" "}
        {/* 🌫️ semi-transparent background */}
        <DrawerContent bg="whiteAlpha.900" backdropFilter="blur(10px)">
          {" "}
          {/* 🔍 transparent drawer with blur */}
          <DrawerHeader px={8} py={6}>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="teal.700">
                  🔍 Global Search
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Type keywords to search across Shelves, Containers, Folders,
                  and Documents.
                </Text>
              </Box>
            </Flex>
          </DrawerHeader>
          <DrawerBody px={8} pt={1} pb={8}>
            <GlobalSearchPage onResultClick={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default GlobalSearchBar;
