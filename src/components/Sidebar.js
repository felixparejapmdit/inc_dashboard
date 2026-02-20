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
  useBreakpointValue,
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
  FiShield,
  FiCpu,
  FiCheckCircle,
  FiUserCheck,
  FiSliders,
  FiArrowLeft,
  FiBarChart2,
} from "react-icons/fi";
import { FaDownload, FaShareAlt } from "react-icons/fa"; // Font Awesome download icon
import { useNavigate, useLocation } from "react-router-dom";

import { usePermissionContext } from "../contexts/PermissionContext";

import Tutorial from "../components/Tutorial";

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

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false); // State for expanding settings submenu
  const [isManagementsExpanded, setIsManagementsExpanded] = useState(false);
  const [isProgressStepsExpanded, setIsProgressStepsExpanded] = useState(false);
  const [isPluginsExpanded, setIsPluginsExpanded] = useState(false); // State for expanding settings submenu
  const [user, setUser] = useState({ name: "", avatarUrl: "" }); // State to store logged-in user
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false); // State for the alert dialog
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const iconColor = useColorModeValue("gray.600", "gray.300");
  const cancelRef = useRef(); // Reference for cancel button in the alert dialog
  const navigate = useNavigate();
  const location = useLocation();
  const showLdapUsers = false; // Set this to true if you want to show the item
  const roleTextColor = useColorModeValue("gray.500", "gray.300");

  // Handle item click for mobile (auto-close)
  const handleItemClick = (path, isExternal = false) => {
    if (isExternal) {
      window.open(path, "_blank");
    } else {
      navigate(path);
    }
    if (isMobile) {
      setIsExpanded(false);
      onSidebarToggle(false);
    }
  };

  // Fetch the logged-in user's name and gender from the backend
  useEffect(() => {
    // 1. Define Helper to fetch the 2x2 image separately (mirroring Profile.js)
    const fetchProfileImage = async (personnelId) => {
      if (!personnelId) return null;
      try {
        const response = await fetch(`/api/personnel_images/2x2/${personnelId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          }
        });
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data && json.data.image_url) {
            return json.data.image_url;
          }
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
      return null;
    };

    const fetchUserData = async () => {
      const username = localStorage.getItem("username");
      const token = localStorage.getItem("authToken");

      if (!username || !token) {
        const storedName = localStorage.getItem("userFullName") || "User";
        setUser({ name: storedName, avatarUrl: "/default-avatar.png" });
        return;
      }

      try {
        const response = await fetch(
          `/api/users/logged-in?username=${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Decide on avatar based on gender if no custom avatar is set
          const gender = (data.gender || "Male").toLowerCase();
          const defaultAvatar = gender === "male" ? "/male-avatar.png" : "/female-avatar.png";

          let avatarUrl = defaultAvatar;

          // 2. Priority Logic with extra fetch
          if (data.personnel_id) {
            const profileImg = await fetchProfileImage(data.personnel_id);
            if (profileImg) {
              avatarUrl = profileImg;
            } else if (data["2x2 Picture"]) {
              avatarUrl = `/uploads/avatar/${data["2x2 Picture"]}`;
            } else if (data.avatar) {
              avatarUrl = data.avatar;
            }
          } else {
            // Fallback if no personnel_id associated
            if (data["2x2 Picture"]) {
              avatarUrl = `/uploads/avatar/${data["2x2 Picture"]}`;
            } else if (data.avatar) {
              avatarUrl = data.avatar;
            }
          }

          setUser({
            name: data.name || data.username || "User",
            avatarUrl: avatarUrl,
          });
        } else {
          const storedName = localStorage.getItem("userFullName") || "User";
          setUser({ name: storedName, avatarUrl: "/default-avatar.png" });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        const storedName = localStorage.getItem("userFullName") || "User";
        setUser({ name: storedName, avatarUrl: "/default-avatar.png" });
      }
    };

    fetchUserData();
    onSidebarToggle(true);
  }, []);

  // ✅ Auto-expand submenus based on active route
  useEffect(() => {
    const path = location.pathname;

    // Check Settings
    const settingsPaths = ["/application", "/managements/applicationtype", "/managements/categorymanagement", "/settings/drag-drop", "/add-events", "/managements/locations", "/managements/groupmanagement", "/managements/permissionmanagement", "/user", "/tempdeleted-users", "/managements/phonelocations", "/managements/phonedirectory", "/managements/loginaudits", "/reminders", "/add-suguan", "/ldap-users"];
    if (settingsPaths.some(p => path.startsWith(p))) {
      setIsSettingsExpanded(true);
    }

    // Check Enrollment Progress
    if (path.startsWith("/progress/") || path === "/progresstracking") {
      setIsProgressStepsExpanded(true);
    }

    // Check Management
    const managementPaths = ["/managements/citizenships", "/managements/contact_infos", "/managements/departments", "/managements/designations", "/managements/districts", "/managements/housingmanagement", "/managements/government_issued_ids", "/managements/languages", "/managements/nationalities", "/managements/sections", "/managements/subsections"];
    if (managementPaths.some(p => path.startsWith(p))) {
      setIsManagementsExpanded(true);
    }

    // Check Plugins
    if (path === "/lokalprofile") {
      setIsPluginsExpanded(true);
    }
  }, [location.pathname]);

  // Toggle sidebar expansion on hover
  // const handleMouseEnter = () => {
  //   setIsExpanded(true);
  //   onSidebarToggle(true); // Notify parent that sidebar is expanded
  // };

  // const handleMouseLeave = () => {
  //   setIsExpanded(false);
  //   onSidebarToggle(false); // Notify parent that sidebar is collapsed
  // };

  // Handle Logout
  const handleLogout = () => {
    const username = localStorage.getItem("username");

    fetch(`/api/logout`, {
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

  // Handle Plugins toggle
  const handlePluginsToggle = () => {
    setIsPluginsExpanded(!isPluginsExpanded);
  };

  // Handle Settings toggle
  const handleSettingsToggle = () => {
    setIsSettingsExpanded(!isSettingsExpanded); // Toggle the settings sub-menu
  };

  const handleManagementsToggle = () => {
    setIsManagementsExpanded(!isManagementsExpanded);
  };

  // Handle Settings toggle
  const handleProgressToggle = () => {
    setIsProgressStepsExpanded(!isProgressStepsExpanded); // Toggle the settings sub-menu
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
    <Box display="flex" flexDirection="column" minH="100%" bg="#FFD559">
      {/* <Button to="/dashboard" data-tour="dashboard">
  Dashboard
</Button>
<Button to="/profile" data-tour="profile-settings">
  Profile Settings
</Button>
      



<Button to="/schedule" data-tour="share-link">
  Schedule
</Button> */}

      <Button
        data-tour="sidebar-toggle"
        position="fixed"
        top="24px"
        left={isExpanded && !isMobile ? "235px" : "16px"}
        transition="all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)"
        borderRadius="full"
        size="sm"
        onClick={() => {
          const newExpandedState = !isExpanded;
          setIsExpanded(newExpandedState);
          onSidebarToggle(newExpandedState);
        }}
        bg="white"
        color="orange.400"
        _hover={{
          bg: "gray.50",
          transform: "scale(1.1)",
          boxShadow: "lg",
        }}
        _active={{
          transform: "scale(0.95)"
        }}
        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
        zIndex={2000}
        p={0}
        w="32px"
        h="32px"
      >
        <Icon
          as={isExpanded ? FiArrowLeft : FiMenu}
          boxSize={4}
        />
      </Button>

      <Flex
        direction="column"
        height="100vh"
        position={isMobile ? "fixed" : "sticky"}
        top="0"
        left={isMobile && !isExpanded ? "-100%" : "0"}
        right={isMobile ? "0" : "auto"}
        bottom={isMobile ? "0" : "auto"}
        overflowY="auto"
        width={isMobile ? "100%" : (isExpanded ? "250px" : "0px")}
        bg={isMobile ? "rgba(255, 255, 255, 0.95)" : "#FFD559"}
        backdropFilter={isMobile ? "blur(12px)" : "none"}
        transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow={isExpanded ? "4px 0 24px rgba(0,0,0,0.08)" : "none"}
        zIndex={1900}
        p={isExpanded ? 4 : 0}
        overflowX="hidden"
        css={{
          "::-webkit-scrollbar": {
            width: "4px",
          },
          "::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
          },
          "::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          msOverflowStyle: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.1) transparent",
        }}
      >
        {/* Logo Box */}
        {isExpanded && (
          <Box data-tour="dashboard-logo" position="relative" mb={6} mt={2} textAlign="center">
            <Image
              src="/apps_logo.png"
              alt="INC Dashboard"
              boxSize="90px"
              objectFit="contain"
              mx="auto"
              filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))"
            />
          </Box>
        )}

        {/* Menu */}
        <VStack align="stretch" spacing={2}>
          {/* Adjusted the spacing */}

          {hasPermission("*home.view") && (
            <SidebarItem
              data-tour="dashboard"
              icon={FiHome}
              label="Home"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/dashboard")}
              isActive={location.pathname === "/dashboard"}
            />
          )}

          {hasPermission("statistics.view") && (
            <SidebarItem
              data-tour="statistics"
              icon={FiBarChart2}
              label="Statistics"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/personnel-statistics")}
              isActive={location.pathname === "/personnel-statistics"}
            />
          )}

          {hasPermission("inv_dashboard.view") && (
            <SidebarItem
              data-tour="inventory-dashboard"
              icon={FiBarChart2}
              label="Inv Dashboard"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/inv-dashboard")}
              isActive={location.pathname === "/inv-dashboard"}
            />
          )}

          {hasPermission("atg_dashboard.view") && (
            <SidebarItem
              data-tour="atg-dashboard"
              icon={FiBarChart2}
              label="ATG Dashboard"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/atg-dashboard")}
              isActive={location.pathname === "/atg-dashboard"}
            />
          )}

          {hasPermission("*profile.view") && (
            <SidebarItem
              data-tour="profile-settings"
              icon={FiUser}
              label="Profile"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/profile")}
              isActive={location.pathname === "/profile"}
            />
          )}

          {hasPermission("links.view") && (
            <SidebarItem
              data-tour="schedule-button" // ✅ must match the tutorial step
              label="Share a link"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/managements/filemanagement")}
              icon={FaShareAlt}
              isActive={location.pathname === "/managements/filemanagement"}
            />
          )}

          {/* Settings with submenu */}
          {hasPermission("*settings.view") && (
            <SidebarItem
              data-tour="settings-menu"
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
                  onClick={() => handleItemClick("/application")} // Redirect to application.js
                  isActive={location.pathname === "/application"}
                />
              )}
              {hasPermission("applicationtype.view") && (
                <SidebarItem
                  label="Application Type"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/applicationtype")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/applicationtype"}
                />
              )}
              {hasPermission("categories.view") && (
                <SidebarItem
                  icon={FiCalendar}
                  label="Categories"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/categorymanagement")} // Redirect to categorymanagement.js
                  isActive={location.pathname === "/managements/categorymanagement"}
                />
              )}
              {hasPermission("dragdrop.view") && (
                <SidebarItem
                  icon={FiCalendar}
                  label="Drap & Drop"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/settings/drag-drop")} // Redirect to categorymanagement.js
                  isActive={location.pathname === "/settings/drag-drop"}
                />
              )}
              {hasPermission("events.view") && (
                <SidebarItem
                  icon={FiCalendar}
                  label="Events"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/add-events")} // Redirect to Events.js
                  isActive={location.pathname === "/add-events"}
                />
              )}
              {hasPermission("eventlocations.view") && (
                <SidebarItem
                  label="Event Locations"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/locations")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/locations"}
                />
              )}

              {/* {hasPermission("files.view") && (
              <SidebarItem
                label="Share a link"
                isExpanded={isExpanded}
                onClick={() => handleItemClick("/managements/filemanagement")}
                useDynamicIcon
              />
            )} */}
              {hasPermission("groups.view") && (
                <SidebarItem
                  icon={FiCalendar}
                  label="Groups"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/groupmanagement")} // Redirect to groupmanagement.js
                  isActive={location.pathname === "/managements/groupmanagement"}
                />
              )}
              {hasPermission("permission.view") && (
                <SidebarItem
                  icon={FiCalendar}
                  label="Permissions"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/permissionmanagement")} // Redirect to permissionmanagement.js
                  isActive={location.pathname === "/managements/permissionmanagement"}
                />
              )}

              {hasPermission("personnels.view") && (
                <SidebarItem
                  icon={FiUsers}
                  label="Personnel"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/user")} // Redirect to users.js
                  isActive={location.pathname === "/user"}
                />
              )}
              {hasPermission("personnels.tempdeleted") && (
                <SidebarItem
                  icon={FiUsers}
                  label="Deleted Users"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/tempdeleted-users")} // Redirect to users.js
                  isActive={location.pathname === "/tempdeleted-users"}
                />
              )}
              {hasPermission("personnels.view") && ( // Or use a specific permission like personnels.history
                <SidebarItem
                  icon={FiUsers}
                  label="Personnel History"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/personnel-history")}
                  isActive={location.pathname === "/personnel-history"}
                />
              )}
              {hasPermission("phonelocations.view") && (
                <SidebarItem
                  label="Phone Locations"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/phonelocations")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/phonelocations"}
                />
              )}
              {hasPermission("phonedirectory.view") && (
                <SidebarItem
                  icon={FiUsers}
                  label="Phone Directory"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/phonedirectory")} // Redirect to users.js
                  isActive={location.pathname === "/managements/phonedirectory"}
                />
              )}

              <SidebarItem
                icon={FiUsers}
                label="Login Reports"
                isExpanded={isExpanded}
                onClick={() => handleItemClick("/managements/loginaudits")} // Redirect to users.js
                isActive={location.pathname === "/managements/loginaudits"}
              />

              {hasPermission("reminders.view") && (
                <SidebarItem
                  icon={FiUser}
                  label="Reminder"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/reminders")} // Redirect to Reminders.js
                  isActive={location.pathname === "/reminders"}
                />
              )}
              {hasPermission("suguan.view") && (
                <SidebarItem
                  icon={FiUser}
                  label="Suguan"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/add-suguan")} // Redirect to Suguan.js
                  isActive={location.pathname === "/add-suguan"}
                />
              )}
              {showLdapUsers && (
                <SidebarItem
                  icon={FiUsers}
                  label="LdapUsers" // Added LdapUsers page
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/ldap-users")}
                  isActive={location.pathname === "/ldap-users"}
                />
              )}
              <SidebarItem
                icon={FiArrowRight} // Use appropriate icon
                label="Schema Sync"
                isExpanded={isExpanded}
                onClick={() => handleItemClick("/settings/schema-sync")}
                isActive={location.pathname === "/settings/schema-sync"}
              />
            </VStack>
          </Collapse>

          {/* Add Progress Steps Menu */}
          {hasPermission("*progress.view") && (
            <SidebarItem
              data-tour="enrollment-menu"
              icon={FiLayers} // Choose an appropriate icon
              label="Enrollment "
              isExpanded={isExpanded}
              onClick={handleProgressToggle} // Toggle settings menu
              rightIcon={isProgressStepsExpanded ? FiArrowUp : FiArrowDown}
            />
          )}
          <Collapse in={isProgressStepsExpanded} animateOpacity>
            <VStack align="start" ml={isExpanded ? 4 : 0} spacing={3}>
              {hasPermission("progresstracking.view") && (
                <SidebarItem
                  data-tour="progress-tracker"
                  icon={FiUsers}
                  label="Progress Tracker"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progresstracking")} // Redirect to the main progress tracking page
                  isActive={location.pathname === "/progresstracking"}
                />
              )}

              {hasPermission("sectionchief.view") && (
                <SidebarItem
                  icon={FiUser}
                  label="Section Chief"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step1")} // Step 1: Section Chief
                  isActive={location.pathname === "/progress/step1"}
                />
              )}
              {hasPermission("adminoffice.view") && (
                <SidebarItem
                  icon={FiBriefcase}
                  label="Admin Office"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step2")} // Step 2: Admin Office
                  isActive={location.pathname === "/progress/step2"}
                />
              )}
              {hasPermission("securityoverseer.view") && (
                <SidebarItem
                  icon={FiShield}
                  label="Security Overseer"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step3")} // Step 3: Security Overseer
                  isActive={location.pathname === "/progress/step3"}
                />
              )}
              {hasPermission("pmdit.view") && (
                <SidebarItem
                  icon={FiCpu}
                  label="PMD IT"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step4")} // Step 4: PMD IT
                  isActive={location.pathname === "/progress/step4"}
                />
              )}
              {hasPermission("atg1.view") && (
                <SidebarItem
                  icon={FiHome}
                  label="ATG Office 1"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step5")} // Step 5: Marco Cervantes
                  isActive={location.pathname === "/progress/step5"}
                />
              )}
              {hasPermission("atg2.view") && (
                <SidebarItem
                  icon={FiHome}
                  label="ATG Office 2"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step6")} // Step 6: Karl Dematera
                  isActive={location.pathname === "/progress/step6"}
                />
              )}
              {hasPermission("atgapproval.view") && (
                <SidebarItem
                  icon={FiCheckCircle}
                  label="ATG Office Approval"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step7")} // Step 7: ATG Office
                  isActive={location.pathname === "/progress/step7"}
                />
              )}
              {hasPermission("personneloffice.view") && (
                <SidebarItem
                  icon={FiUserCheck}
                  label="Personnel Office"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/step8")} // Step 8: Personnel Office
                  isActive={location.pathname === "/progress/step8"}
                />
              )}
              {hasPermission("personneloffice.view") && (
                <SidebarItem
                  icon={FiUsers}
                  label="Users Progress"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progress/users-progress")} // Users Progress
                  isActive={location.pathname === "/progress/users-progress"}
                />
              )}
            </VStack>
          </Collapse>

          {/* Managements Section */}
          {hasPermission("*management.view") && (
            <SidebarItem
              data-tour="management-menu"
              icon={FiTool} // Change icon to FiBriefcase or any other appropriate icon
              label="Management"
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
                  onClick={() => handleItemClick("/managements/citizenships")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/citizenships"}
                />
              )}
              {hasPermission("contact.view") && (
                <SidebarItem
                  label="Contact Info"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/contact_infos")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/contact_infos"}
                />
              )}
              {hasPermission("department.view") && (
                <SidebarItem
                  label="Department"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/departments")}
                  useDynamicIcon // Use dynamic icon mapping
                  isActive={location.pathname === "/managements/departments"}
                />
              )}
              {hasPermission("designation.view") && (
                <SidebarItem
                  label="Designation"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/designations")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/designations"}
                />
              )}
              {hasPermission("district.view") && (
                <SidebarItem
                  label="District"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/districts")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/districts"}
                />
              )}
              {hasPermission("housing.view") && (
                <SidebarItem
                  label="Housing"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/housingmanagement")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/housingmanagement"}
                />
              )}
              {hasPermission("issued_id.view") && (
                <SidebarItem
                  label="Issued ID"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/government_issued_ids")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/government_issued_ids"}
                />
              )}
              {hasPermission("language.view") && (
                <SidebarItem
                  label="Language"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/languages")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/languages"}
                />
              )}

              {hasPermission("nationality.view") && (
                <SidebarItem
                  label="Nationality"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/nationalities")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/nationalities"}
                />
              )}
              {hasPermission("section.view") && (
                <SidebarItem
                  label="Section"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/sections")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/sections"}
                />
              )}
              {hasPermission("subsection.view") && (
                <SidebarItem
                  label="Subsection"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/subsections")}
                  useDynamicIcon
                  isActive={location.pathname === "/managements/subsections"}
                />
              )}
            </VStack>
          </Collapse>

          {/* Managements Section */}
          {hasPermission("*plugins.view") && (
            <SidebarItem
              data-tour="plugins-menu"
              icon={FiSliders} // Change icon to FiBriefcase or any other appropriate icon
              label="Plugins"
              isExpanded={isExpanded}
              onClick={handlePluginsToggle}
              rightIcon={isPluginsExpanded ? FiArrowUp : FiArrowDown}
            />
          )}

          <Collapse in={isPluginsExpanded} animateOpacity>
            <VStack align="start" ml={isExpanded ? 4 : 0} spacing={3}>
              {hasPermission("lokalprofile.view") && (
                <SidebarItem
                  icon={FiCalendar}
                  label="Lokal Profile"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/lokalprofile")} // Redirect to lokalprofile.js
                  isActive={location.pathname === "/lokalprofile"}
                />
              )}
            </VStack>
          </Collapse>

          <Collapse in={isPluginsExpanded} animateOpacity>
            <VStack align="start" ml={isExpanded ? 4 : 0} spacing={3}>
              {hasPermission("fileorganizer.view") && (
                <SidebarItem
                  icon={FiCalendar}
                  label="File Organizer"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/fileorganizer", true)} // Open in new tab
                />
              )}
            </VStack>
          </Collapse>
        </VStack>

        <Flex flexGrow={1} />

        {/* Current User Info - Fixed at Bottom */}
        <Flex
          position="sticky"
          bottom={0}
          zIndex={10}
          mt="auto"
          mb={6}
          mx={isExpanded ? 3 : 0}
          p={3}
          bg="whiteAlpha.400"
          backdropFilter="blur(10px)"
          borderRadius="2xl"
          align="center"
          justify={isExpanded ? "flex-start" : "center"}
          cursor="pointer"
          onClick={openLogoutDialog}
          _hover={{ bg: "whiteAlpha.600", shadow: "lg", transform: "translateY(-2px)" }}
          transition="all 0.2s"
          border="1px solid rgba(255,255,255,0.3)"
          data-tour="logout"
        >
          <Avatar
            size="sm"
            name={user.name}
            src={user.avatarUrl}
            mr={isExpanded ? 3 : 0}
            bg="white"
            color="gray.800"
            border="2px solid white"
          />

          {isExpanded && (
            <Box overflow="hidden" textAlign="left">
              <Text fontWeight="bold" fontSize="0.9rem" noOfLines={1} color="gray.800">
                {user.name}
              </Text>
              <Text fontSize="xs" color="gray.600" fontWeight="500">
                Click to Logout
              </Text>
            </Box>
          )}

          {isExpanded && (
            <Icon as={FiLogOut} ml="auto" color="gray.700" boxSize={4} />
          )}
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
                <VStack spacing={4} align="center" mb={4}>
                  <Avatar size="xl" name={user.name} src={user.avatarUrl} border="4px solid white" boxShadow="lg" />
                  <Text fontWeight="bold" fontSize="lg">{user.name || "User"}</Text>
                </VStack>
                <Text textAlign="center">
                  Are you sure you want to log out? You will need to log in again to access the dashboard.
                </Text>
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
        <Tutorial
          isSidebarExpanded={isExpanded}
          onExpandSidebar={() => {
            setIsExpanded(true);
            onSidebarToggle(true);
          }}
        />
      </Flex>
    </Box >
  );
};

