import React, { useState, useEffect, useRef } from "react";

import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Avatar,
  Button,
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
  FiUser,
  FiUserPlus,
  FiUserX,
  FiCalendar,
  FiClock,
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
  FiTag,
  FiMove,
  FiLock,
  FiPhone,
  FiLogIn,
  FiBell,
  FiRefreshCw,
  FiClipboard,
  FiAward,
  FiActivity,
  FiTrendingUp,
  FiPieChart,
  FiPackage,
  FiCreditCard,
  FiServer,
  FiArchive,
  FiShare2,
  FiMap,
  FiShield,
  FiCpu,
  FiCheckCircle,
  FiUserCheck,
  FiSliders,
  FiArrowLeft,
  FiCloud,
  FiFileText,
  FiFolder,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

import { usePermissionContext } from "../contexts/PermissionContext";

import Tutorial from "../components/Tutorial";

const WEB_DAV_ROUTE = "/webdav";

// Map labels to icons. The passed icon is only a fallback for unknown labels.
const getIconForLabel = (label = "", fallbackIcon = FiSettings) => {
  const cleanLabel = label.trim();

  switch (cleanLabel) {
    case "Home":
      return FiHome;
    case "Statistics":
      return FiPieChart;
    case "Inv Dashboard":
      return FiPackage;
    case "ATG Dashboard":
      return FiTrendingUp;
    case "Profile":
      return FiUser;
    case "Share a link":
      return FiShare2;
    case "Settings":
      return FiSettings;
    case "Apps":
      return FiGrid;
    case "Application Type":
      return FiLayers;
    case "Categories":
      return FiTag;
    case "Drap & Drop":
    case "Drag & Drop":
      return FiMove;
    case "Events":
      return FiCalendar;
    case "Groups":
      return FiUsers;
    case "Permissions":
      return FiLock;
    case "Personnel":
      return FiUsers;
    case "Deleted Users":
      return FiUserX;
    case "Personnel History":
      return FiClock;
    case "Phone Directory":
      return FiPhone;
    case "Login Reports":
      return FiLogIn;
    case "Reminder":
      return FiBell;
    case "Suguan":
      return FiClipboard;
    case "LdapUsers":
      return FiServer;
    case "Schema Sync":
      return FiRefreshCw;
    case "Enrollment":
      return FiUserPlus;
    case "Progress Tracker":
      return FiActivity;
    case "Section Chief":
      return FiAward;
    case "Admin Office":
      return FiBriefcase;
    case "Security Overseer":
      return FiShield;
    case "PMD IT":
      return FiCpu;
    case "ATG Office 1":
    case "ATG Office 2":
      return FiHome;
    case "ATG Office Approval":
      return FiCheckCircle;
    case "Personnel Office":
      return FiUserCheck;
    case "Users Progress":
      return FiTrendingUp;
    case "Management":
      return FiTool;
    case "Department":
      return FiBriefcase;
    case "Section":
      return FiLayers;
    case "Subsection":
      return FiLayers;
    case "Designation":
      return FiAward;
    case "District":
      return FiMapPin;
    case "Citizenship":
      return FiFlag;
    case "Nationality":
      return FiGlobe;
    case "Language":
      return FiBookOpen;
    case "ContactInfo":
    case "Contact Info":
      return FiPhone;
    case "GovernmentIssuedID":
    case "Issued ID":
      return FiCreditCard;
    case "Housing":
      return FiHome;
    case "Phone Locations":
      return FiMapPin;
    case "Event Locations": // Add case for Locations
      return FiMap; // Using FiMap as the icon for Locations
    case "Plugins":
      return FiSliders;
    case "Lokal Profile":
      return FiMapPin;
    case "ATG Files":
      return FiFolder;
    case "WebDAV":
      return FiCloud;
    case "File Organizer":
      return FiArchive;
    case "Daily Activity":
      return FiFileText;
    default:
      if (cleanLabel.toLowerCase().includes("file")) return FiFolder;
      if (cleanLabel.toLowerCase().includes("report")) return FiFileText;
      if (cleanLabel.toLowerCase().includes("phone")) return FiPhone;
      if (cleanLabel.toLowerCase().includes("user")) return FiUsers;
      if (cleanLabel.toLowerCase().includes("setting")) return FiSettings;

      return fallbackIcon || FiSettings;
  }
};

