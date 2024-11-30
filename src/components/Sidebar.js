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
  FiArrowRight,
  FiUser,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiLayers,
  FiMapPin,
  FiFlag,
  FiGlobe,
  FiBookOpen,
  FiTool,
  FiMap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { usePermissionContext } from "../contexts/PermissionContext";

// Map labels to icons
const getIconForLabel = (label) => {
  switch (label) {
    case "Department":
      return FiBriefcase;
    case "Section":
      return FiLayers;
    case "Subsection":
      return FiLayers;
    case "Designation":
      return FiUser;
    case "District":
      return FiMapPin;
    case "Citizenship":
      return FiFlag;
    case "Nationality":
      return FiGlobe;
    case "Language":
      return FiBookOpen;
    case "ContactInfo":
      return FiUsers;
    case "GovernmentIssuedID":
      return FiTool; // Choose an appropriate icon
    case "Event Locations": // Add case for Locations
      return FiMap; // Using FiMap as the icon for Locations
    default:
      return FiSettings;
  }
};

const Sidebar = ({ currentUser, onSidebarToggle }) => {
  const { hasPermission } = usePermissionContext(); // Correct usage

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false); // State for expanding settings submenu
  const [isManagementsExpanded, setIsManagementsExpanded] = useState(false);

  const [user, setUser] = useState({ name: "", avatarUrl: "" }); // State to store logged-in user
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false); // State for the alert dialog
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const cancelRef = useRef(); // Reference for cancel button in the alert dialog
  const navigate = useNavigate();
  const showLdapUsers = false; // Set this to true if you want to show the item
  const roleTextColor = useColorModeValue("gray.500", "gray.300");

  // Fetch the logged-in user's name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("userFullName") || "User";
    const avatarUrl = user.avatarUrl || "/default-avatar.png";
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

  const handleManagementsToggle = () => {
    setIsManagementsExpanded(!isManagementsExpanded);
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
      width={isExpanded ? "250px" : "70px"}
      transition="width 0.3s ease"
      position="fixed"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      boxShadow="lg"
      zIndex="100"
      p={4}
      overflowY="auto"
      css={{
        "::-webkit-scrollbar": {
          width: "4px", // Narrower scrollbar for Webkit browsers
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0, 0, 0, 0.1)", // Light gray thumb with reduced visibility
          borderRadius: "10px", // Rounded corners for the thumb
        },
        "::-webkit-scrollbar-track": {
          backgroundColor: "transparent", // Transparent track for minimal visual distraction
        },
        "-ms-overflow-style": "auto", // Default scrollbar style for IE
        "scrollbar-width": "thin", // Thinner scrollbar for Firefox
        "scrollbar-color": "rgba(0, 0, 0, 0.1) transparent", // Thumb color and track color for Firefox
      }}
    >
      {/* Header */}
      <Box mb={8} display="flex" justifyContent="center">
        {isExpanded ? (
          <Image
            src="/apps_logo - Copy.png"
            alt="INC Dashboard"
            boxSize="60px"
          />
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
        {hasPermission("*settings.view") && (
          <SidebarItem
            icon={FiSettings}
            label="Settings"
            isExpanded={isExpanded}
            onClick={handleSettingsToggle} // Toggle settings menu
            rightIcon={isSettingsExpanded ? FiArrowUp : FiArrowDown} // Show arrow when expanded
          />
        )}
        <Collapse in={isSettingsExpanded} animateOpacity>
          <VStack align="start" ml={isExpanded ? 4 : 0} spacing={3}>
            {/* Adjusted submenu spacing */}
            {hasPermission("apps.view") && (
              <SidebarItem
                icon={FiGrid}
                label="Apps"
                isExpanded={isExpanded}
                onClick={() => navigate("/application")} // Redirect to application.js
              />
            )}
            {hasPermission("categories.view") && (
              <SidebarItem
                icon={FiCalendar}
                label="Categories"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/categorymanagement")} // Redirect to categorymanagement.js
              />
            )}
            {hasPermission("events.view") && (
              <SidebarItem
                icon={FiCalendar}
                label="Events"
                isExpanded={isExpanded}
                onClick={() => navigate("/add-events")} // Redirect to Events.js
              />
            )}
            {hasPermission("eventlocations.view") && (
              <SidebarItem
                label="Event Locations"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/locations")}
                useDynamicIcon
              />
            )}
            {hasPermission("groups.view") && (
              <SidebarItem
                icon={FiCalendar}
                label="Groups"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/groupmanagement")} // Redirect to groupmanagement.js
              />
            )}
            {hasPermission("permission.view") && (
              <SidebarItem
                icon={FiCalendar}
                label="Permissions"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/permissionmanagement")} // Redirect to permissionmanagement.js
              />
            )}

            {hasPermission("personnels.view") && (
              <SidebarItem
                icon={FiUsers}
                label="Personnel"
                isExpanded={isExpanded}
                onClick={() => navigate("/user")} // Redirect to users.js
              />
            )}
            {hasPermission("suguan.view") && (
              <SidebarItem
                icon={FiUser}
                label="Suguan"
                isExpanded={isExpanded}
                onClick={() => navigate("/add-suguan")} // Redirect to Suguan.js
              />
            )}
            {showLdapUsers && (
              <SidebarItem
                icon={FiUsers}
                label="LdapUsers" // Added LdapUsers page
                isExpanded={isExpanded}
                onClick={() => navigate("/ldap-users")}
              />
            )}
          </VStack>
        </Collapse>

        {/* Managements Section */}
        {hasPermission("*management.view") && (
          <SidebarItem
            icon={FiTool} // Change icon to FiBriefcase or any other appropriate icon
            label="Managements"
            isExpanded={isExpanded}
            onClick={handleManagementsToggle}
            rightIcon={isManagementsExpanded ? FiArrowUp : FiArrowDown}
          />
        )}

        <Collapse in={isManagementsExpanded} animateOpacity>
          <VStack align="start" ml={isExpanded ? 4 : 0} spacing={3}>
            {hasPermission("citizenship.view") && (
              <SidebarItem
                label="Citizenship"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/citizenships")}
                useDynamicIcon
              />
            )}
            {hasPermission("contact.view") && (
              <SidebarItem
                label="Contact Info"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/contact_infos")}
                useDynamicIcon
              />
            )}
            {hasPermission("department.view") && (
              <SidebarItem
                label="Department"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/departments")}
                useDynamicIcon // Use dynamic icon mapping
              />
            )}
            {hasPermission("designation.view") && (
              <SidebarItem
                label="Designation"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/designations")}
                useDynamicIcon
              />
            )}
            {hasPermission("district.view") && (
              <SidebarItem
                label="District"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/districts")}
                useDynamicIcon
              />
            )}
            {hasPermission("issued_id.view") && (
              <SidebarItem
                label="Issued ID"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/government_issued_ids")}
                useDynamicIcon
              />
            )}
            {hasPermission("language.view") && (
              <SidebarItem
                label="Language"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/languages")}
                useDynamicIcon
              />
            )}

            {hasPermission("nationality.view") && (
              <SidebarItem
                label="Nationality"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/nationalities")}
                useDynamicIcon
              />
            )}
            {hasPermission("section.view") && (
              <SidebarItem
                label="Section"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/sections")}
                useDynamicIcon
              />
            )}
            {hasPermission("subsection.view") && (
              <SidebarItem
                label="Subsection"
                isExpanded={isExpanded}
                onClick={() => navigate("/managements/subsections")}
                useDynamicIcon
              />
            )}
          </VStack>
        </Collapse>
      </VStack>

      <Flex flexGrow={1} />

      {/* Current User Info */}
      <Flex
        direction="column"
        align="center"
        mt="auto"
        py={4}
        px={isExpanded ? 4 : 2}
        bg={useColorModeValue("gray.100", "gray.800")}
        borderRadius="md"
        boxShadow="sm"
      >
        <Box
          position="relative"
          textAlign="center"
          onClick={openLogoutDialog} // Handle logout when clicked
          cursor="pointer"
          bg="transparent" // No background, since the icon itself provides the design
          _hover={{
            transform: "scale(1.1)",
            boxShadow: "lg",
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          {/* User Icon */}
          <Icon
            as={FiUser} // User icon
            color={useColorModeValue("blue.500", "blue.300")}
            boxSize="40px"
            mb={1} // Margin below the user icon
          />
          {/* Forward Arrow Icon */}
          <Icon
            as={FiArrowRight} // Forward arrow icon
            color={useColorModeValue("green.500", "green.300")}
            boxSize="24px"
          />
          {/* Full Name */}
          {isExpanded && (
            <Text
              mt={2}
              fontSize="md"
              fontWeight="bold"
              color={iconColor}
              textAlign="center"
            >
              {user.name || "User"}
            </Text>
          )}
        </Box>
      </Flex>

      {/* Logout Confirmation Dialog */}
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
const SidebarItem = ({
  icon,
  label,
  isExpanded,
  onClick,
  rightIcon,
  useDynamicIcon = false,
}) => {
  const menuHoverBg = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const IconComponent = useDynamicIcon ? getIconForLabel(label) : icon;

  return (
    <Button
      onClick={onClick}
      justifyContent="flex-start" // Left-align the content
      w="100%"
      bg="transparent"
      _hover={{ bg: menuHoverBg }}
      pl={isExpanded ? 4 : 0} // Add padding to the left
      leftIcon={
        isExpanded &&
        IconComponent && <Icon as={IconComponent} color={iconColor} />
      } // Apply dynamic or static icon
      rightIcon={isExpanded && rightIcon && <Icon as={rightIcon} />} // Add right icon for expanded items
    >
      {!isExpanded ? (
        <Icon as={IconComponent} color={iconColor} />
      ) : (
        <Text>{label}</Text>
      )}
    </Button>
  );
};

export default Sidebar;