// Sidebar Item Component
const SidebarItem = ({
  icon,
  label,
  isExpanded,
  onClick,
  isActive,
  rightIcon,
  useDynamicIcon = false,
  ...rest
}) => {
  const IconComponent = useDynamicIcon ? getIconForLabel(label) : icon;

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      w={isExpanded ? "92%" : "0px"}
      mx="auto"
      mb={1}
      px={4}
      height="48px"
      justifyContent="flex-start"
      bg={isActive ? "rgba(255, 255, 255, 0.4)" : "transparent"}
      color={isActive ? "orange.600" : "#2D3748"}
      position="relative"
      _hover={{
        bg: "rgba(255, 255, 255, 0.2)",
        transform: "translateX(4px)",
      }}
      _active={{
        transform: "scale(0.98)",
      }}
      borderRadius="xl"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      leftIcon={
        isExpanded &&
        IconComponent && (
          <Icon
            as={IconComponent}
            boxSize={5}
            color={isActive ? "orange.600" : "#4A5568"}
          />
        )
      }
      rightIcon={
        isExpanded &&
        rightIcon && (
          <Icon as={rightIcon} color={isActive ? "orange.600" : "#4A5568"} />
        )
      }
      overflow="hidden"
      whiteSpace="nowrap"
      {...rest}
    >
      {/* 3px Vertical Line for Active Link */}
      {isActive && (
        <Box
          position="absolute"
          left="0"
          top="20%"
          bottom="20%"
          width="3px"
          bg="orange.500"
          borderRadius="full"
        />
      )}

      {isExpanded && (
        <Text
          fontSize="0.95rem"
          fontWeight={isActive ? "700" : "600"}
          letterSpacing="wide"
          ml={1}
        >
          {label}
        </Text>
      )}
    </Button>
  );
};

export default Sidebar;
