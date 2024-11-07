import React, { useState, useEffect, useRef } from "react";
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import {
  FiHome,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiUser,
  FiCalendar,
  FiArrowDown,
  FiGrid,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ currentUser, onSidebarToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false); // State for expanding settings submenu
  const [user, setUser] = useState({ name: "", avatarUrl: "" }); // State to store logged-in user
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false); // State for the alert dialog
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const cancelRef = useRef(); // Reference for cancel button in the alert dialog
  const navigate = useNavigate();

  // Fetch the logged-in user's name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userFullName") || "User";
    const avatarUrl = "/path/to/default-avatar.jpg"; // Default avatar or dynamically fetch if available
    setUser({ name: storedName, avatarUrl });
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
    const username = localStorage.getItem("username");

    fetch(`${process.env.REACT_APP_API_URL}/api/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: username }), // Send the username for logout
    })
      .then((response) => {
        if (response.ok) {
          setUser({ name: "", avatarUrl: "" }); // Clear the user state on logout
          localStorage.removeItem("userFullName"); // Clear local storage on logout
          navigate("/login"); // Navigate to login page after logging out
        } else {
          console.error(
            "Failed to log out: Unexpected response status",
            response.status
          );
        }
      })
      .catch((error) => console.error("Error logging out:", error));
  };

  // Handle Settings toggle
  const handleSettingsToggle = () => {
    setIsSettingsExpanded(!isSettingsExpanded); // Toggle the settings sub-menu
  };

  // Open Logout Confirmation Dialog
  const openLogoutDialog = () => {
    setIsLogoutAlertOpen(true);
  };

  // Close Logout Confirmation Dialog
  const closeLogoutDialog = () => {
    setIsLogoutAlertOpen(false);
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
        {/* Adjusted the spacing */}
        <SidebarItem
          icon={FiHome}
          label="Home"
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
            {/* Adjusted submenu spacing */}
            <SidebarItem
              icon={FiGrid}
              label="Apps"
              isExpanded={isExpanded}
              onClick={() => navigate("/application")} // Redirect to application.js
            />
            <SidebarItem
              icon={FiUsers}
              label="Users"
              isExpanded={isExpanded}
              onClick={() => navigate("/user")} // Redirect to users.js
            />
            <SidebarItem
              icon={FiUser}
              label="Suguan"
              isExpanded={isExpanded}
              onClick={() => navigate("/add-suguan")} // Redirect to Suguan.js
            />
            <SidebarItem
              icon={FiCalendar}
              label="Events"
              isExpanded={isExpanded}
              onClick={() => navigate("/add-events")} // Redirect to Events.js
            />
            <SidebarItem
              icon={FiUsers}
              label="LdapUsers" // Added LdapUsers page
              isExpanded={isExpanded}
              onClick={() => navigate("/ldap-users")}
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
          src={user.avatar || ""}
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
          onClick={openLogoutDialog} // Show the logout confirmation dialog
        />
      </Box>

      {/* Logout Confirmation Alert Dialog */}
      <AlertDialog
        isOpen={isLogoutAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeLogoutDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Logout
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to log out, {user.name || "User"}? You will
              need to log in again to access the dashboard.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeLogoutDialog}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleLogout} ml={3}>
                Log Out
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
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