const SIDEBAR_ACCENT_COLORS = {
  Home: "#D65A31",
  Statistics: "#2563EB",
  "Inv Dashboard": "#7C3AED",
  "ATG Dashboard": "#0F766E",
  Profile: "#0EA5E9",
  "Share a link": "#475569",
  Settings: "#C05621",
  Apps: "#EA580C",
  "Application Type": "#0D9488",
  Categories: "#DB2777",
  "Drap & Drop": "#9333EA",
  Events: "#2563EB",
  "Event Locations": "#16A34A",
  Groups: "#0F766E",
  Permissions: "#DC2626",
  Personnel: "#0284C7",
  "Deleted Users": "#BE123C",
  "Personnel History": "#7C3AED",
  "Phone Locations": "#0891B2",
  "Phone Directory": "#0D9488",
  "Login Reports": "#64748B",
  Reminder: "#F59E0B",
  Suguan: "#C2410C",
  "Schema Sync": "#334155",
  Enrollment: "#805AD5",
  "Enrollment ": "#805AD5",
  "Progress Tracker": "#0F766E",
  "Section Chief": "#2563EB",
  "Admin Office": "#B7791F",
  "Security Overseer": "#2563EB",
  "PMD IT": "#7C3AED",
  "ATG Office 1": "#DD6B20",
  "ATG Office 2": "#EA580C",
  "ATG Office Approval": "#16A34A",
  "Personnel Office": "#0284C7",
  "Users Progress": "#0D9488",
  Management: "#7C3AED",
  Citizenship: "#0EA5E9",
  "Contact Info": "#0F766E",
  Department: "#B45309",
  Designation: "#2563EB",
  District: "#16A34A",
  Housing: "#DD6B20",
  "Issued ID": "#DC2626",
  Language: "#9333EA",
  Nationality: "#0D9488",
  Section: "#2563EB",
  Subsection: "#64748B",
  Plugins: "#0D9488",
  "Lokal Profile": "#C05621",
  "ATG Files": "#2563EB",
  WebDAV: "#0284C7",
  "File Organizer": "#16A34A",
  "Daily Activity": "#DB2777",
};

const getAccentForLabel = (label = "") => {
  const cleanLabel = label.trim();

  if (SIDEBAR_ACCENT_COLORS[cleanLabel]) {
    return SIDEBAR_ACCENT_COLORS[cleanLabel];
  }

  const lowerLabel = cleanLabel.toLowerCase();
  if (lowerLabel.includes("office")) return "#DD6B20";
  if (lowerLabel.includes("security")) return "#2563EB";
  if (lowerLabel.includes("personnel") || lowerLabel.includes("user"))
    return "#0284C7";
  if (lowerLabel.includes("file") || lowerLabel.includes("folder"))
    return "#2563EB";
  if (lowerLabel.includes("report") || lowerLabel.includes("activity"))
    return "#DB2777";
  if (lowerLabel.includes("management")) return "#7C3AED";

  return "#475569";
};

