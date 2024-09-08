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
  Image,
  Collapse,
} from "@chakra-ui/react";
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiUser,
  FiPlusCircle,
  FiCalendar,
  FiBell,
  FiArrowDown,
} from "react-icons/fi"; // Import additional icons
import { useNavigate } from "react-router-dom";

const Sidebar = ({ currentUser, onSidebarToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false); // State for expanding settings submenu
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
    navigate("/login"); // Redirect to login page
  };

  // Handle Settings toggle
  const handleSettingsToggle = () => {
    setIsSettingsExpanded(!isSettingsExpanded); // Toggle the settings sub-menu
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
      zIndex="100"
      p={4}
    >
      {/* Header */}
      <Box mb={8} display="flex" justifyContent="center">
        {isExpanded ? (
          <Image src="/inc_logo.png" alt="INC Dashboard" boxSize="40px" />
        ) : (
          <Icon as={FiMenu} boxSize={8} color={iconColor} />
        )}
      </Box>

      {/* Menu */}
      <VStack align="start" spacing={4}>
        {" "}
        {/* Adjusted the spacing */}
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
        {/* Settings with submenu */}
        <SidebarItem
          icon={FiSettings}
          label="Settings"
          isExpanded={isExpanded}
          onClick={handleSettingsToggle} // Toggle settings menu
          rightIcon={isSettingsExpanded ? FiArrowDown : null} // Show arrow when expanded
        />
        <Collapse in={isSettingsExpanded} animateOpacity>
          <VStack align="start" ml={isExpanded ? 4 : 0} spacing={3}>
            {" "}
            {/* Adjusted submenu spacing */}
            <SidebarItem
              icon={FiPlusCircle}
              label="Add Apps"
              isExpanded={isExpanded}
              onClick={() => navigate("/admin")} // Redirect to admin.js
            />
            <SidebarItem
              icon={FiUser}
              label="Add Suguan"
              isExpanded={isExpanded}
              onClick={() => navigate("/suguan")} // Redirect to Suguan.js
            />
            <SidebarItem
              icon={FiCalendar}
              label="Add Events"
              isExpanded={isExpanded}
              onClick={() => navigate("/events")} // Redirect to Events.js
            />
            <SidebarItem
              icon={FiBell}
              label="Add Reminders"
              isExpanded={isExpanded}
              onClick={() => navigate("/reminders")} // Redirect to Reminders.js
            />
          </VStack>
        </Collapse>
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
const SidebarItem = ({ icon, label, isExpanded, onClick, rightIcon }) => {
  const menuHoverBg = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Button
      onClick={onClick}
      justifyContent="flex-start" // Left-align the content
      w="100%"
      bg="transparent"
      _hover={{ bg: menuHoverBg }}
      pl={isExpanded ? 4 : 0} // Add padding to the left
      leftIcon={isExpanded && icon && <Icon as={icon} />}
      rightIcon={isExpanded && rightIcon && <Icon as={rightIcon} />} // Add right icon for expanded items
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
