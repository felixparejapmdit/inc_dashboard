import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Avatar,
  Button,
  useColorModeValue,
  Image, // Import Image from Chakra UI
} from "@chakra-ui/react";
import { FiHome, FiSettings, FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ currentUser, onSidebarToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState({ name: "", avatarUrl: "" }); // State to store logged-in user
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const menuHoverBg = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const navigate = useNavigate();

  // Fetch the logged-in user info from users.json
  useEffect(() => {
    fetch("/users.json")
      .then((response) => response.json())
      .then((data) => {
        const loggedInUser = data.find((user) => user.isLoggedIn); // Assume a flag for logged-in user
        if (loggedInUser) {
          setUser(loggedInUser); // Set the logged-in user
        }
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  // Toggle sidebar expansion on hover
  const handleMouseEnter = () => {
    setIsExpanded(true);
    onSidebarToggle(true); // Notify parent that sidebar is expanded
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
    onSidebarToggle(false); // Notify parent that sidebar is collapsed
  };

  // Handle Logout
  const handleLogout = () => {
    // Reset any necessary state or authentication (if needed)
    navigate("/login"); // Redirect to login page
  };

  return (
    <Flex
      direction="column"
      bgGradient={bgGradient}
      h="100vh"
      width={isExpanded ? "200px" : "60px"}
      transition="width 0.3s ease"
      position="fixed"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      boxShadow="lg"
      zIndex="100" // Ensures it's in front of the content
      p={4}
    >
      {/* Header */}
      <Box mb={8} display="flex" justifyContent="center">
        {isExpanded ? (
          // Show the INC logo when expanded and center it
          <Image src="/inc_logo.png" alt="INC Dashboard" boxSize="40px" />
        ) : (
          <Icon as={FiMenu} boxSize={8} color={iconColor} />
        )}
      </Box>

      {/* Menu */}
      <VStack align="start" spacing={6}>
        <SidebarItem
          icon={FiHome}
          label="Overview"
          isExpanded={isExpanded}
          onClick={() => navigate("/dashboard")}
        />
        <SidebarItem
          icon={FiUser}
          label="Profile"
          isExpanded={isExpanded}
          onClick={() => navigate("/profile")}
        />
        <SidebarItem
          icon={FiSettings}
          label="Settings"
          isExpanded={isExpanded}
          onClick={() => navigate("/admin")}
        />
      </VStack>

      <Flex flexGrow={1} />

      {/* Current User Info */}
      <Flex
        align="center"
        mt="auto"
        py={4}
        px={isExpanded ? 4 : 0}
        justifyContent={isExpanded ? "start" : "center"}
      >
        <Avatar
          name={user.name || "User"}
          src={user.avatarUrl || ""}
          size={isExpanded ? "md" : "sm"}
        />
        {isExpanded && (
          <Text ml={4} fontSize="md" color={iconColor}>
            {user.name || "User"}
          </Text>
        )}
      </Flex>

      {/* Logout */}
      <Box mt={6}>
        <SidebarItem
          icon={FiLogOut}
          label="Log Out"
          isExpanded={isExpanded}
          onClick={handleLogout} // Handle logout
        />
      </Box>
    </Flex>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, label, isExpanded, onClick }) => {
  const menuHoverBg = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Button
      onClick={onClick}
      justifyContent={isExpanded ? "start" : "center"}
      w="100%"
      bg="transparent"
      _hover={{ bg: menuHoverBg }}
      leftIcon={isExpanded && <Icon as={icon} />}
    >
      {!isExpanded ? (
        <Icon as={icon} color={iconColor} />
      ) : (
        <Text>{label}</Text>
      )}
    </Button>
  );
};

export default Sidebar;
