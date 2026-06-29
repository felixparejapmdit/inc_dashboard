import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation for navigation

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Table,
  Badge,
  Thead,
  Tbody,
  HStack,
  Text,
  Avatar,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  CheckboxGroup,
  Stack,
  Alert,
  AlertIcon,
  Flex,
  Select,
  useToast,
  Tooltip,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Icon,
  SimpleGrid,
  Image,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Portal,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Switch,
} from "@chakra-ui/react";
import {
  AddIcon,
  CopyIcon,
  EditIcon,
  DeleteIcon,
  InfoIcon,
  ViewIcon,
  DownloadIcon,
  Search2Icon,
  RepeatIcon,
  ViewOffIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import axios from "axios";
import { FaCamera, FaIdCard } from "react-icons/fa";
import { FiUser, FiInfo, FiRefreshCw, FiUsers, FiMoreVertical, FiUpload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

import { usePermissionContext } from "../contexts/PermissionContext";
import Photoshoot from "./progress/Photoshoot"; // Import Photoshoot component
import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed
import { useUserFormData, suffixOptions } from "../hooks/userFormOptions";

import { fetchData, fetchDataPhotoshoot, postData, putData, deleteData } from "../utils/fetchData";
import { filterPersonnelData } from "../utils/filterUtils";

const API_URL = process.env.REACT_APP_API_URL || "";
const ITEMS_PER_PAGE = 5;
const isAppActive = (app) => app?.is_active !== false && app?.is_active !== 0 && app?.is_active !== "0";
const SIDEBAR_GRADIENT = "linear(to-b, #FFD559, #FFE07A 48%, #FFD15A)";
const THIN_SCROLLBAR_STYLES = {
  "::-webkit-scrollbar": {
    width: "4px",
    height: "4px",
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
};

const Users = ({ personnelId }) => {
  const {
    districts,
    localCongregations,
    languages,
    citizenships,
    sections,
    subsections,
    designations,
    incHousingAddresses,
    civilStatusOptions,
    educationalLevelOptions,
    bloodtypes,
  } = useUserFormData();

  const [filteredLocals, setFilteredLocals] = useState(localCongregations);

  const [allAdvanceSelected, setAllAdvanceSelected] = useState(false);
  const [SelectedPersonnelTypes, setSelectedPersonnelTypes] = useState([]); // For advanced filters
  const [users, setUsers] = useState([]);

  const { hasPermission } = usePermissionContext(); // Correct usage

  const [groups, setGroups] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(""); // For group assignment
  const [apps, setApps] = useState([]);
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState(null);
  const [status, setStatus] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isNewPersonnelLoading, setIsNewPersonnelLoading] = useState(true);

  const [existingPersonnel, setExistingPersonnel] = useState([]); // Personnel already in LDAP but no personnel_id
  const [newPersonnels, setNewPersonnels] = useState([]);
  const [searchPersonnelList, setSearchPersonnelList] = useState(""); // Search for personnel list
  const [searchNewPersonnels, setSearchNewPersonnels] = useState(""); // Search for new enrolled personnel
  const [currentPagePersonnel, setCurrentPagePersonnel] = useState(1);
  const [currentPageNew, setCurrentPageNew] = useState(1);
  const [currentPageLdapOnly, setCurrentPageLdapOnly] = useState(1);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState(null);

  const [columnVisibility, setColumnVisibility] = useState({});

  // To control menu open/close
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [personnelImages, setPersonnelImages] = useState([]);


  // Elasticsearch State
  const [useElasticsearch, setUseElasticsearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSyncingES, setIsSyncingES] = useState(false);


  // Sync Modal State
  const [selectedSyncPersonnel, setSelectedSyncPersonnel] = useState(null);
  const [selectedSyncGroup, setSelectedSyncGroup] = useState("");
  const { isOpen: isSyncModalOpen, onOpen: onSyncModalOpen, onClose: onSyncModalClose } = useDisclosure();

  // Password Visibility State
  const [showPasswords, setShowPasswords] = useState({});

  const togglePasswordVisibility = (userId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // LDAP Password Reset State
  const {
    isOpen: isResetPasswordModalOpen,
    onOpen: onResetPasswordModalOpen,
    onClose: onResetPasswordModalClose,
  } = useDisclosure();
  const [selectedLdapUser, setSelectedLdapUser] = useState(null);
  const [newLdapPassword, setNewLdapPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleLdapPasswordReset = async () => {
    if (!selectedLdapUser || !newLdapPassword) return;

    setIsResettingPassword(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/ldap/admin-reset-password`,
        {
          username: selectedLdapUser.username,
          newPassword: newLdapPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Password reset successful.",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onResetPasswordModalClose();
      setNewLdapPassword("");
      setSelectedLdapUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("LDAP Password Reset Error:", error);
      toast({
        title: "Password reset failed.",
        description: error.response?.data?.message || "Unknown error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // For select all
  const allKeys = useMemo(() => {
    if (existingPersonnel.length === 0) return [];
    // Prioritize a record with personnel_id to ensure we get all relevant columns
    const record = existingPersonnel.find(u => u.personnel_id) || existingPersonnel[0];
    return Object.keys(record);
  }, [existingPersonnel]);
  const allVisible = allKeys.every((key) => columnVisibility[key]);

  const [categorizedApps, setCategorizedApps] = useState({});

  const activeApps = useMemo(
    () => apps.filter((app) => isAppActive(app)),
    [apps]
  );
  const hasVisibleApps = useMemo(
    () => Object.values(categorizedApps).some((categoryApps) =>
      categoryApps.some((app) => isAppActive(app))
    ),
    [categorizedApps]
  );

  const avatarBaseUrl = `${API_URL}/uploads/`;

  const navigate = useNavigate(); // Initialize navigation
  const location = useLocation(); // Get location to access navigation state

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const personnelSearch = params.get("search") || "";
    const newEnrollSearch = params.get("new_enroll_search") || "";

    setSearchPersonnelList(personnelSearch);
    setSearchNewPersonnels(newEnrollSearch);
    setCurrentPagePersonnel(1);

    if (newEnrollSearch) {
      // Wait for table to likely be rendered and then scroll
      setTimeout(() => {
        if (newPersonnelRef.current) {
          newPersonnelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  }, [location.search]);

  const {
    isOpen: isOpenAdvance,
    onOpen: onOpenAdvance,
    onClose: onCloseAdvance,
  } = useDisclosure();

  const [advancedFilters, setAdvancedFilters] = useState({
    Minister: false,
    Regular: false,
    "Lay Member": false,
    "Minister's Wife": false,
    "Ministerial Student": false,
    Volunteer: false,
    district: "",
    local: "",
    section: "",
    team: "",
    role: "",
    birthdayMonth: "",
    bloodtype: "",
    language: "",
    citizenship: "",
    civil_status: "",
    educational_attainment: "",
    inc_housing_address_id: "",
    incHousing: false,
  });

  // State for the filters actually applied to the list
  const [appliedFilters, setAppliedFilters] = useState({
    Minister: false,
    Regular: false,
    "Lay Member": false,
    "Minister's Wife": false,
    "Ministerial Student": false,
    Volunteer: false,
    district: "",
    local: "",
    section: "",
    team: "",
    role: "",
    birthdayMonth: "",
    bloodtype: "",
    language: "",
    citizenship: "",
    civil_status: "",
    educational_attainment: "",
    inc_housing_address_id: "",
    incHousing: false,
  });

  const [checkboxes, setCheckboxes] = useState({
    Minister: false,
    Regular: false,
    "Lay Member": false,
    "Minister's Wife": false,
    "Ministerial Student": false,
    Volunteer: false,
  });

  const handleAdvancedFilterChange = (key, value) => {
    setCheckboxes((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDropdownFilterChange = (key, value) => {
    if (key === "district") {
      // Filter locals based on selected district
      const filtered = localCongregations.filter(
        (local) => local.district_id === parseInt(value)
      );
      setFilteredLocals(filtered);
    }

    // ✅ Update advancedFilters instead of checkboxes
    setAdvancedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // All are selected if every value is true
  const allSelected = Object.values(checkboxes).every((val) => val);

  const personnelTypeMap = {
    ministero: "Minister",
    manggagawa: "Worker",
    kawani: "Staff",
    ministersWife: "Minister's Wife",
    ministerialStudent: "Ministerial Student",
  };

  const handleAdvanceSelectAll = (e) => {
    const checked = e.target.checked;

    const newCheckboxes = {
      Minister: checked,
      Regular: checked,
      "Lay Member": checked,
      "Minister's Wife": checked,
      "Ministerial Student": checked,
      Volunteer: checked,
    };

    setCheckboxes(newCheckboxes);
    setAllAdvanceSelected(checked);

    const selectedTypes = checked ? Object.keys(newCheckboxes) : [];

    setSelectedPersonnelTypes(selectedTypes);

    setAdvancedFilters((prev) => ({
      ...prev,
      ...newCheckboxes, // this updates all personnel type keys like Minister, Regular...
      personnel_types: selectedTypes, // optional: if you're using this array
    }));
  };

  const handleCheckboxChange = (key, isChecked) => {
    const mapKey = {
      minister: "Minister",
      regular: "Regular",
      layMember: "Lay Member",
      ministersWife: "Minister's Wife",
      ministerialStudent: "Ministerial Student",
      volunteer: "Volunteer",
    };

    const actualKey = mapKey[key];

    const updatedCheckboxes = {
      ...checkboxes,
      [actualKey]: isChecked,
    };
    setCheckboxes(updatedCheckboxes);

    setAdvancedFilters((prev) => ({
      ...prev,
      [actualKey]: isChecked,
    }));
  };

  const applyAdvancedFilters = () => {
    setAppliedFilters(advancedFilters);
    setCurrentPagePersonnel(1); // Reset to first page
    onCloseAdvance();

    toast({
      title: "Filters applied.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const clearAdvancedFilters = () => {
    const defaultFilters = {
      Minister: false,
      Regular: false,
      "Lay Member": false,
      "Minister's Wife": false,
      "Ministerial Student": false,
      Volunteer: false,
      district: "",
      local: "",
      section: "",
      team: "",
      role: "",
      birthdayMonth: "",
      bloodtype: "",
      language: "",
      citizenship: "",
      civil_status: "",
      educational_attainment: "",
      inc_housing_address_id: "",
      incHousing: false,
    };
    setAdvancedFilters(defaultFilters);
    setAppliedFilters(defaultFilters); // Clear applied filters too immediately? Or wait for Apply? Usually Clear clears everything.
    setCheckboxes({
      Minister: false,
      Regular: false,
      "Lay Member": false,
      "Minister's Wife": false,
      "Ministerial Student": false,
      Volunteer: false,
    });
    setAllAdvanceSelected(false);
    onCloseAdvance();

    toast({
      title: "Filters cleared.",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };



  // Handle incoming filter from PersonnelStatistics
  useEffect(() => {
    if (location.state?.filterType) {
      const filterType = location.state.filterType;

      // Reset all filters first
      const resetFilters = {
        Minister: false,
        Regular: false,
        "Lay Member": false,
        "Minister's Wife": false,
        "Ministerial Student": false,
        Volunteer: false,
        district: "",
        local: "",
        section: "",
        team: "",
        role: "",
        birthdayMonth: "",
        bloodtype: "",
        language: "",
        citizenship: "",
        civil_status: "",
        educational_attainment: "",
        inc_housing_address_id: "",
        incHousing: false,
      };

      // Set the specific filter
      if (filterType && resetFilters.hasOwnProperty(filterType)) {
        resetFilters[filterType] = true;
        setCheckboxes(prev => ({
          ...prev,
          [filterType]: true,
        }));
      }

      setAdvancedFilters(resetFilters);
      setAppliedFilters(resetFilters);

      // Show a toast notification
      toast({
        title: `Filtered by ${filterType || 'All Personnel'}`,
        description: filterType ? `Showing ${filterType} only` : 'Showing all personnel',
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchApps = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/apps`, {
        headers: getAuthHeaders(),
      });

      const appsData = response.data;
      if (!appsData || !Array.isArray(appsData)) {
        throw new Error("Invalid API response structure");
      }

      const normalizedApps = appsData.map((app) => ({
        ...app,
        is_active: isAppActive(app),
      }));
      setApps(normalizedApps); // Set flat list

      // Group apps by application type name instead of ID
      const groupedApps = normalizedApps.reduce((acc, app) => {
        const category = app.app_type || "Others";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(app);
        return acc;
      }, {});

      setCategorizedApps(groupedApps);
    } catch (error) {
      console.error("Failed to load apps:", error);
      setCategorizedApps({});
      setApps([]);
    }
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/users?fast=1`, {
        headers: getAuthHeaders(),
      });
      let userData = Array.isArray(response.data) ? response.data : [];

      // ✅ Apply RBAC Filter
      userData = filterPersonnelData(userData);

      setExistingPersonnel(userData);
      setUsers(userData);
    } catch (error) {
      console.error("Failed to load personnel list:", error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const fetchNewPersonnels = async () => {
    setIsNewPersonnelLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/personnels/new`, {
        headers: getAuthHeaders(), // ✅ Apply authorization headers here
      });
      let data = response.data || [];
      // ✅ Apply RBAC Filter
      data = filterPersonnelData(data);
      setNewPersonnels(data);
    } catch (error) {
      console.error("Failed to load new personnels:", error);
    } finally {
      setIsNewPersonnelLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (useElasticsearch) {
      return searchResults; // Return ES results directly (ignoring other filters for now)
    }
    return existingPersonnel.filter((user) => {
      const personnelFields = [
        user.personnel_givenname || "",
        user.personnel_middlename || "",
        user.personnel_surname_husband || "",
        user.personnel_surname_maiden || "",
        user.personnel_suffix || "",
        user.personnel_nickname || "",
        user.personnel_email || "",
        user.personnel_gender || "",
        user.personnel_civil_status || "",
        user.personnel_local_congregation || "",
        user.personnel_type || "",
        user.personnel_assigned_number || "",
        user.personnel_department_name || "",
        user.personnel_section_name || "",
        user.personnel_subsection_name || "",
        user.personnel_designation_name || "",
        user.personnel_district_name || "",
        user.personnel_language_name || "",
      ];

      const combinedFields = [
        user.username || "",
        user.fullname || `${user.givenName || ""} ${user.sn || ""}`,
        user.email || "",
        ...personnelFields,
      ]
        .join(" ")
        .toLowerCase();

      const {
        incHousing,
        district,
        local,
        section,
        team,
        role,
        birthdayMonth,
        bloodtype,
        language,
        citizenship,
        civil_status,
        educational_attainment,
        inc_housing_address_id,
      } = appliedFilters;

      // Filter for personnel types
      const selectedTypes = [];
      if (appliedFilters.Minister) selectedTypes.push("Minister");
      if (appliedFilters.Regular) selectedTypes.push("Regular");
      if (appliedFilters["Lay Member"]) selectedTypes.push("Lay Member");
      if (appliedFilters["Minister's Wife"]) selectedTypes.push("Minister's Wife");
      if (appliedFilters["Ministerial Student"]) selectedTypes.push("Ministerial Student");
      if (appliedFilters.Volunteer) selectedTypes.push("Volunteer");

      const personnelTypeMatch =
        selectedTypes.length === 0 || selectedTypes.includes(user.personnel_type);

      const matchesAdvancedFilters =
        personnelTypeMatch &&
        (!incHousing || user.personnel_housing === "Yes") &&
        (!district ||
          user.personnel_registered_district_id?.toString() === district) &&
        (!local ||
          user.personnel_registered_local_congregation?.toString() === local) &&
        (!section || user.personnel_section_id?.toString() === section) &&
        (!team || user.personnel_subsection_id?.toString() === team) &&
        (!role || user.designation_id?.toString() === role) &&
        (!birthdayMonth ||
          new Date(user.date_of_birth).toLocaleString("default", {
            month: "long",
          }) === birthdayMonth) &&
        (!bloodtype ||
          user.personnel_bloodtype?.toLowerCase() === bloodtype.toLowerCase()) &&
        (!language || user.p.language_id?.toString() === language) &&
        (!citizenship ||
          user.citizenship?.toLowerCase() === citizenship.toLowerCase()) &&
        (!civil_status ||
          user.personnel_civil_status?.toLowerCase() ===
          civil_status.toLowerCase()) &&
        (!educational_attainment ||
          user.personnel_educational_level?.toLowerCase() ===
          educational_attainment.toLowerCase()) &&
        (!inc_housing_address_id ||
          user.INC_Housing?.toLowerCase() ===
          inc_housing_address_id.toLowerCase());

      return (
        combinedFields.includes(searchPersonnelList.toLowerCase()) &&
        matchesAdvancedFilters
      );
    });
  }, [existingPersonnel, appliedFilters, searchPersonnelList, useElasticsearch, searchResults]);

  const personnelUsers = useMemo(() => {
    return filteredUsers.filter((user) => user.personnel_id !== null);
  }, [filteredUsers]);

  const ldapOnlyUsers = useMemo(() => {
    return filteredUsers.filter((user) => user.personnel_id === null);
  }, [filteredUsers]);

  const uniqueIncHousingAddresses = Array.from(
    new Set(incHousingAddresses.map((address) => address.name))
  );

  // Independent search for Newly Enrolled Personnel (Filters from newPersonnels)
  // Independent search for Newly Enrolled Personnel (Filters from newPersonnels)
  const filteredNewPersonnels = useMemo(() => {
    return newPersonnels.filter((personnel) =>
      `${personnel.givenname || ""} ${personnel.surname_husband || ""} ${personnel.email_address || ""
        } ${personnel.section || ""}`
        .toLowerCase()
        .includes(searchNewPersonnels.toLowerCase())
    );
  }, [newPersonnels, searchNewPersonnels]);

  const totalPagesPersonnel = Math.ceil(personnelUsers.length / ITEMS_PER_PAGE);
  const currentItemsPersonnel = personnelUsers.slice(
    (currentPagePersonnel - 1) * ITEMS_PER_PAGE,
    currentPagePersonnel * ITEMS_PER_PAGE
  );

  const totalPagesLdapOnly = Math.ceil(ldapOnlyUsers.length / ITEMS_PER_PAGE);
  const currentItemsLdapOnly = ldapOnlyUsers.slice(
    (currentPageLdapOnly - 1) * ITEMS_PER_PAGE,
    currentPageLdapOnly * ITEMS_PER_PAGE
  );

  const totalPagesNew = Math.ceil(
    filteredNewPersonnels.length / ITEMS_PER_PAGE
  );

  const currentItemsNew = filteredNewPersonnels.slice(
    (currentPageNew - 1) * ITEMS_PER_PAGE,
    currentPageNew * ITEMS_PER_PAGE
  );

  const [avatars, setAvatars] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchApps();
    fetchNewPersonnels();
    fetchData("groups", setGroups, setStatus, "Failed to load groups.");
  }, []);

  // Fetch 2x2 avatars for the currently visible personnel (batch request)
  useEffect(() => {
    const fetchAvatars = async () => {
      const allItems = [...currentItemsPersonnel, ...currentItemsNew];

      // Only request IDs we haven't already loaded — avoids re-fetching on page nav
      const idsToFetch = allItems
        .map((u) => u.personnel_id)
        .filter((id) => id != null && !avatars[id]);

      if (idsToFetch.length === 0) return;

      try {
        const response = await axios.post(
          `${API_URL}/api/personnel_images/2x2/batch`,
          { ids: idsToFetch },
          { headers: getAuthHeaders() }
        );

        if (response.data.success && response.data.data) {
          const urlMap = {};
          Object.entries(response.data.data).forEach(([id, image_url]) => {
            urlMap[id] = `${API_URL}${image_url}`;
          });

          if (Object.keys(urlMap).length > 0) {
            setAvatars((prev) => ({ ...prev, ...urlMap }));
          }
        }
      } catch (err) {
        // Silently ignore — avatars are non-critical
      }
    };

    if (currentItemsPersonnel.length > 0 || currentItemsNew.length > 0) {
      fetchAvatars();
    }
  }, [currentItemsPersonnel, currentItemsNew]); // Run whenever the page/list changes

  const cancelRef = useRef();
  const avatarInputRef = useRef(null);
  const newPersonnelRef = useRef(null); // Ref for scrolling to new personnel table

  const confirmSave = async () => {
    setIsSavingUser(true);
    let avatarUrlResponse;

    try {
      // If a file is selected, upload the avatar using FormData
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const avatarResponse = await fetch(
          `${API_URL}/api/users/${editingUser?.ID || "new"}/avatar`,
          {
            method: "PUT",
            headers: {
              ...getAuthHeaders(),
            },
            body: formData,
          }
        );

        if (!avatarResponse.ok) {
          throw new Error("Error uploading avatar");
        }

        const avatarData = await avatarResponse.json();
        avatarUrlResponse = avatarData.avatar; // URL of the uploaded avatar
      }

      // Map selected app names to their corresponding IDs, keeping only active apps
      const activeAppMap = new Map(activeApps.map((app) => [app.name, app.id]));
      const appIds = selectedApps
        .filter((appName) => activeAppMap.has(appName))
        .map((appName) => activeAppMap.get(appName));

      // Prepare the payload with the new avatar URL if uploaded
      const newUser = {
        username,
        password: editingUser ? undefined : "M@sunur1n", // Only include password for new users
        fullname,
        email,
        avatar: avatarUrlResponse || avatarUrl, // Use the uploaded avatar URL if available
        availableApps: appIds, // Send clean array of IDs
        app_ids: appIds, // Fallback: some backends prefer snake_case or different naming
      };

      if (editingUser) {
        // Update user information
        await putData(`users/${editingUser.ID}`, newUser);

        const previousGroupId = String(editingUser.groupId || "");
        const nextGroupId = String(selectedGroup || "");

        // Only call the assignment endpoint if the group actually changed.
        if (previousGroupId !== nextGroupId) {
          await handleAssignGroup(editingUser.ID, selectedGroup);
        }

        const resolvedGroupName =
          groups.find((group) => String(group.id) === String(selectedGroup))?.name || "N/A";
        const localPatch = {
          ...newUser,
          availableApps: [...selectedApps],
          groupId: selectedGroup || "",
          groupname: resolvedGroupName,
        };

        setExistingPersonnel((prev) =>
          prev.map((user) =>
            user.ID === editingUser.ID ? { ...user, ...localPatch } : user
          )
        );
        setUsers((prev) =>
          prev.map((user) =>
            user.ID === editingUser.ID ? { ...user, ...localPatch } : user
          )
        );

        closeModal();
        toast({
          title: "Success",
          description: "User updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new user
        const data = await postData("users", newUser);

        // Assign group to the new user
        await handleAssignGroup(data.id, selectedGroup);

        // Add the new user to the local state
        const resolvedGroupName =
          groups.find((group) => String(group.id) === String(selectedGroup))?.name || "N/A";
        const localPatch = {
          ...newUser,
          ID: data.id,
          availableApps: [...selectedApps],
          groupId: selectedGroup || "",
          groupname: resolvedGroupName,
        };

        setExistingPersonnel((prev) => [...prev, localPatch]);
        setUsers((prevUsers) => [
          ...prevUsers,
          {
            ...localPatch,
          },
        ]);
        setStatus("User added successfully.");

        closeModal();
      }
    } catch (error) {
      setStatus(
        editingUser
          ? "Error updating user. Please try again."
          : "Error adding user. Please try again."
      );
      console.error("Error in confirmSave:", error);
    } finally {
      setIsSavingUser(false);
    }
  };



  const handleDeleteUser = (user) => {
    if (!user) return;
    setUserToDelete(user);
    onDeleteOpen();
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    onDeleteClose();

    try {
      if (userToDelete.personnel_id) {
        // Soft delete personnel
        await deleteData("personnels", userToDelete.personnel_id, "Error deleting personnel.");

        toast({
          title: "Deleted",
          description: "Personnel record deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setUsers((prev) => prev.filter((u) => u.personnel_id !== userToDelete.personnel_id));
      } else {
        // Delete user
        if (!userToDelete.ID) throw new Error("User ID missing.");
        await deleteData("users", userToDelete.ID, "Error deleting user.");

        toast({
          title: "Deleted",
          description: "User account deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setUsers((prev) => prev.filter((u) => u.ID !== userToDelete.ID));
      }
      fetchUsers();
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchPersonnelImages1 = async (personnelId) => {
    try {
      // Reuse the generic fetch function
      const data = await fetchDataPhotoshoot(personnelId);

      if (Array.isArray(data) && data.length > 0) {
        const imagesByType = {};

        // Debugging: Log the API response
        console.log("Fetched Personnel Images:", data);

        // Store images based on type
        data.forEach((img) => {
          if (img.type && img.image_url) {
            imagesByType[img.type.trim()] = `${API_URL}${img.image_url}`;
          }
        });

        setPersonnelImages(imagesByType); // Store images in state

        // Debugging: Log the mapped images
        console.log("Mapped Personnel Images:", imagesByType);
      } else {
        console.warn("No personnel images found for ID:", personnelId);
        setPersonnelImages({});
      }
    } catch (error) {
      console.error("Error fetching personnel images:", error);
    }
  };

  const fetchPersonnelImages = async (personnelId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/personnel_images/${personnelId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        const imagesByType = {};

        // Debugging: Log the API response
        // console.log("Fetched Personnel Images:", response.data.data);

        // Store images based on type
        response.data.data.forEach((img) => {
          imagesByType[img.type.trim()] = `${API_URL}${img.image_url}`;
        });

        setPersonnelImages(imagesByType); // Store images in state

        // Debugging: Log the mapped images
        // console.log("Mapped Personnel Images:", imagesByType);
      }
    } catch (error) {
      console.error("Error fetching personnel images:", error);
    }
  };

  const handleEditUser = (item) => {
    setEditingUser(item);
    setUsername(item.username);

    // Extract first name and last name correctly
    const sourceGivenName =
      item.givenName && item.givenName !== "N/A"
        ? item.givenName
        : item.personnel_givenname || "";
    const givenNameParts = sourceGivenName ? sourceGivenName.split(" ") : [""]; // Safe split
    const firstName = givenNameParts[0];
    const lastName =
      (item.sn && item.sn !== "N/A" ? item.sn : null) ||
      item.personnel_surname_husband ||
      item.personnel_surname_maiden ||
      "";

    setFirstName(firstName);
    setLastName(lastName);

    // Use setFullname if needed for display purposes
    setFullname(`${firstName} ${lastName}`.trim());

    setEmail(item.mail || item.email || item.personnel_email || "");
    setAvatarUrl(avatars[item.personnel_id] || (item.avatar ? `${API_URL}${item.avatar}` : ""));

    // Robust handling of availableApps: map objects to names if necessary
    const rawApps = item.availableApps || [];
    const appNames = rawApps
      .map((app) => {
        if (typeof app === "object" && app !== null) {
          return app.name;
        }

        const matchedById = apps.find((candidate) => String(candidate.id) === String(app));
        if (matchedById) {
          return matchedById.name;
        }

        return app;
      })
      .filter(Boolean);
    const visibleAppNames = new Set(activeApps.map((app) => app.name));
    const activeSelection = appNames.filter((appName) => visibleAppNames.has(appName));
    setSelectedApps(activeSelection);

    setSelectAll(
      activeApps.length > 0 &&
      activeApps.every((app) => activeSelection.includes(app.name))
    );
    setSelectedGroup(item.groupId || "");

    onOpen();
  };

  const [forceRender, setForceRender] = useState(false);

  const handleAppChange = (updatedSelection, categoryApps) => {
    // Ensure only valid selections are kept
    setSelectedApps(updatedSelection);

    // Check if all category apps are selected
    const allSelected = categoryApps.every((app) =>
      updatedSelection.includes(app.name)
    );

    // Toggle forceRender to trigger a re-render
    setForceRender((prev) => !prev);
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedApps(activeApps.map((app) => app.name));
      setSelectAll(true);
    } else {
      setSelectedApps([]);
      setSelectAll(false);
    }
  };

  const resetForm = () => {
    setAvatarFile(null);
    setUsername("");
    setFullname("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setAvatarUrl("");
    setSelectedGroup("");
    setSelectedApps([]);
    setSelectAll(false);
    setEditingUser(null);
  };

  const openAddUserModal = () => {
    resetForm();
    onOpen();
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const handleAssignGroup = async (userId, groupId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/users/${userId}/assign-group`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId: groupId || null }), // Pass null if empty
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign group");
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.ID === userId ? { ...user, groupId } : user
        )
      );
      setExistingPersonnel((prevPersonnel) =>
        prevPersonnel.map((user) =>
          user.ID === userId
            ? {
                ...user,
                groupId,
                groupname:
                  groups.find((group) => String(group.id) === String(groupId))
                    ?.name || "N/A",
              }
            : user
        )
      );
      setStatus("Group assigned successfully.");
    } catch (error) {
      console.error("Error in handleAssignGroup:", error);
      setStatus("Error assigning group. Please try again.");
    }
  };

  const handlePageChangePersonnel = (direction) => {
    setCurrentPagePersonnel((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPagesPersonnel)
        : Math.max(prev - 1, 1)
    );
  };

  const handlePageChangeNewPersonnel = (direction) => {
    setCurrentPageNew((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPagesNew)
        : Math.max(prev - 1, 1)
    );
  };

  const handlePageChangeLdapOnly = (direction) => {
    setCurrentPageLdapOnly((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPagesLdapOnly)
        : Math.max(prev - 1, 1)
    );
  };

  // const [loading, setLoading] = useState(false);

  const [loadingSyncUsers, setLoadingSyncUsers] = useState(false); // Loading state for LDAP Sync
  const [loadingSyncPersonnel, setLoadingSyncPersonnel] = useState({}); // Individual loading states for each personnel

  const toast = useToast();

  // Sync to users table for new personnel
  // Open Sync Modal
  const openSyncModal = (personnelId, personnelName) => {
    setSelectedSyncPersonnel({ id: personnelId, name: personnelName });
    setSelectedSyncGroup(""); // Reset group
    onSyncModalOpen();
  };

  // Confirm Sync and Call API
  const confirmSyncToUsers = async () => {
    if (!selectedSyncPersonnel) return;

    const { id: personnelId, name: personnelName } = selectedSyncPersonnel;

    setLoadingSyncPersonnel((prevLoading) => ({
      ...prevLoading,
      [personnelId]: true,
    }));

    try {
      const response = await axios.post(`${API_URL}/api/sync-to-users`, {
        personnelId,
        personnelName,
        groupId: selectedSyncGroup || null, // Pass selected group
      });

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the new personnel table by removing the synced personnel
      setNewPersonnels((prev) =>
        prev.filter((item) => item.personnel_id !== personnelId)
      );

      onSyncModalClose(); // Close modal on success
    } catch (error) {
      console.error("Error syncing to users table:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to sync to users table.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingSyncPersonnel((prevLoading) => ({
        ...prevLoading,
        [personnelId]: false,
      }));
    }
  };

  const handleSyncUsers = async () => {
    setLoadingSyncUsers(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/migrateLdapToPmdLoginUsers`,
        {}, // CRITICAL: Ensure an empty body is explicitly sent for POST requests
        { headers: getAuthHeaders() }
      );

      toast({
        title: "Sync Successful",
        description: response.data.message || "Users have been successfully synchronized from LDAP.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error synchronizing users:", error);

      // CRITICAL FIX: Extract specific error message from the backend's 500 response
      const errorMessage = error.response
        && error.response.data
        && error.response.data.message
        ? error.response.data.message
        : "Failed to synchronize users from LDAP. Please check network/LDAP.";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingSyncUsers(false);
    }
  };

  const handleSyncUsers1 = async () => {
    setLoadingSyncUsers(true);
    try {
      await axios.post(
        `${API_URL}/api/migrateLdapToPmdLoginUsers`,
        {},
        { headers: getAuthHeaders() }
      );
      toast({
        title: "Sync Successful",
        description: "Users have been successfully synchronized from LDAP.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error("Error synchronizing users:", error);
      toast({
        title: "Error",
        description: "Failed to synchronize users from LDAP.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingSyncUsers(false);
    }
  };

  const handleSyncES = async () => {
    setIsSyncingES(true);
    try {
      const response = await axios.post(`${API_URL}/api/users/sync-es`, {}, { headers: getAuthHeaders() });
      toast({ title: "Elasticsearch Sync", description: response.data.message, status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      console.error("Sync Error Details:", error.response?.data || error.message);
      const errorDetail = error.response?.data?.error || error.response?.data?.message || error.message;
      toast({
        title: "Sync Failed",
        description: `Error: ${errorDetail}`,
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSyncingES(false);
    }
  };
  const handleSearchChangePersonnel = async (e) => {
    const val = e.target.value;
    setSearchPersonnelList(val);
    setCurrentPagePersonnel(1);

    if (useElasticsearch && val.length > 2) {
      try {
        const res = await axios.get(`${API_URL}/api/users/search?q=${val}`, { headers: getAuthHeaders() });
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    } else if (useElasticsearch && val.length === 0) {
      setSearchResults([]);
    }
  };

  const handleViewUser = (personnelId) => {
    window.open(`/personnel-preview/${personnelId}`, "_blank");
  };

  const renderActionMenu = (menuItems = []) => {
    const visibleMenuItems = menuItems.filter(Boolean);

    if (visibleMenuItems.length === 0) {
      return null;
    }

    return (
      <Menu placement="bottom-end" isLazy>
        <Tooltip label="More actions">
          <MenuButton
            as={IconButton}
            size="sm"
            variant="ghost"
            colorScheme="gray"
            icon={<FiMoreVertical />}
            aria-label="More actions"
          />
        </Tooltip>
        <MenuList zIndex="popover" minW="220px" py={1}>
          {visibleMenuItems.map((menuItem, index) => (
            <React.Fragment key={`${menuItem.label}-${index}`}>
              {menuItem.dividerBefore && index > 0 && <MenuDivider my={1} />}
              <MenuItem
                icon={
                  <Icon
                    as={menuItem.icon}
                    color={menuItem.iconColor || "gray.500"}
                    boxSize={4}
                  />
                }
                onClick={menuItem.onClick}
                isDisabled={menuItem.isDisabled}
                color={menuItem.color}
              >
                {menuItem.label}
              </MenuItem>
            </React.Fragment>
          ))}
        </MenuList>
      </Menu>
    );
  };

  const currentWebdavUrl = editingUser?.webdav_url || editingUser?.webdavUrl || "";
  const displayWebdavUrl = currentWebdavUrl || "No WebDAV URL yet";

  const handleCopyWebdavUrl = async () => {
    if (!currentWebdavUrl) {
      toast({
        title: "No WebDAV URL",
        description: "This user does not have a WebDAV URL yet.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(currentWebdavUrl);
      toast({
        title: "Copied",
        description: "WebDAV URL copied to clipboard.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to copy WebDAV URL:", error);
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const handleCategorySelectAll = (category, apps, isChecked) => {
    setSelectedApps((prevSelected) => {
      const categoryApps = apps
        .filter((app) => isAppActive(app))
        .map((app) => app.name);

      if (isChecked) {
        // Select all apps in the category
        return [...new Set([...prevSelected, ...categoryApps])];
      } else {
        // Deselect only the apps within this category
        return prevSelected.filter((app) => !categoryApps.includes(app));
      }
    });
  };

  useEffect(() => {
    if (existingPersonnel.length > 0) {
      setColumnVisibility((prev) => {
        // If state is already populated (e.g., during pagination), preserve it to prevent reset
        if (Object.keys(prev).length > 0) return prev;

        const sample = existingPersonnel[0];
        const keys = Object.keys(sample);

        // Try to load from localStorage
        const savedVisibility = localStorage.getItem("userColumnVisibility");
        if (savedVisibility) {
          try {
            const parsed = JSON.parse(savedVisibility);
            if (parsed && Object.keys(parsed).length > 0) {
              // Optional: Merge with current keys to handle new columns in data? 
              // For now, just use saved. 
              return parsed;
            }
          } catch (error) {
            console.error("Error parsing localStorage userColumnVisibility:", error);
          }
        }

        // 2. Fallback to Default columns
        const defaultColumns = [
          "username",
          "avatar",
          "personnel_givenname",
          "personnel_surname_husband",
        ];

        const defaultVisibility = keys.reduce((acc, key) => {
          acc[key] = defaultColumns.includes(key);
          return acc;
        }, {});

        // Save default to localStorage
        localStorage.setItem("userColumnVisibility", JSON.stringify(defaultVisibility));

        return defaultVisibility;
      });
    }
  }, [existingPersonnel]);

  const toggleSelectAll = () => {
    const newValue = !allVisible;
    const updated = {};
    allKeys.forEach((key) => {
      updated[key] = newValue;
    });
    setColumnVisibility(updated);
    localStorage.setItem("userColumnVisibility", JSON.stringify(updated));
  };

  const toggleColumn = (key) => {
    setColumnVisibility((prev) => {
      const newState = {
        ...prev,
        [key]: !prev[key],
      };
      localStorage.setItem("userColumnVisibility", JSON.stringify(newState));
      return newState;
    });
  };

  const exportAsCSV = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      alert("No data to export.");
      return;
    }

    const visibleColumns = Object.keys(columnVisibility).filter(
      (key) => columnVisibility[key]
    );

    const headers = visibleColumns.map((key) =>
      key
        .replace("personnel_", "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );

    // Prepare data matching PDF layout logic
    const data = filteredUsers.map((user) =>
      visibleColumns.map((key) => {
        if (key === "avatar") {
          // Export full URL for avatar
          return avatars[user.personnel_id] || (user.avatar ? `${API_URL}${user.avatar}` : "N/A");
        }
        return user[key] === null || user[key] === undefined ? "" : user[key];
      })
    );

    // Use Papa Parse for robust CSV generation
    const csvContent = Papa.unparse({
      fields: headers,
      data: data,
    });

    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "personnel_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = async () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      alert("No data to export.");
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("Personnel List", 14, 15);

      const visibleColumns = Object.keys(columnVisibility).filter(
        (key) => columnVisibility[key]
      );

      const headers = visibleColumns.map((key) =>
        key
          .replace("personnel_", "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      );

      const avatarColumnIndex = visibleColumns.indexOf("avatar");

      // Helper to load image
      const loadImage = (url) => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "Anonymous";
          img.src = url;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = () => resolve(null);
        });
      };

      // Pre-process data
      const data = await Promise.all(filteredUsers.map(async (user) => {
        const row = [];
        for (const key of visibleColumns) {
          if (key === 'avatar') {
            const avatarUrl = avatars[user.personnel_id] || (user.avatar ? `${API_URL}${user.avatar}` : null);
            let imageData = null;
            if (avatarUrl) {
              imageData = await loadImage(avatarUrl);
            }
            const initials = (user.givenName?.[0] || "") + (user.sn?.[0] || "");
            row.push({ content: '', image: imageData, initials });
          } else {
            row.push(user[key] || "");
          }
        }
        return row;
      }));

      autoTable(doc, {
        startY: 20,
        head: [headers],
        body: data,
        theme: "grid",
        headStyles: { fillColor: [0, 122, 204] },
        styles: { fontSize: 9, minCellHeight: 15, valign: 'middle' },
        didDrawCell: (dataHook) => {
          if (dataHook.section === 'body' && dataHook.column.index === avatarColumnIndex) {
            const cellRaw = dataHook.cell.raw;
            if (cellRaw && typeof cellRaw === 'object') {
              const { image, initials } = cellRaw;
              if (image) {
                doc.addImage(image, 'PNG', dataHook.cell.x + 2, dataHook.cell.y + 2, 11, 11);
              } else {
                // Draw placeholder
                doc.setFillColor(200, 200, 200);
                doc.circle(dataHook.cell.x + 7.5, dataHook.cell.y + 7.5, 5, 'F');
                doc.setFontSize(8);
                doc.setTextColor(255, 255, 255);
                doc.text(initials || "?", dataHook.cell.x + 7.5, dataHook.cell.y + 10, { align: 'center' });
              }
            }
          }
        }
      });

      doc.save("personnel_list.pdf");

    } catch (error) {
      console.error("Export PDF Error:", error);
      alert("Failed to export PDF: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Add this ref
  const rfidInputRef = useRef();

  const {
    isOpen: isRfidModalOpen,
    onOpen: onRfidModalOpen,
    onClose: onRfidModalClose,
  } = useDisclosure();

  const [selectedUserForRfid, setSelectedUserForRfid] = useState(null);
  const [rfidCode, setRfidCode] = useState("");

  useEffect(() => {
    if (isRfidModalOpen && rfidInputRef.current) {
      // Auto-focus input when modal opens
      setTimeout(() => rfidInputRef.current.focus(), 100); // slight delay to ensure DOM is ready
    }
  }, [isRfidModalOpen]);

  const handleRfidSave = async () => {
    console.log("Updating RFID:", {
      personnel_id: selectedUserForRfid, // <-- just use the ID directly
      rfid_code: rfidCode,
    });

    try {
      await axios.put(`${API_URL}/api/users/update-progress`, {
        personnel_id: selectedUserForRfid,
        rfid_code: rfidCode,
      });

      toast({
        title: "RFID updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onRfidModalClose();
      setRfidCode("");
      setSelectedUserForRfid(null);
    } catch (error) {
      console.error("RFID Update Error:", error);

      toast({
        title: "Failed to update RFID.",
        description:
          error?.response?.data?.message ||
          error?.response?.data?.errors?.[0] ||
          "Unknown error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (isRfidModalOpen) {
      setTimeout(() => {
        if (rfidInputRef.current) {
          rfidInputRef.current.focus();
          rfidInputRef.current.select();
        }
      }, 100);
    }
  }, [isRfidModalOpen]);
  const handleKeyDown = (e) => {
    // Allow only Enter key or scanner input, block others
    if (!e.key.match(/[0-9a-zA-Z]/)) {
      e.preventDefault();
    }
  };

  // Avatar Zoom State
  const {
    isOpen: isAvatarZoomOpen,
    onOpen: onAvatarZoomOpen,
    onClose: onAvatarZoomClose,
  } = useDisclosure();
  const [zoomedAvatarSrc, setZoomedAvatarSrc] = useState("");

  const handleAvatarClick = (src) => {
    setZoomedAvatarSrc(src);
    onAvatarZoomOpen();
  };

  return (
    <Box p={{ base: 4, md: 6 }} bg={useColorModeValue("gray.50", "gray.900")} minH="100vh">
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} mb={6} gap={4}>
        <Heading size="lg" color="blue.600">Personnel Management</Heading>

        {/* Sync Users Button */}
        {hasPermission("personnels.syncfromldap") && (
          <Button
            colorScheme="orange"
            leftIcon={<Icon as={FiUser} />}
            isLoading={loadingSyncUsers}
            onClick={handleSyncUsers}
            size="sm"
            shadow="md"
          >
            Sync Users
          </Button>
        )}

        {/* Sync ES Button - HIDDEN for now */}
        {/* <Button
          colorScheme="purple"
          leftIcon={<Icon as={RepeatIcon} />}
          isLoading={isSyncingES}
          onClick={handleSyncES}
          size="sm"
          shadow="md"
          ml={2}
        >
          Sync Search Index
        </Button> */}

      </Flex>

      {/* Controls Bar */}
      <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6} align="center" bg="white" p={4} borderRadius="lg" shadow="sm">
        {/* Search bar for Personnel List */}
        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <InputLeftElement pointerEvents="none"><Search2Icon color="gray.400" /></InputLeftElement>
          <Input
            placeholder="Search personnel..."
            value={searchPersonnelList}
            onChange={handleSearchChangePersonnel}
            variant="filled"
          />
        </InputGroup>

        {/* <FormControl display="flex" alignItems="center" w="auto">
          <FormLabel htmlFor="es-mode" mb="0" fontSize="sm">
            ES Search
          </FormLabel>
          <Switch id="es-mode" isChecked={useElasticsearch} onChange={() => setUseElasticsearch(!useElasticsearch)} />
        </FormControl> */}

        <Tooltip label="Reload List / Clear Search" hasArrow>
          <IconButton
            icon={<RepeatIcon />}
            aria-label="Reload Users"
            onClick={() => {
              setSearchPersonnelList("");
              setAppliedFilters({ // Reset applied filters too if "display all" is intended
                Minister: false,
                Regular: false,
                "Lay Member": false,
                "Minister's Wife": false,
                "Ministerial Student": false,
                district: "",
                local: "",
                section: "",
                team: "",
                role: "",
                birthdayMonth: "",
                bloodtype: "",
                language: "",
                citizenship: "",
                civil_status: "",
                educational_attainment: "",
                inc_housing_address_id: "",
                incHousing: false,
              });
              setAdvancedFilters({ // Reset UI filters state as well
                Minister: false,
                Regular: false,
                "Lay Member": false,
                "Minister's Wife": false,
                "Ministerial Student": false,
                district: "",
                local: "",
                section: "",
                team: "",
                role: "",
                birthdayMonth: "",
                bloodtype: "",
                language: "",
                citizenship: "",
                civil_status: "",
                educational_attainment: "",
                inc_housing_address_id: "",
                incHousing: false,
              });
              setCheckboxes({
                Minister: false,
                Regular: false,
                "Lay Member": false,
                "Minister's Wife": false,
                "Ministerial Student": false,
              });
              setAllAdvanceSelected(false);
              setCurrentPagePersonnel(1);
              fetchUsers();
            }}
            colorScheme="gray"
            variant="outline"
          />
        </Tooltip>

        <HStack spacing={2} ml="auto" w={{ base: "100%", md: "auto" }} justify={{ base: "space-between", md: "flex-end" }}>
          {/* Advanced Search Button */}
          <Tooltip label="Advanced Search">
            <IconButton
              icon={<Search2Icon />}
              aria-label="Advanced Search"
              onClick={onOpenAdvance}
              colorScheme="blue"
              variant="outline"
            />
          </Tooltip>

          {/* Columns Menu */}
          <Menu closeOnSelect={false}>
            <Tooltip label="Toggle Columns">
              <MenuButton as={IconButton} icon={<ViewIcon />} aria-label="Columns" variant="ghost" />
            </Tooltip>
            <MenuList maxHeight="300px" overflowY="auto" minW="250px" px={2} zIndex={10}>
              <Box px={2} py={1}>
                <Checkbox
                  isChecked={allVisible}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelectAll();
                  }}
                  colorScheme="blue"
                >
                  Select All
                </Checkbox>
              </Box>
              <Divider my={2} />
              {allKeys.map((key) => (
                <MenuItem key={key} as="div" _hover={{ bg: "transparent" }}>
                  <Checkbox
                    isChecked={columnVisibility[key]}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleColumn(key);
                    }}
                    colorScheme="blue"
                  >
                    {key
                      .replace("personnel_", "")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (char) => char.toUpperCase())}
                  </Checkbox>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* Export Menu */}
          <Menu>
            <Tooltip label="Export Data">
              <MenuButton as={IconButton} icon={<DownloadIcon />} aria-label="Export" variant="ghost" />
            </Tooltip>
            <MenuList>
              <MenuItem icon={<DownloadIcon />} onClick={exportAsCSV}>Export as CSV</MenuItem>
              <MenuItem icon={isExporting ? <Spinner size="xs" /> : <DownloadIcon />} onClick={exportAsPDF} isDisabled={isExporting}>
                {isExporting ? "Exporting..." : "Export as PDF"}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Stack>


      <Flex direction="column" bg="white" p={4} borderRadius="lg" shadow="md">
        <HStack justify="space-between" mb={4}>
          <Heading size="md" color="gray.700">User Management</Heading>
        </HStack>

        <Tabs variant="enclosed" colorScheme="blue" defaultIndex={0}>
          <TabList>
            <Tab fontWeight="bold">Synced Personnel ({personnelUsers.length})</Tab>
            <Tab fontWeight="bold">LDAP Only ({ldapOnlyUsers.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Tab 1: Synced Personnel */}
            <TabPanel px={0} pt={4}>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Showing {currentItemsPersonnel.length} of {personnelUsers.length} synced records
                </Text>
              </HStack>
              <Box width="100%" overflowX="auto">
                <Table variant="simple" minWidth="900px" size="md" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th py={4} width="96px" color="gray.600" whiteSpace="nowrap" textAlign="center">#</Th>
                      {allKeys.map((key) => columnVisibility[key] && (
                        <Th key={`th-${key}`} py={4} color="gray.600">
                          {key.replace("personnel_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </Th>
                      ))}
                      <Th py={4} width="160px" color="gray.600" textAlign="right">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isUsersLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <Tr key={i}>
                          <Td colSpan={allKeys.filter(k => columnVisibility[k]).length + 2}>
                            <HStack>
                              <SkeletonCircle size="10" />
                              <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight="4" width="100%" />
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      currentItemsPersonnel.map((item, index) => {
                        const avatarSrc = avatars[item.personnel_id] ||
                          (item.avatar
                            ? (item.avatar.startsWith("http") ? item.avatar : `${API_URL}${item.avatar.startsWith("/") ? "" : "/"}${item.avatar}`)
                            : "");

                        return (
                          <Tr key={item.ID} _hover={{ bg: "blue.50" }} transition="background 0.2s">
                            <Td py={5} fontWeight="bold" color="blue.500" whiteSpace="nowrap" textAlign="center">
                              {(currentPagePersonnel - 1) * ITEMS_PER_PAGE + index + 1}
                            </Td>

                            {allKeys.map((key) => columnVisibility[key] && (
                              <Td key={`td-${key}`} py={5}>
                                {key === 'avatar' ? (
                                  <Tooltip label="Click to zoom" placement="top">
                                    <Avatar
                                      size="md"
                                      src={avatarSrc}
                                      name={`${item.givenName || item.personnel_givenname || "N/A"} ${item.sn || item.personnel_surname_husband || "N/A"}`}
                                      cursor="pointer"
                                      border="2px solid white"
                                      boxShadow="sm"
                                      _hover={{ transform: "scale(1.5)", zIndex: 10, borderColor: "blue.400" }}
                                      transition="all 0.2s"
                                      onClick={() => handleAvatarClick(avatarSrc)}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/default-avatar.png";
                                      }}
                                    />
                                  </Tooltip>
                                ) : (
                                  <Text fontSize="sm" color="gray.700" isTruncated>
                                    {item[key] !== null && item[key] !== undefined ? String(item[key]) : ""}
                                  </Text>
                                )}
                              </Td>
                            ))}

                            <Td py={5} textAlign="right">
                              <HStack spacing={2} justify="flex-end" flexWrap="nowrap">
                                {hasPermission("personnels.edit") && (
                                  <Tooltip label="Edit User">
                                    <Button size="sm" colorScheme="yellow" leftIcon={<EditIcon />} onClick={() => handleEditUser(item)} whiteSpace="nowrap">
                                      Edit
                                    </Button>
                                  </Tooltip>
                                )}
                                {renderActionMenu([
                                  hasPermission("personnels.photo") && {
                                    label: "Photo",
                                    icon: FaCamera,
                                    iconColor: "teal.500",
                                    onClick: () => {
                                      setSelectedUser(item);
                                      setIsPhotoModalOpen(true);
                                    },
                                  },
                                  hasPermission("personnels.edit_rfid_code") && {
                                    label: "Credentials",
                                    icon: FaIdCard,
                                    iconColor: "blue.500",
                                    onClick: () => {
                                      setSelectedUserForRfid(item.personnel_id);
                                      setRfidCode(item.rfid_code || "");
                                      onRfidModalOpen();
                                    },
                                  },
                                  hasPermission("personnels.view") && {
                                    label: "View",
                                    icon: ViewIcon,
                                    iconColor: "purple.500",
                                    onClick: () => handleViewUser(item.personnel_id),
                                    isDisabled: !item.personnel_id,
                                  },
                                  hasPermission("personnels.info") && {
                                    label: "Info",
                                    icon: InfoIcon,
                                    iconColor: "orange.500",
                                    onClick: () => {
                                      window.location.href = `/enroll?personnel_id=${item.personnel_id}&type=edituser`;
                                    },
                                  },
                                  hasPermission("personnels.delete") && {
                                    label: "Delete",
                                    icon: DeleteIcon,
                                    iconColor: "red.500",
                                    color: "red.500",
                                    dividerBefore: true,
                                    onClick: (e) => {
                                      e?.stopPropagation?.();
                                      handleDeleteUser(item);
                                    },
                                  },
                                ])}
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>
              </Box>
              <Flex justify="center" align="center" mt={6} borderTop="1px solid" borderColor="gray.100" pt={4} gap={4}>
                <Button size="sm" onClick={() => handlePageChangePersonnel("previous")} isDisabled={currentPagePersonnel === 1} variant="outline">Previous</Button>
                <Text fontSize="sm" fontWeight="bold">Page {currentPagePersonnel} of {totalPagesPersonnel}</Text>
                <Button size="sm" onClick={() => handlePageChangePersonnel("next")} isDisabled={currentPagePersonnel === totalPagesPersonnel} variant="outline">Next</Button>
              </Flex>
            </TabPanel>

            {/* Tab 2: LDAP Only Users */}
            <TabPanel px={0} pt={4}>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Showing {currentItemsLdapOnly.length} of {ldapOnlyUsers.length} LDAP-only records
                </Text>
              </HStack>
              <Box width="100%" overflowX="auto">
                <Table variant="simple" minWidth="820px" size="md" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th py={4} width="96px" color="gray.600" whiteSpace="nowrap" textAlign="center">#</Th>
                      <Th py={4} width="18%" color="gray.600">Username/UID</Th>
                      <Th py={4} width="34%" color="gray.600">Full Name (from LDAP)</Th>
                      <Th py={4} width="16%" color="gray.600">Group Name</Th>
                      <Th py={4} width="16%" color="gray.600">Password</Th>
                      <Th py={4} width="16%" color="gray.600" textAlign="right">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {isUsersLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <Tr key={i}>
                          <Td colSpan={5}>
                            <HStack>
                              <SkeletonCircle size="10" />
                              <SkeletonText mt="4" noOfLines={1} spacing="4" skeletonHeight="4" width="100%" />
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    ) : ldapOnlyUsers.length === 0 ? (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={10}>
                          <VStack spacing={2}>
                            <Icon as={FiUsers} boxSize={8} color="gray.300" />
                            <Text color="gray.500">No LDAP-only users found. Try syncing.</Text>
                          </VStack>
                        </Td>
                      </Tr>
                    ) : (
                      currentItemsLdapOnly.map((item, index) => (
                        <Tr key={item.ID} _hover={{ bg: "orange.50" }} transition="background 0.2s">
                          <Td py={5} fontWeight="bold" color="orange.500" whiteSpace="nowrap" textAlign="center">
                            {(currentPageLdapOnly - 1) * ITEMS_PER_PAGE + index + 1}
                          </Td>
                          <Td py={5}>
                            <Badge colorScheme="orange" variant="outline">{item.username}</Badge>
                          </Td>
                          <Td py={5} fontWeight="medium" color="gray.700" isTruncated>
                            {`${item.givenName || ""} ${item.sn || ""}`.trim() || item.username}
                          </Td>
                          <Td py={5}>
                            <Badge colorScheme={item.groupId ? "blue" : "gray"}>
                              {groups.find(g => g.id === item.groupId)?.name || "N/A"}
                            </Badge>
                          </Td>
                          <Td py={5}>
                            <HStack spacing={2}>
                              <Text fontSize="sm" fontFamily="monospace">
                                ••••••••
                              </Text>
                              <Tooltip label="Reset Password">
                                <IconButton
                                  size="xs"
                                  icon={<Icon as={FiRefreshCw} />}
                                  colorScheme="blue"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedLdapUser(item);
                                    onResetPasswordModalOpen();
                                  }}
                                  aria-label="Reset Password"
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                          <Td py={5} textAlign="right">
                            <HStack spacing={2} justify="flex-end" flexWrap="nowrap">
                              {hasPermission("personnels.edit") && (
                                <Tooltip label="Edit User">
                                  <Button
                                    size="sm"
                                    colorScheme="yellow"
                                    leftIcon={<EditIcon />}
                                    onClick={() => handleEditUser(item)}
                                    whiteSpace="nowrap"
                                  >
                                    Edit
                                  </Button>
                                </Tooltip>
                              )}
                              {renderActionMenu([
                                {
                                  label: "Info",
                                  icon: <InfoIcon />,
                                  onClick: () => {
                                    window.location.href = `/enroll?not_enrolled=${item.username}&type=edituser`;
                                  },
                                },
                                hasPermission("personnels.delete") && {
                                  label: "Delete",
                                  icon: <DeleteIcon />,
                                  color: "red.500",
                                  dividerBefore: true,
                                  onClick: (e) => {
                                    e?.stopPropagation?.();
                                    handleDeleteUser(item);
                                  },
                                },
                              ])}
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
              <Flex justify="center" align="center" mt={6} borderTop="1px solid" borderColor="gray.100" pt={4} gap={4}>
                <Button size="sm" onClick={() => handlePageChangeLdapOnly("previous")} isDisabled={currentPageLdapOnly === 1} variant="outline">Previous</Button>
                <Text fontSize="sm" fontWeight="bold">Page {currentPageLdapOnly} of {totalPagesLdapOnly}</Text>
                <Button size="sm" onClick={() => handlePageChangeLdapOnly("next")} isDisabled={currentPageLdapOnly === totalPagesLdapOnly} variant="outline">Next</Button>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs >
      </Flex >

      <Divider my={8} borderColor="gray.200" borderStyle="dashed" />

      {
        hasPermission("personnels.newly_enrolled_personnel") && (
          <Box
            ref={newPersonnelRef}
            bg="white"
            p={6}
            borderRadius="xl"
            shadow="lg"
            border="1px solid"
            borderColor="gray.100"
            className="new-personnel-section"
          >
            <Flex
              justify="space-between"
              align={{ base: "start", md: "center" }}
              mb={6}
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <Box>
                <Heading size="md" color="blue.600" mb={1}>
                  Newly Enrolled Personnel
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Manage and review the latest personnel enrollments ready for syncing.
                </Text>
              </Box>

              <InputGroup maxW="350px" size="md">
                <InputLeftElement pointerEvents="none" children={<Search2Icon color="gray.400" />} />
                <Input
                  placeholder="Search name, email, or section..."
                  value={searchNewPersonnels}
                  onChange={(e) => setSearchNewPersonnels(e.target.value)}
                  borderRadius="full"
                  focusBorderColor="blue.500"
                  bg="gray.50"
                  _focus={{ bg: "white", shadow: "md" }}
                />
              </InputGroup>
            </Flex>

            <Box overflowX="auto" borderRadius="lg" border="1px solid" borderColor="gray.100">
              <Table variant="simple" size="md" minWidth="860px" style={{ tableLayout: "fixed" }}>
                <Thead bg="gray.50">
                  <Tr>
                    <Th py={5} width="80px" color="gray.600">#</Th>
                    <Th py={5} width="44%" color="gray.600">Personnel Details</Th>
                    <Th py={5} width="32%" color="gray.600">Section</Th>
                    <Th py={5} width="180px" color="gray.600" textAlign="right">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {isNewPersonnelLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Tr key={i}>
                        <Td colSpan={5} py={5}>
                          <SkeletonText noOfLines={1} spacing="4" skeletonHeight="20px" />
                        </Td>
                      </Tr>
                    ))
                  ) : filteredNewPersonnels.length === 0 ? (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                        <VStack spacing={2}>
                          <InfoIcon boxSize={6} color="gray.300" />
                          <Text>No newly enrolled personnel found.</Text>
                        </VStack>
                      </Td>
                    </Tr>
                  ) : (
                    currentItemsNew.map((personnel, index) => {
                      const rowNumber = (currentPageNew - 1) * ITEMS_PER_PAGE + index + 1;
                      return (
                        <Tr
                          key={personnel.personnel_id}
                          _hover={{ bg: "blue.50", transition: "all 0.2s" }}
                        >
                          <Td py={5}>
                            <HStack spacing={2}>
                              <Text fontWeight="bold" color="blue.500" minW="20px">{rowNumber}</Text>
                              <Badge colorScheme="purple" variant="subtle" px={2} borderRadius="md" fontSize="xs">
                                {personnel.personnel_id}
                              </Badge>
                            </HStack>
                          </Td>
                          <Td py={5}>
                            <HStack spacing={3}>
                              <Tooltip label="Click to zoom" placement="top">
                                <Avatar
                                  size="md"
                                  name={`${personnel.givenname} ${personnel.surname_husband}`}
                                  src={avatars[personnel.personnel_id] || undefined}
                                  border="2px solid white"
                                  boxShadow="sm"
                                  cursor="pointer"
                                  onClick={() => avatars[personnel.personnel_id] && handleAvatarClick(avatars[personnel.personnel_id])}
                                />
                              </Tooltip>
                              <Box>
                                <Text fontWeight="bold" fontSize="sm" color="gray.700" whiteSpace="nowrap">
                                  {`${personnel.givenname} ${personnel.surname_husband}`}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {personnel.email_address}
                                </Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td py={5} color="gray.600" isTruncated>{personnel.section || "N/A"}</Td>
                          {/* Actions will continue below... */}
                          <Td py={5} textAlign="right">
                            <HStack spacing={2} justify="flex-end" flexWrap="nowrap">
                              {hasPermission("personnels.sync_to_users") && (
                                <Tooltip label="Sync to Users Table">
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    leftIcon={<Icon as={FiRefreshCw} boxSize={4} />}
                                    onClick={() => openSyncModal(personnel.personnel_id, `${personnel.givenname} ${personnel.surname_husband}`)}
                                    isLoading={loadingSyncPersonnel && loadingSyncPersonnel[personnel.personnel_id]}
                                    isDisabled={personnel.personnel_progress !== "8"}
                                    whiteSpace="nowrap"
                                    boxShadow="sm"
                                  >
                                    Sync
                                  </Button>
                                </Tooltip>
                              )}
                              {renderActionMenu([
                                {
                                  label: "View",
                                  icon: ViewIcon,
                                  iconColor: "purple.500",
                                  onClick: () => window.open(`/personnel-preview/${personnel.personnel_id}`, "_blank"),
                                },
                                {
                                  label: "Info",
                                  icon: InfoIcon,
                                  iconColor: "orange.500",
                                  onClick: () => {
                                    window.location.href = `/enroll?personnel_id=${personnel.personnel_id}&type=edituser`;
                                  },
                                },
                                hasPermission("personnels.photo") && {
                                  label: "Photo",
                                  icon: FaCamera,
                                  iconColor: "teal.500",
                                  onClick: () => {
                                    setSelectedUser(personnel);
                                    setIsPhotoModalOpen(true);
                                  },
                                },
                                hasPermission("personnels.edit_rfid_code") && {
                                  label: "Credentials",
                                  icon: FaIdCard,
                                  iconColor: "blue.500",
                                  onClick: () => {
                                    setSelectedUserForRfid(personnel.personnel_id);
                                    setRfidCode(personnel.rfid_code || "");
                                    onRfidModalOpen();
                                  },
                                },
                              ])}
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </Box>

            <Flex justify="center" align="center" mt={6} borderTop="1px solid" borderColor="gray.100" pt={4} w="100%" gap={4}>
              <Button
                size="sm"
                onClick={() => handlePageChangeNewPersonnel("previous")}
                isDisabled={currentPageNew === 1}
                variant="outline"
                leftIcon={<Icon as={props => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>} />}
              >
                Previous
              </Button>
              <Text fontSize="sm" fontWeight="bold" color="gray.600">
                Page {currentPageNew} of {totalPagesNew || 1}
              </Text>
              <Button
                size="sm"
                onClick={() => handlePageChangeNewPersonnel("next")}
                isDisabled={currentPageNew === totalPagesNew}
                variant="outline"
                rightIcon={<Icon as={props => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>} />}
              >
                Next
              </Button>
            </Flex>
          </Box>
        )
      }

      <Modal isOpen={isRfidModalOpen} onClose={onRfidModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update RFID Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>RFID Code</FormLabel>
              <Input
                ref={rfidInputRef}
                placeholder="Scan or enter RFID"
                value={rfidCode}
                onChange={(e) => setRfidCode(e.target.value)}
                onFocus={(e) => e.target.select()}
                onKeyDown={handleKeyDown}
                style={{
                  caretColor: "transparent", // hide blinking cursor
                  pointerEvents: "auto", // allow focus
                }}
                autoComplete="off"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onRfidModalClose}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={handleRfidSave} ml={3}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <b>{userToDelete?.username || userToDelete?.fullname}</b>?
              <br />
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteUser} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {isOpen && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={100011}
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={{ base: 3, md: 6 }}
            py={{ base: 3, md: 6 }}
            onClick={closeModal}
          >
            <Box
              position="absolute"
              inset={0}
              bg="blackAlpha.600"
              backdropFilter="blur(4px)"
              zIndex={0}
            />

            <Box
              position="relative"
              zIndex={1}
              w="full"
              maxW="6xl"
              maxH="92vh"
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="2xl"
              boxShadow="0 30px 80px rgba(15, 23, 42, 0.22)"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              onClick={(event) => event.stopPropagation()}
            >
              <Box
                position="relative"
                bgGradient={SIDEBAR_GRADIENT}
                py={4}
                px={5}
                pr={14}
                borderBottom="1px solid"
                borderColor="whiteAlpha.700"
              >
                <Flex align="center" justify="space-between" gap={4} wrap="wrap">
                  <Box>
                    <Text fontSize="xl" fontWeight="bold" color="gray.900">
                      {editingUser ? "Edit User" : "Add User"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Keep identity, group, and app access in one clean view.
                    </Text>
                  </Box>
                  {editingUser && (
                    <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                      Editing {username || "User"}
                    </Badge>
                  )}
                </Flex>

                <IconButton
                  aria-label="Close modal"
                  icon={<CloseIcon boxSize={3} />}
                  onClick={closeModal}
                  position="absolute"
                  top={3}
                  right={3}
                  size="sm"
                  borderRadius="full"
                  bg="whiteAlpha.700"
                  color="gray.700"
                  _hover={{
                    bg: "white",
                    transform: "translateY(-1px)",
                    boxShadow: "md",
                  }}
                  transition="all 0.2s ease"
                />
              </Box>

              <Box flex="1" minH={0} bg="gray.50" p={4} css={THIN_SCROLLBAR_STYLES} overflowY="auto">
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4} alignItems="start">
                    <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm">
                      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
                        Profile
                      </Text>
                      <Flex direction={{ base: "column", sm: "row" }} gap={4} align="center">
                        <Tooltip label="Click to view larger" hasArrow placement="top">
                          <Box
                            border="4px solid rgba(255,255,255,0.9)"
                            borderRadius="full"
                            boxShadow="lg"
                            bg="white"
                            p={1}
                            cursor="zoom-in"
                            transition="transform 0.25s ease, box-shadow 0.25s ease"
                            _hover={{
                              transform: "scale(1.06)",
                              boxShadow: "xl",
                            }}
                            onClick={() => handleAvatarClick(avatarUrl || "/default-avatar.png")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleAvatarClick(avatarUrl || "/default-avatar.png");
                              }
                            }}
                          >
                            <Avatar size="xl" src={avatarUrl} name={fullname || username || "User"} />
                          </Box>
                        </Tooltip>
                        <VStack align="stretch" spacing={3} w="full">
                          <Box>
                            <Text fontWeight="semibold" color="gray.800">
                              {editingUser ? "Update user details" : "Create a new account"}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Use a square image for the cleanest preview.
                            </Text>
                          </Box>
                          <FormControl>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">
                              WebDAV URL
                            </FormLabel>
                            <InputGroup size="sm">
                              <Input
                                value={displayWebdavUrl}
                                isReadOnly
                                variant="filled"
                                fontFamily="mono"
                                fontSize="xs"
                                color="gray.700"
                                bg="gray.50"
                                pr="3rem"
                              />
                              <InputRightElement width="3rem">
                                <Tooltip label="Copy WebDAV URL">
                                  <IconButton
                                    aria-label="Copy WebDAV URL"
                                    size="xs"
                                    icon={<CopyIcon />}
                                    variant="ghost"
                                    colorScheme="blue"
                                    isDisabled={!currentWebdavUrl}
                                    onClick={handleCopyWebdavUrl}
                                  />
                                </Tooltip>
                              </InputRightElement>
                            </InputGroup>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">
                              Avatar
                            </FormLabel>
                            <Input
                              ref={avatarInputRef}
                              type="file"
                              accept="image/*"
                              display="none"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setAvatarFile(file);
                                  const reader = new FileReader();
                                  reader.onload = (event) => setAvatarUrl(event.target.result);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <HStack spacing={3} align="center" wrap="wrap">
                              <Button
                                size="sm"
                                leftIcon={<Icon as={FiUpload} />}
                                variant="solid"
                                bgGradient="linear(to-r, blue.500, cyan.500)"
                                color="white"
                                borderRadius="full"
                                onClick={() => avatarInputRef.current?.click()}
                                boxShadow="md"
                                _hover={{
                                  bgGradient: "linear(to-r, blue.600, cyan.600)",
                                  transform: "translateY(-1px)",
                                  boxShadow: "lg",
                                }}
                                transition="all 0.2s ease"
                              >
                                Choose file
                              </Button>
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                noOfLines={1}
                                px={3}
                                py={1}
                                borderRadius="full"
                                bg="gray.100"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                {avatarFile?.name || "No file selected"}
                              </Text>
                            </HStack>
                          </FormControl>
                        </VStack>
                      </Flex>
                    </Box>

                    <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm">
                      <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>
                        Account
                      </Text>
                      <VStack spacing={3} align="stretch">
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" mb={1} color="gray.600">
                            Username
                          </FormLabel>
                          <Input
                            size="sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Username"
                            isDisabled={!!editingUser}
                          />
                        </FormControl>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">
                              First Name
                            </FormLabel>
                            <Input
                              size="sm"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Enter First Name"
                              isDisabled={!!editingUser}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">
                              Last Name
                            </FormLabel>
                            <Input
                              size="sm"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Enter Last Name"
                              isDisabled={!!editingUser}
                            />
                          </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                          <FormControl isRequired>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">
                              Email
                            </FormLabel>
                            <Input
                              size="sm"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter Email"
                              isDisabled={!!editingUser}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel fontSize="xs" mb={1} color="gray.600">
                              Group Name
                            </FormLabel>
                            <Select
                              size="sm"
                              placeholder="Assign Group"
                              value={selectedGroup || ""}
                              onChange={(e) => setSelectedGroup(e.target.value)}
                              variant="outline"
                              bg="white"
                              borderRadius="full"
                              borderColor="gray.200"
                              focusBorderColor="blue.400"
                              iconColor="blue.500"
                              boxShadow="sm"
                              _hover={{
                                borderColor: "blue.300",
                                bg: "gray.50",
                              }}
                            >
                              {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name}
                                </option>
                              ))}
                            </Select>
                          </FormControl>
                        </SimpleGrid>
                      </VStack>
                    </Box>
                  </SimpleGrid>

                  <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="gray.100" shadow="sm">
                    <Flex align="center" justify="space-between" mb={3} gap={3} wrap="wrap">
                      <Box>
                        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                          Available Apps
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Only active apps are shown. Disabled apps stay hidden by system settings.
                        </Text>
                      </Box>
                      <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full">
                        {selectedApps.length} selected
                      </Badge>
                    </Flex>

                    {hasVisibleApps ? (
                      <Box maxH={{ base: "none", lg: "42vh" }} overflowY="auto" pr={1} css={THIN_SCROLLBAR_STYLES}>
                        <VStack spacing={3} align="stretch">
                          {Object.entries(categorizedApps).map(([category, apps]) => {
                            const selectableApps = apps.filter((app) => isAppActive(app));
                            if (selectableApps.length === 0) return null;
                            const allSelected =
                              selectableApps.length > 0 &&
                              selectableApps.every((app) => selectedApps.includes(app.name));

                            return (
                              <Box
                                key={category}
                                p={3}
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="gray.100"
                                bg="gray.50"
                              >
                                <Flex align="center" justify="space-between" mb={2} gap={3} wrap="wrap">
                                  <Text fontWeight="semibold" fontSize="sm" color="gray.700">
                                    {category === "1" ? "General Apps" : category}
                                  </Text>
                                  <Checkbox
                                    size="sm"
                                    isChecked={allSelected}
                                    onChange={(e) =>
                                      handleCategorySelectAll(
                                        category,
                                        apps,
                                        e.target.checked
                                      )
                                    }
                                    colorScheme="blue"
                                  >
                                    Select All
                                  </Checkbox>
                                </Flex>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} pl={1}>
                                  {selectableApps.map((app) => {
                                    const isChecked = selectedApps.includes(app.name);
                                    return (
                                      <Checkbox
                                        key={app.id}
                                        size="sm"
                                        isChecked={isChecked}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setSelectedApps((prev) => {
                                            if (checked) {
                                              return [...prev, app.name];
                                            }
                                            return prev.filter((name) => name !== app.name);
                                          });
                                        }}
                                        colorScheme="blue"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        _hover={{
                                          bg: "white",
                                          transition: "0.2s ease-in-out",
                                        }}
                                      >
                                        <HStack as="span" spacing={2} display="inline-flex" alignItems="center">
                                          <Avatar
                                            size="xs"
                                            src={app.icon || undefined}
                                            name={app.name}
                                            bg="blue.50"
                                            color="blue.700"
                                            borderRadius="md"
                                          />
                                          <Text as="span" fontSize="sm">
                                            {app.name}
                                          </Text>
                                        </HStack>
                                      </Checkbox>
                                    );
                                  })}
                                </SimpleGrid>
                              </Box>
                            );
                          })}
                        </VStack>
                      </Box>
                    ) : (
                      <Text mt={2} color="gray.500" fontSize="sm">
                        No active apps available
                      </Text>
                    )}
                  </Box>
                </VStack>
              </Box>

              <Flex
                bg="white"
                borderTop="1px solid"
                borderColor="gray.200"
                py={4}
                px={4}
                gap={3}
                align="center"
              >
                <Button
                  onClick={closeModal}
                  variant="outline"
                  mr="auto"
                  borderRadius="full"
                  borderColor="gray.300"
                  bg="white"
                  color="gray.700"
                  px={5}
                  _hover={{
                    bg: "gray.50",
                    borderColor: "gray.400",
                    transform: "translateY(-1px)",
                    boxShadow: "sm",
                  }}
                  transition="all 0.2s ease"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={confirmSave}
                  isLoading={isSavingUser}
                  loadingText={editingUser ? "Saving" : "Adding"}
                  borderRadius="full"
                  boxShadow="md"
                  px={6}
                >
                  {editingUser ? "Save Changes" : "Add User"}
                </Button>
              </Flex>
            </Box>
          </Box>
        </Portal>
      )}

      {/* Photoshoot Modal */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => {
          setIsPhotoModalOpen(false);
          if (selectedUser) {
            fetchPersonnelImages(selectedUser.personnel_id); // ✅ Fetch latest images after closing modal
          }
        }}
        size="xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Photoshoot and Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <Photoshoot
                personnel={selectedUser}
                onClose={() => {
                  setIsPhotoModalOpen(false);
                  fetchPersonnelImages(selectedUser.personnel_id); // ✅ Ensure images are refreshed
                }}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                setIsPhotoModalOpen(false);
                fetchPersonnelImages(selectedUser.personnel_id); // ✅ Fetch latest images on Close button click
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenAdvance} onClose={onCloseAdvance} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Advanced Personnel Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch" pb={4}>
              <Box bg="gray.50" p={3} borderRadius="md">
                <Text fontWeight="bold" mb={2} fontSize="sm" color="gray.600">Personnel Types</Text>
                <Checkbox
                  isChecked={allAdvanceSelected}
                  onChange={handleAdvanceSelectAll}
                  colorScheme="blue"
                  mb={2}
                >
                  Select All
                </Checkbox>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                  <Checkbox isChecked={checkboxes.Minister} onChange={(e) => handleCheckboxChange("minister", e.target.checked)}>Minister</Checkbox>
                  <Checkbox isChecked={checkboxes.Regular} onChange={(e) => handleCheckboxChange("regular", e.target.checked)}>Regular</Checkbox>
                  <Checkbox isChecked={checkboxes["Lay Member"]} onChange={(e) => handleCheckboxChange("layMember", e.target.checked)}>Lay Member</Checkbox>
                  <Checkbox isChecked={checkboxes["Minister's Wife"]} onChange={(e) => handleCheckboxChange("ministersWife", e.target.checked)}>Minister's Wife</Checkbox>
                  <Checkbox isChecked={checkboxes["Ministerial Student"]} onChange={(e) => handleCheckboxChange("ministerialStudent", e.target.checked)}>Ministerial Student</Checkbox>
                  <Checkbox isChecked={checkboxes.Volunteer} onChange={(e) => handleCheckboxChange("volunteer", e.target.checked)}>Volunteer</Checkbox>
                </SimpleGrid>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">District</FormLabel>
                  <Select placeholder="All Districts" value={advancedFilters.district} onChange={(e) => handleDropdownFilterChange("district", e.target.value)}>
                    {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Local</FormLabel>
                  <Select placeholder="All Locals" value={advancedFilters.local} onChange={(e) => handleDropdownFilterChange("local", e.target.value)}>
                    {filteredLocals.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Section</FormLabel>
                  <Select placeholder="All Sections" value={advancedFilters.section} onChange={(e) => handleDropdownFilterChange("section", e.target.value)}>
                    {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Team (Subsection)</FormLabel>
                  <Select placeholder="All Teams" value={advancedFilters.team} onChange={(e) => handleDropdownFilterChange("team", e.target.value)}>
                    {subsections.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Designation / Role</FormLabel>
                  <Select placeholder="All Roles" value={advancedFilters.role} onChange={(e) => handleDropdownFilterChange("role", e.target.value)}>
                    {designations.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Birthday Month</FormLabel>
                  <Select placeholder="All Months" value={advancedFilters.birthdayMonth} onChange={(e) => handleDropdownFilterChange("birthdayMonth", e.target.value)}>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Blood Type</FormLabel>
                  <Select placeholder="All Blood Types" value={advancedFilters.bloodtype} onChange={(e) => handleDropdownFilterChange("bloodtype", e.target.value)}>
                    {bloodtypes.filter(bt => bt && bt.trim() !== "").map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Language</FormLabel>
                  <Select placeholder="All Languages" value={advancedFilters.language} onChange={(e) => handleDropdownFilterChange("language", e.target.value)}>
                    {languages.map((lang) => <option key={lang.id} value={lang.id}>{lang.name}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Citizenship</FormLabel>
                  <Select placeholder="All Citizenships" value={advancedFilters.citizenship} onChange={(e) => handleDropdownFilterChange("citizenship", e.target.value)}>
                    {citizenships.map((c) => <option key={c.id} value={c.id}>{c.citizenship}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Civil Status</FormLabel>
                  <Select placeholder="All Statuses" value={advancedFilters.civil_status} onChange={(e) => handleDropdownFilterChange("civil_status", e.target.value)}>
                    {civilStatusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Educational Attainment</FormLabel>
                  <Select placeholder="All Levels" value={advancedFilters.educational_attainment} onChange={(e) => handleDropdownFilterChange("educational_attainment", e.target.value)}>
                    {educationalLevelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">INC Housing Address</FormLabel>
                  <Select placeholder="All Addresses" value={advancedFilters.inc_housing_address_id} onChange={(e) => handleDropdownFilterChange("inc_housing_address_id", e.target.value)}>
                    {uniqueIncHousingAddresses.map((name, index) => <option key={index} value={name}>{name}</option>)}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50" py={3}>
            <Button variant="ghost" mr="auto" colorScheme="red" onClick={clearAdvancedFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={onCloseAdvance} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={applyAdvancedFilters}>
              Apply Filters
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Avatar Zoom Modal */}
      {isAvatarZoomOpen && (
        <Portal>
          <Box
            position="fixed"
            inset={0}
            zIndex={100060}
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={4}
            py={4}
            onClick={onAvatarZoomClose}
          >
            <Box
              position="absolute"
              inset={0}
              bg="blackAlpha.600"
              backdropFilter="blur(5px)"
              zIndex={0}
            />
            <Box
              position="relative"
              zIndex={1}
              maxW="90vw"
              maxH="90vh"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={zoomedAvatarSrc || "https://bit.ly/broken-link"}
                alt="Zoomed Avatar"
                borderRadius="md"
                boxShadow="2xl"
                maxH="90vh"
                objectFit="contain"
                cursor="pointer"
              />
            </Box>
          </Box>
        </Portal>
      )}
      {/* Sync User Modal */}
      <Modal isOpen={isSyncModalOpen} onClose={onSyncModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sync Personnel to User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              You are about to promote <strong>{selectedSyncPersonnel?.name}</strong> to a User account.
            </Text>
            <FormControl>
              <FormLabel>Assign Group (Optional)</FormLabel>
              <Select
                placeholder="Select Group"
                value={selectedSyncGroup}
                onChange={(e) => setSelectedSyncGroup(e.target.value)}
              >
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onSyncModalClose}>Cancel</Button>
            <Button
              colorScheme="green"
              onClick={confirmSyncToUsers}
              ml={3}
              isLoading={selectedSyncPersonnel && loadingSyncPersonnel[selectedSyncPersonnel.id]}
            >
              Sync User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* LDAP Reset Password Modal */}
      <Modal isOpen={isResetPasswordModalOpen} onClose={onResetPasswordModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reset LDAP Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box bg="orange.50" p={3} borderRadius="md" borderLeft="4px solid" borderColor="orange.400" w="100%">
                <Text fontSize="sm" color="orange.800">
                  You are resetting the password for <strong>{selectedLdapUser?.username}</strong>.
                  This will update the LDAP directory directly.
                </Text>
              </Box>
              <FormControl isRequired>
                <FormLabel>New Temporary Password</FormLabel>
                <Input
                  type="password"
                  value={newLdapPassword}
                  onChange={(e) => setNewLdapPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onResetPasswordModalClose}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleLdapPasswordReset}
              ml={3}
              isLoading={isResettingPassword}
              isDisabled={!newLdapPassword}
            >
              Reset Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box >
  );
};

export default Users;