const hexToRgba = (hex, alpha) => {
  const sanitized = hex.replace("#", "");
  const fullHex =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => char + char)
          .join("")
      : sanitized;
  const number = Number.parseInt(fullHex, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const Sidebar = ({ onSidebarToggle }) => {
  const { hasPermission } = usePermissionContext(); // Correct usage

  const isMobile = useBreakpointValue({ base: true, md: false });
  const [isExpanded, setIsExpanded] = useState(true);

  // Ensure sidebar is expanded on desktop and collapsed on mobile when view changes
  useEffect(() => {
    if (isMobile !== undefined) {
      const shouldExpand = !isMobile;
      setIsExpanded(shouldExpand);
      onSidebarToggle(shouldExpand);
    }
  }, [isMobile, onSidebarToggle]);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false); // State for expanding settings submenu
  const [isManagementsExpanded, setIsManagementsExpanded] = useState(false);
  const [isProgressStepsExpanded, setIsProgressStepsExpanded] = useState(false);
  const [isPluginsExpanded, setIsPluginsExpanded] = useState(false); // State for expanding settings submenu
  const [user, setUser] = useState({ name: "", avatarUrl: "" }); // State to store logged-in user
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false); // State for the alert dialog
  const cancelRef = useRef(); // Reference for cancel button in the alert dialog
  const navigate = useNavigate();
  const location = useLocation();
  const showLdapUsers = false; // Set this to true if you want to show the item

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
        const response = await fetch(
          `/api/personnel_images/2x2/${personnelId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        );
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
          },
        );

        if (response.ok) {
          const data = await response.json();
          // Decide on avatar based on gender if no custom avatar is set
          const gender = (data.gender || "Male").toLowerCase();
          const defaultAvatar =
            gender === "male" ? "/male-avatar.png" : "/female-avatar.png";

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
    const settingsPaths = [
      "/application",
      "/managements/applicationtype",
      "/managements/categorymanagement",
      "/settings/drag-drop",
      "/add-events",
      "/managements/locations",
      "/managements/groupmanagement",
      "/managements/permissionmanagement",
      "/user",
      "/tempdeleted-users",
      "/managements/phonelocations",
      "/managements/phonedirectory",
      "/managements/loginaudits",
      "/reminders",
      "/add-suguan",
      "/ldap-users",
    ];
    if (settingsPaths.some((p) => path.startsWith(p))) {
      setIsSettingsExpanded(true);
    }

    // Check Enrollment Progress
    if (path.startsWith("/progress/") || path === "/progresstracking") {
      setIsProgressStepsExpanded(true);
    }

    // Check Management
    const managementPaths = [
      "/managements/citizenships",
      "/managements/contact_infos",
      "/managements/departments",
      "/managements/designations",
      "/managements/districts",
      "/managements/housingmanagement",
      "/managements/government_issued_ids",
      "/managements/languages",
      "/managements/nationalities",
      "/managements/sections",
      "/managements/subsections",
    ];
    if (managementPaths.some((p) => path.startsWith(p))) {
      setIsManagementsExpanded(true);
    }

    // Check Plugins
    if (
      path === "/lokalprofile" ||
      path === "/atgfiles" ||
      path === "/atg-files" ||
      path === WEB_DAV_ROUTE
    ) {
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
          localStorage.removeItem("authToken");
          localStorage.removeItem("username");
          localStorage.removeItem("userFullName");
          localStorage.removeItem("groupId");
          localStorage.removeItem("groupName");
          localStorage.removeItem("isLoggingIn");
          localStorage.removeItem("department_id");
          localStorage.removeItem("section_id");
          localStorage.removeItem("subsection_id");
          localStorage.removeItem("designation_id");
          localStorage.removeItem("designation_name");
          localStorage.removeItem("user_id");
          localStorage.removeItem("userId");
          localStorage.removeItem("role");
          navigate("/login"); // Navigate to login page after logging out
        } else {
          console.error(
            "Failed to log out: Unexpected response status",
            response.status,
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
    <Box
      className="no-print"
      display="flex"
      flexDirection="column"
      minH="100%"
      bgGradient="linear(to-b, #FFD559, #FFE07A 48%, #FFD15A)"
    >
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
          transform: "scale(0.95)",
        }}
        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
        zIndex={2000}
        p={0}
        w="32px"
        h="32px"
      >
        <Icon as={isExpanded ? FiArrowLeft : FiMenu} boxSize={4} />
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
        width={isMobile ? "100%" : isExpanded ? "250px" : "0px"}
        bg={isMobile ? "rgba(255, 255, 255, 0.95)" : "transparent"}
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
          <Box
            data-tour="dashboard-logo"
            position="relative"
            mb={6}
            mt={2}
            textAlign="center"
          >
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
              icon={FiPieChart}
              label="Statistics"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/personnel-statistics")}
              isActive={location.pathname === "/personnel-statistics"}
            />
          )}

          {hasPermission("inv_dashboard.view") && (
            <SidebarItem
              data-tour="inventory-dashboard"
              icon={FiPackage}
              label="Inv Dashboard"
              isExpanded={isExpanded}
              onClick={() => handleItemClick("/inv-dashboard")}
              isActive={location.pathname === "/inv-dashboard"}
            />
          )}

          {hasPermission("atg_dashboard.view") && (
            <SidebarItem
              data-tour="atg-dashboard"
              icon={FiTrendingUp}
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
              icon={FiShare2}
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
            <VStack align="start" ml={isExpanded ? 3 : 0} spacing={1}>
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
                  onClick={() =>
                    handleItemClick("/managements/applicationtype")
                  }
                  useDynamicIcon
                  isActive={
                    location.pathname === "/managements/applicationtype"
                  }
                />
              )}
              {hasPermission("categories.view") && (
                <SidebarItem
                  icon={FiTag}
                  label="Categories"
                  isExpanded={isExpanded}
                  onClick={() =>
                    handleItemClick("/managements/categorymanagement")
                  } // Redirect to categorymanagement.js
                  isActive={
                    location.pathname === "/managements/categorymanagement"
                  }
                />
              )}
              {hasPermission("dragdrop.view") && (
                <SidebarItem
                  icon={FiMove}
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
                  icon={FiUsers}
                  label="Groups"
                  isExpanded={isExpanded}
                  onClick={() =>
                    handleItemClick("/managements/groupmanagement")
                  } // Redirect to groupmanagement.js
                  isActive={
                    location.pathname === "/managements/groupmanagement"
                  }
                />
              )}
              {hasPermission("permission.view") && (
                <SidebarItem
                  icon={FiLock}
                  label="Permissions"
                  isExpanded={isExpanded}
                  onClick={() =>
                    handleItemClick("/managements/permissionmanagement")
                  } // Redirect to permissionmanagement.js
                  isActive={
                    location.pathname === "/managements/permissionmanagement"
                  }
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
                  icon={FiUserX}
                  label="Deleted Users"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/tempdeleted-users")} // Redirect to users.js
                  isActive={location.pathname === "/tempdeleted-users"}
                />
              )}
              {hasPermission("personnelhistory.view") && ( // Or use a specific permission like personnels.history
                <SidebarItem
                  icon={FiClock}
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
                  icon={FiPhone}
                  label="Phone Directory"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/phonedirectory")} // Redirect to users.js
                  isActive={location.pathname === "/managements/phonedirectory"}
                />
              )}

              {hasPermission("loginreports.view") && (
                <SidebarItem
                  icon={FiLogIn}
                  label="Login Reports"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/managements/loginaudits")} // Redirect to users.js
                  isActive={location.pathname === "/managements/loginaudits"}
                />
              )}
              {hasPermission("reminders.view") && (
                <SidebarItem
                  icon={FiBell}
                  label="Reminder"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/reminders")} // Redirect to Reminders.js
                  isActive={location.pathname === "/reminders"}
                />
              )}
              {hasPermission("suguan.view") && (
                <SidebarItem
                  icon={FiClipboard}
                  label="Suguan"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/add-suguan")} // Redirect to Suguan.js
                  isActive={location.pathname === "/add-suguan"}
                />
              )}
              {showLdapUsers && (
                <SidebarItem
                  icon={FiServer}
                  label="LdapUsers" // Added LdapUsers page
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/ldap-users")}
                  isActive={location.pathname === "/ldap-users"}
                />
              )}
              {hasPermission("schemasync.view") && (
                <SidebarItem
                  icon={FiRefreshCw}
                  label="Schema Sync"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/settings/schema-sync")}
                  isActive={location.pathname === "/settings/schema-sync"}
                />
              )}
            </VStack>
          </Collapse>

          {/* Add Progress Steps Menu */}
          {hasPermission("*progress.view") && (
            <SidebarItem
              data-tour="enrollment-menu"
              icon={FiUserPlus}
              label="Enrollment "
              isExpanded={isExpanded}
              onClick={handleProgressToggle} // Toggle settings menu
              rightIcon={isProgressStepsExpanded ? FiArrowUp : FiArrowDown}
            />
          )}
          <Collapse in={isProgressStepsExpanded} animateOpacity>
            <VStack align="start" ml={isExpanded ? 3 : 0} spacing={1}>
              {hasPermission("progresstracking.view") && (
                <SidebarItem
                  data-tour="progress-tracker"
                  icon={FiActivity}
                  label="Progress Tracker"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/progresstracking")} // Redirect to the main progress tracking page
                  isActive={location.pathname === "/progresstracking"}
                />
              )}

              {hasPermission("sectionchief.view") && (
                <SidebarItem
                  icon={FiAward}
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
                  icon={FiTrendingUp}
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
            <VStack align="start" ml={isExpanded ? 3 : 0} spacing={1}>
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
                  onClick={() =>
                    handleItemClick("/managements/housingmanagement")
                  }
                  useDynamicIcon
                  isActive={
                    location.pathname === "/managements/housingmanagement"
                  }
                />
              )}
              {hasPermission("issued_id.view") && (
                <SidebarItem
                  label="Issued ID"
                  isExpanded={isExpanded}
                  onClick={() =>
                    handleItemClick("/managements/government_issued_ids")
                  }
                  useDynamicIcon
                  isActive={
                    location.pathname === "/managements/government_issued_ids"
                  }
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
            <VStack align="start" ml={isExpanded ? 3 : 0} spacing={1}>
              {hasPermission("lokalprofile.view") && (
                <SidebarItem
                  icon={FiMapPin}
                  label="Lokal Profile"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/lokalprofile")} // Redirect to lokalprofile.js
                  isActive={location.pathname === "/lokalprofile"}
                />
              )}
              {hasPermission("atgfiles.view") && (
                <SidebarItem
                  icon={FiFolder}
                  label="ATG Files"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/atgfiles")}
                  isActive={location.pathname === "/atgfiles"}
                />
              )}
              {hasPermission("webdav.view") && (
                <SidebarItem
                  icon={FiCloud}
                  label="WebDAV"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick(WEB_DAV_ROUTE)}
                  isActive={location.pathname === WEB_DAV_ROUTE}
                />
              )}
            </VStack>
          </Collapse>

          <Collapse in={isPluginsExpanded} animateOpacity>
            <VStack align="start" ml={isExpanded ? 3 : 0} spacing={1}>
              {hasPermission("fileorganizer.view") && (
                <SidebarItem
                  icon={FiArchive}
                  label="File Organizer"
                  isExpanded={isExpanded}
                  onClick={() =>
                    handleItemClick("/file-organizer/shelves", true)
                  } // Open in new tab
                />
              )}
            </VStack>
          </Collapse>

          <Collapse in={isPluginsExpanded} animateOpacity>
            <VStack align="start" ml={isExpanded ? 3 : 0} spacing={1}>
              {/* Daily Activity Report */}
              {hasPermission("dailyactivity.view") && (
                <SidebarItem
                  icon={FiFileText}
                  label="Daily Activity"
                  isExpanded={isExpanded}
                  onClick={() => handleItemClick("/daily-activity-report")}
                  isActive={location.pathname === "/daily-activity-report"}
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
          _hover={{
            bg: "whiteAlpha.600",
            shadow: "lg",
            transform: "translateY(-2px)",
          }}
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
              <Text
                fontWeight="bold"
                fontSize="0.9rem"
                noOfLines={1}
                color="gray.800"
              >
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
                  <Avatar
                    size="xl"
                    name={user.name}
                    src={user.avatarUrl}
                    border="4px solid white"
                    boxShadow="lg"
                  />
                  <Text fontWeight="bold" fontSize="lg">
                    {user.name || "User"}
                  </Text>
                </VStack>
                <Text textAlign="center">
                  Are you sure you want to log out? You will need to log in
                  again to access the dashboard.
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
    </Box>
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
  const IconComponent = getIconForLabel(
    label,
    useDynamicIcon ? FiSettings : icon,
  );
  const accentColor = getAccentForLabel(label);
  const hoverBg = hexToRgba(accentColor, 0.12);
  const activeBg = hexToRgba(accentColor, 0.16);

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      role="group"
      w={isExpanded ? "100%" : "0px"}
      mx="auto"
      mb={0.5}
      px={2.5}
      height="44px"
      justifyContent="flex-start"
      bg={isActive ? activeBg : "transparent"}
      color={isActive ? accentColor : "#1F2937"}
      position="relative"
      _hover={{
        bg: hoverBg,
        transform: "translateX(3px)",
      }}
      _active={{
        transform: "scale(0.98)",
      }}
      borderRadius="xl"
      boxShadow={isActive ? `inset 3px 0 0 ${accentColor}` : "none"}
      transition="background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease"
      overflow="hidden"
      whiteSpace="nowrap"
      {...rest}
    >
      {isExpanded && (
        <Flex align="center" gap={2.5} minW={0} w="100%">
          {IconComponent && (
            <Flex
              align="center"
              justify="center"
              minW="32px"
              w="32px"
              h="32px"
              borderRadius="full"
              bg="transparent"
              color={accentColor}
              transition="color 0.2s ease, transform 0.2s ease"
              _groupHover={{ transform: "scale(1.04)" }}
            >
              <Icon as={IconComponent} boxSize={5} />
            </Flex>
          )}

          <Text
            fontSize="0.88rem"
            fontWeight={isActive ? "800" : "650"}
            letterSpacing="0.01em"
            textAlign="left"
            flex="1"
            minW={0}
            noOfLines={1}
          >
            {label}
          </Text>

          {rightIcon && (
            <Icon
              as={rightIcon}
              boxSize={4}
              color={accentColor}
              flexShrink={0}
            />
          )}
        </Flex>
      )}
    </Button>
  );
};

export default Sidebar;
