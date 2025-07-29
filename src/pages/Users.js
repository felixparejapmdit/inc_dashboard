import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Table,
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
  Icon,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  InfoIcon,
  ViewIcon,
  DownloadIcon,
  Search2Icon,
} from "@chakra-ui/icons";
import axios from "axios";
import { FaCamera, FaIdCard } from "react-icons/fa"; // ✅ Icon for Photoshoot
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { usePermissionContext } from "../contexts/PermissionContext";
import Photoshoot from "./progress/Photoshoot"; // Import Photoshoot component
import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed
import { useUserFormData, suffixOptions } from "../hooks/userFormOptions";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 5;

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

  const [existingPersonnel, setExistingPersonnel] = useState([]); // Personnel already in LDAP but no personnel_id
  const [newPersonnels, setNewPersonnels] = useState([]);
  const [searchPersonnelList, setSearchPersonnelList] = useState(""); // Search for personnel list
  const [searchNewPersonnels, setSearchNewPersonnels] = useState(""); // Search for new enrolled personnel
  const [currentPagePersonnel, setCurrentPagePersonnel] = useState(1);
  const [currentPageNew, setCurrentPageNew] = useState(1);

  const [columnVisibility, setColumnVisibility] = useState({});

  // To control menu open/close
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [personnelImages, setPersonnelImages] = useState([]);

  // For select all
  const allKeys =
    existingPersonnel.length > 0 ? Object.keys(existingPersonnel[0]) : [];
  const allVisible = allKeys.every((key) => columnVisibility[key]);

  const [categorizedApps, setCategorizedApps] = useState({});

  const avatarBaseUrl = `${API_URL}/uploads/`;

  const navigate = useNavigate(); // Initialize navigation

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
    const updatedCheckboxes = {
      ...checkboxes,
      [key]: isChecked,
    };
    setCheckboxes(updatedCheckboxes);

    const mapKey = {
      minister: "Minister",
      regular: "Regular",
      layMember: "Lay Member",
      ministersWife: "Minister's Wife",
      ministerialStudent: "Ministerial Student",
    };

    setAdvancedFilters((prev) => ({
      ...prev,
      [mapKey[key]]: isChecked,
    }));
  };

  const applyAdvancedFilters = () => {
    fetchUsers(); // Or however you fetch filtered results
    onCloseAdvance();
  };

  useEffect(() => {
    fetchUsers();
    fetchNewPersonnels();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/apps`, {
        headers: getAuthHeaders(),
      });
      //console.log("Fetched Apps Data:", response.data); // Debug API response
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid API response structure");
      }

      // Group apps by application type name instead of ID
      const groupedApps = response.data.reduce((acc, app) => {
        const category = app.app_type || "Others"; // Use application type name instead of ID
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
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: getAuthHeaders(), // ✅ Apply authorization headers here
      });
      setExistingPersonnel(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load personnel list:", error);
    }
  };

  const fetchNewPersonnels = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/personnels/new`, {
        headers: getAuthHeaders(), // ✅ Apply authorization headers here
      });
      setNewPersonnels(response.data || []);
    } catch (error) {
      console.error("Failed to load new personnels:", error);
    }
  };

  const filteredUsers = existingPersonnel.filter((user) => {
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
      educational_attainment, // ✅ add this
      inc_housing_address_id, // ✅ and this
    } = advancedFilters;

    // Filter for personnel types: allow all if none selected, else match any selected
    const selectedTypes = [];
    if (advancedFilters.Minister) selectedTypes.push("Minister");
    if (advancedFilters.Regular) selectedTypes.push("Regular");
    if (advancedFilters["Lay Member"]) selectedTypes.push("Lay Member");
    if (advancedFilters["Minister's Wife"])
      selectedTypes.push("Minister's Wife");
    if (advancedFilters["Ministerial Student"])
      selectedTypes.push("Ministerial Student");

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

  const uniqueIncHousingAddresses = Array.from(
    new Set(incHousingAddresses.map((address) => address.name))
  );

  // Independent search for Newly Enrolled Personnel (Filters from newPersonnels)
  const filteredNewPersonnels = newPersonnels.filter((personnel) =>
    `${personnel.givenname || ""} ${personnel.surname_husband || ""} ${
      personnel.email_address || ""
    } ${personnel.section || ""}`
      .toLowerCase()
      .includes(searchNewPersonnels.toLowerCase())
  );

  const totalPagesPersonnel = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentItemsPersonnel = filteredUsers.slice(
    (currentPagePersonnel - 1) * ITEMS_PER_PAGE,
    currentPagePersonnel * ITEMS_PER_PAGE
  );

  const totalPagesNew = Math.ceil(
    filteredNewPersonnels.length / ITEMS_PER_PAGE
  );

  const currentItemsNew = filteredNewPersonnels.slice(
    (currentPageNew - 1) * ITEMS_PER_PAGE,
    currentPageNew * ITEMS_PER_PAGE
  );

  useEffect(() => {
    fetchData("users", setUsers, setStatus, "Failed to load users.");
    fetchData("apps", setApps, setStatus, "Failed to load apps.");
    fetchData("groups", setGroups, setStatus, "Failed to load groups.");
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();

    let avatarUrlResponse;

    // If a file is selected, upload the avatar using FormData
    if (avatarFile) {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const avatarResponse = await fetch(
        `${API_URL}/api/users/${editingUser?.ID || "new"}/avatar`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!avatarResponse.ok) {
        throw new Error("Error uploading avatar");
      }

      const avatarData = await avatarResponse.json();
      avatarUrlResponse = avatarData.avatar; // URL of the uploaded avatar
    }

    // Prepare the payload with the new avatar URL if uploaded
    const newUser = {
      username,
      password: editingUser ? undefined : "M@sunur1n", // Only include password for new users
      fullname,
      email,
      avatar: avatarUrlResponse || avatarUrl, // Use the uploaded avatar URL if available
      availableApps: selectedApps.map(
        (appName) => apps.find((app) => app.name === appName)?.id
      ),
    };

    try {
      if (editingUser) {
        // Update user information
        await fetch(`${API_URL}/api/users/${editingUser.ID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });

        // Update selectedApps state with the saved apps
        setSelectedApps(newUser.availableApps || []);

        // Refresh users and clear local state
        await fetchUsers();

        // Call handleAssignGroup to update the group
        await handleAssignGroup(editingUser.ID, selectedGroup);

        // Update the user in the local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.ID === editingUser.ID
              ? {
                  ...user,
                  username: newUser.username,
                  fullname: newUser.fullname,
                  email: newUser.email,
                  groupname:
                    groups.find((group) => group.id === selectedGroup)?.name ||
                    "N/A",
                }
              : user
          )
        );

        setStatus("User updated successfully.");
      } else {
        // Add new user
        const response = await fetch(`${API_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
        const data = await response.json();

        // Assign group to the new user
        await handleAssignGroup(data.id, selectedGroup);

        // Update selectedApps state with the saved apps
        setSelectedApps(newUser.availableApps || []);

        // Refresh users and clear local state
        await fetchUsers(); // <-- Add this to refetch the updated users list

        // Add the new user to the local state
        setUsers((prevUsers) => [
          ...prevUsers,
          {
            ...newUser,
            ID: data.id,
            groupname:
              groups.find((group) => group.id === selectedGroup)?.name || "N/A",
          },
        ]);
        setStatus("User added successfully.");
      }

      closeModal();
    } catch (error) {
      setStatus(
        editingUser
          ? "Error updating user. Please try again."
          : "Error adding user. Please try again."
      );
      console.error("Error in handleAddUser:", error);
    }
  };

  const handleDeleteUser = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" })
      .then(() => {
        fetchUsers();
        setUsers((prevUsers) => prevUsers.filter((item) => item.ID !== id));
        setStatus("User deleted successfully.");
      })
      .catch(() => setStatus("Error deleting user."));
  };

  const fetchPersonnelImages = async (personnelId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/personnel_images/${personnelId}`
      );

      if (response.data.success) {
        const imagesByType = {};

        // Debugging: Log the API response
        console.log("Fetched Personnel Images:", response.data.data);

        // Store images based on type
        response.data.data.forEach((img) => {
          imagesByType[img.type.trim()] = `${API_URL}${img.image_url}`;
        });

        setPersonnelImages(imagesByType); // Store images in state

        // Debugging: Log the mapped images
        console.log("Mapped Personnel Images:", imagesByType);
      }
    } catch (error) {
      console.error("Error fetching personnel images:", error);
    }
  };

  const handleEditUser = (item) => {
    setEditingUser(item);
    setUsername(item.username);

    // alert(`LDAP Last Name (sn): ${item.sn}`); // Debugging info

    // Extract first name and last name correctly
    const givenNameParts = item.givenName.split(" "); // Split given name to handle middle initials
    const firstName = givenNameParts[0]; // First word is the first name
    const lastName = item.sn; // Last name (from LDAP)

    setFirstName(firstName);
    setLastName(lastName);

    // Use setFullname if needed for display purposes
    setFullname(`${firstName} ${lastName}`);

    setEmail(item.mail || "");
    setAvatarUrl(item.avatar || "");
    setSelectedApps(item.availableApps || []);
    setSelectAll(item.availableApps?.length === apps.length); // Set the current group of the user
    setSelectedGroup(item.groupId || ""); // Ensure groupId exists in user data

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
      setSelectedApps(apps.map((app) => app.name));
      setSelectAll(true);
    } else {
      setSelectedApps([]);
      setSelectAll(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setFullname("");
    setEmail("");
    setAvatarUrl("");
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
          body: JSON.stringify({ groupId }),
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

  // const [loading, setLoading] = useState(false);

  const [loadingSyncUsers, setLoadingSyncUsers] = useState(false); // Loading state for LDAP Sync
  const [loadingSyncPersonnel, setLoadingSyncPersonnel] = useState({}); // Individual loading states for each personnel

  const toast = useToast();

  // Sync to users table for new personnel
  const handleSyncToUsersTable = async (personnelId, personnelName) => {
    // alert(personnelId);
    setLoadingSyncPersonnel((prevLoading) => ({
      ...prevLoading,
      [personnelId]: true,
    })); // Set loading for the specific button
    try {
      const response = await axios.post(`${API_URL}/api/sync-to-users`, {
        personnelId,
        personnelName, // Pass the dynamically constructed name
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
      })); // Reset loading for the specific button
    }
  };

  const handleSyncUsers = async () => {
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
  const handleSearchChangePersonnel = (e) => {
    setSearchPersonnelList(e.target.value);
    setCurrentPagePersonnel(1); // Reset to first page on new search
  };

  const handleViewUser = (personnelId) => {
    window.open(`/personnel-preview/${personnelId}`, "_blank");
  };

  const handleCategorySelectAll = (category, apps, isChecked) => {
    setSelectedApps((prevSelected) => {
      const categoryApps = apps.map((app) => app.name);

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
    //console.log("existingPersonnel:", existingPersonnel); // ✅ Debug log

    if (existingPersonnel.length > 0) {
      const sample = existingPersonnel[0];

      // Define your default selected columns here
      const defaultColumns = [
        "username",
        "avatar",
        "personnel_givenname",
        "personnel_surname_husband",
      ];

      const defaultVisibility = Object.keys(sample).reduce((acc, key) => {
        acc[key] = defaultColumns.includes(key); // true only for default columns
        return acc;
      }, {});
      setColumnVisibility(defaultVisibility);
    }
  }, [existingPersonnel]);

  const toggleSelectAll = () => {
    const updated = {};
    allKeys.forEach((key) => {
      updated[key] = !allVisible;
    });
    setColumnVisibility(updated);
  };

  const toggleColumn = (key) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

    const csvRows = [
      headers.join(","), // Header row
      ...filteredUsers.map((user) =>
        visibleColumns.map((key) => `"${user[key] || ""}"`).join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "personnel_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      alert("No data to export.");
      return;
    }

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

    const data = filteredUsers.map((user) =>
      visibleColumns.map((key) => user[key] || "")
    );

    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: data,
      theme: "grid",
      headStyles: { fillColor: [0, 122, 204] },
      styles: { fontSize: 9 },
    });

    doc.save("personnel_list.pdf");
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

  return (
    <Box p={6}>
      <Heading mb={6}>Personnel Management</Heading>

      {/* Sync Users Button */}
      {hasPermission("personnels.syncfromldap") && (
        <Button
          colorScheme="orange"
          mb={4}
          isLoading={loadingSyncUsers}
          onClick={handleSyncUsers}
        >
          Sync Users from LDAP
        </Button>
      )}

      <Flex mb={4} align="center" gap={2}>
        {/* Search bar for Personnel List */}
        <Input
          placeholder="Search personnel list..."
          value={searchPersonnelList}
          onChange={handleSearchChangePersonnel}
          maxW="300px"
        />

        {/* Advanced Search Button */}
        <IconButton
          icon={<Search2Icon />}
          aria-label="Advanced Search"
          onClick={onOpenAdvance}
          variant="outline"
          colorScheme="blue"
        />

        {/* Columns Menu */}
        <Menu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          closeOnSelect={false}
        >
          <MenuButton
            as={IconButton}
            icon={<ViewIcon />}
            aria-label="Columns"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          <MenuList maxHeight="300px" overflowY="auto" minW="250px" px={2}>
            {/* ✅ Select All Option */}
            <Box px={2} py={1}>
              <Checkbox
                isChecked={allVisible}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent menu from closing
                  toggleSelectAll();
                }}
              >
                Select All
              </Checkbox>
            </Box>
            <Divider />

            {/* ✅ Individual Columns */}
            {allKeys.map((key) => (
              <MenuItem key={key} as="div" _hover={{ bg: "transparent" }}>
                <Checkbox
                  isChecked={columnVisibility[key]}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevent menu from closing
                    toggleColumn(key);
                  }}
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
          <MenuButton
            as={IconButton}
            icon={<DownloadIcon />}
            aria-label="Export"
          />
          <MenuList>
            <MenuItem onClick={exportAsCSV}>Export as CSV</MenuItem>
            <MenuItem onClick={exportAsPDF}>Export as PDF</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Heading size="md"> Personnel List</Heading>
      <Flex justify="space-between" align="center" mt={4} mb={6}>
        <Button
          onClick={() => handlePageChangePersonnel("previous")}
          disabled={currentPagePersonnel === 1}
        >
          Previous
        </Button>
        <Text>
          Page {currentPagePersonnel} of {totalPagesPersonnel}
        </Text>
        <Button
          onClick={() => handlePageChangePersonnel("next")}
          disabled={currentPagePersonnel === totalPagesPersonnel}
        >
          Next
        </Button>
      </Flex>
      {/* Existing Personnel Table */}
      <VStack align="start" spacing={4} mb={6} width="100%">
        <Box width="100%" overflowX="auto">
          <Table variant="simple" minWidth="1000px">
            <Thead>
              <Tr>
                {existingPersonnel.length > 0 &&
                  Object.keys(existingPersonnel[0]).map((key) =>
                    columnVisibility[key] ? (
                      <Th key={key}>
                        {key
                          .replace("personnel_", "")
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Th>
                    ) : null
                  )}
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItemsPersonnel.map((item, index) => {
                const avatarSrc = item.avatar ? `${API_URL}${item.avatar}` : "";

                return (
                  <Tr key={item.ID} cursor="pointer">
                    {Object.entries(item).map(
                      ([key, value]) =>
                        columnVisibility[key] && (
                          <Td key={key}>
                            {key === "avatar" ? (
                              <Avatar
                                size="sm"
                                src={avatarSrc}
                                name={`${item.givenName || "N/A"} ${
                                  item.sn || "N/A"
                                }`}
                              />
                            ) : key === "givenName" || key === "sn" ? null : (
                              <Text fontSize="sm">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : value || "N/A"}
                              </Text>
                            )}
                          </Td>
                        )
                    )}

                    <Td>
                      <HStack spacing={2}>
                        {hasPermission("personnels.edit") && (
                          <IconButton
                            icon={<EditIcon />}
                            colorScheme="yellow"
                            onClick={() => handleEditUser(item)}
                          />
                        )}
                        {hasPermission("personnels.photo") && ( // ✅ Optional: add a permission check
                          <IconButton
                            icon={<FaCamera />}
                            colorScheme="teal"
                            onClick={() => {
                              setSelectedUser(item); // ✅ Set selected user
                              setIsPhotoModalOpen(true); // ✅ Open modal
                            }}
                          />
                        )}
                        {hasPermission("personnels.edit_rfid_code") && (
                          <IconButton
                            icon={<FaIdCard />}
                            colorScheme="blue"
                            onClick={() => {
                              // ✅ Set personnel_id (not the whole item object)
                              setSelectedUserForRfid(item.personnel_id);

                              // ✅ Prefill RFID code if exists
                              setRfidCode(item.rfid_code || "");

                              // ✅ Open the RFID modal
                              onRfidModalOpen();
                            }}
                            aria-label="Update RFID"
                          />
                        )}

                        {hasPermission("personnels.view") && (
                          <Tooltip
                            label={
                              !item.personnel_id
                                ? "No personnel data is available."
                                : ""
                            }
                          >
                            <IconButton
                              icon={<ViewIcon />}
                              colorScheme="orange"
                              onClick={() => handleViewUser(item.personnel_id)}
                              isDisabled={!item.personnel_id}
                            />
                          </Tooltip>
                        )}
                        {hasPermission("personnels.info") && (
                          <IconButton
                            icon={<InfoIcon />}
                            colorScheme="orange"
                            onClick={() => {
                              const personnelId = item.personnel_id;
                              if (personnelId) {
                                window.location.href = `/enroll?personnel_id=${personnelId}&type=editpersonnel`;
                              } else {
                                window.location.href = `/enroll?not_enrolled=${item.username}&type=editpersonnel`;
                              }
                            }}
                          />
                        )}
                        {hasPermission("personnels.delete") && (
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            onClick={() => handleDeleteUser(item.personnel_id)}
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <Flex justify="space-between" align="center" mt={4} mb={6}>
        <Button
          onClick={() => handlePageChangePersonnel("previous")}
          disabled={currentPagePersonnel === 1}
        >
          Previous
        </Button>
        <Text>
          Page {currentPagePersonnel} of {totalPagesPersonnel}
        </Text>
        <Button
          onClick={() => handlePageChangePersonnel("next")}
          disabled={currentPagePersonnel === totalPagesPersonnel}
        >
          Next
        </Button>
      </Flex>

      <Divider style={{ borderBottom: "2px dotted black" }} />

      {hasPermission("personnels.newly_enrolled_personnel") && (
        <>
          {/* Search bar for Newly Enrolled Personnel */}
          <Input
            placeholder="Search newly enrolled personnel..."
            value={searchNewPersonnels}
            onChange={(e) => setSearchNewPersonnels(e.target.value)}
            mb={1}
            mt={6}
          />
        </>
      )}

      {/* Updated Table with Row Numbers and Action Button */}
      {hasPermission("personnels.newly_enrolled_personnel") && (
        <Heading size="md">Newly Enrolled Personnel</Heading>
      )}
      {hasPermission("personnels.newly_enrolled_personnel") && (
        <Flex justify="space-between" align="center" mt={4}>
          <Button
            onClick={() => handlePageChangeNewPersonnel("previous")}
            disabled={currentPageNew === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPageNew} of {totalPagesNew}
          </Text>
          <Button
            onClick={() => handlePageChangeNewPersonnel("next")}
            disabled={currentPageNew === totalPagesNew}
          >
            Next
          </Button>
        </Flex>
      )}

      {/* New Personnel Table */}
      <VStack align="start" spacing={4} mt={8}>
        {hasPermission("personnels.newly_enrolled_personnel") && (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Personnel ID</Th>
                <Th>Section</Th>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Email</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItemsNew.map((personnel, index) => {
                const personnelName = `${personnel.givenname} ${personnel.surname_husband}`; // Construct the full name dynamically
                return (
                  <Tr key={personnel.personnel_id}>
                    <Td>{index + 1}</Td> {/* Display the row number */}
                    <Td>{personnel.personnel_id}</Td>
                    {/* Display Personnel ID */}
                    <Td>{personnel.section || "No Section"}</Td>
                    {/* Display the section name */}
                    <Td>{personnel.givenname}</Td>
                    {/* Display first name */}
                    <Td>{personnel.surname_husband}</Td>
                    {/* Display last name */}
                    <Td>{personnel.email_address}</Td>
                    {/* Display email address */}
                    {hasPermission("personnels.sync_to_users") && (
                      <Td>
                        {/* <Button
                          colorScheme="yellow"
                          onClick={() =>
                            handleSyncToUsersTable(
                              personnel.personnel_id,
                              personnelName
                            )
                          }
                          isLoading={
                            loadingSyncPersonnel[personnel.personnel_id]
                          } // Loading state specific to this button
                        >
                          Sync to Users Table
                        </Button> */}

                        <Button
                          colorScheme="yellow"
                          onClick={() =>
                            handleSyncToUsersTable(
                              personnel.personnel_id,
                              personnelName
                            )
                          }
                          isLoading={
                            loadingSyncPersonnel[personnel.personnel_id]
                          }
                          isDisabled={personnel.personnel_progress !== "8"} // ✅ Only enable if 'Done'
                        >
                          Sync to Users Table
                        </Button>
                      </Td>
                    )}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </VStack>

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

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? "Edit User" : "Add User"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Avatar</FormLabel>
                {/* Display the current or selected image */}
                {/* Display the selected image */}
                {avatarUrl && (
                  <Box mb={4} textAlign="center">
                    <Avatar size="xl" src={avatarUrl} alt="Avatar Preview" />
                  </Box>
                )}
                {/* File input for browsing and selecting an image */}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // Set file to state for upload
                      setAvatarFile(file);

                      // Create a temporary preview URL for the selected file
                      const reader = new FileReader();
                      reader.onload = (event) =>
                        setAvatarUrl(event.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                  isDisabled={!!editingUser} // Disable input when editing
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={firstName} // Use setFirstName for accuracy
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter First Name"
                  isDisabled={!!editingUser} // Disable input when editing
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={lastName} // Use setLastName for accuracy
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter Last Name"
                  isDisabled={!!editingUser} // Disable input when editing
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  isDisabled={!!editingUser} // Disable input when editing
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Group Name</FormLabel>
                <Select
                  placeholder="Assign Group"
                  value={selectedGroup || ""} // Display the current group
                  onChange={(e) => setSelectedGroup(e.target.value)} // Update selected group on change
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="lg" fontWeight="bold" mb={3}>
                  Available Apps
                </FormLabel>

                {categorizedApps && Object.keys(categorizedApps).length > 0 ? (
                  Object.entries(categorizedApps).map(([category, apps]) => {
                    // Check if all apps in this category are selected
                    const allSelected = apps.every((app) =>
                      selectedApps.includes(app.name)
                    );

                    return (
                      <Box
                        key={category}
                        mt={4}
                        p={3}
                        borderRadius="md"
                        border="1px solid #e2e8f0"
                      >
                        <Flex
                          alignItems="center"
                          justifyContent="space-between"
                          mb={2}
                        >
                          <Text
                            fontWeight="bold"
                            fontSize="md"
                            color="gray.700"
                          >
                            {category}
                          </Text>
                          <Checkbox
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

                        <CheckboxGroup
                          value={selectedApps}
                          onChange={(updatedSelection) =>
                            handleAppChange(updatedSelection, apps)
                          }
                        >
                          <Stack spacing={2} pl={4}>
                            {apps.map((app) => (
                              <Checkbox
                                key={app.id}
                                value={app.name}
                                colorScheme="blue"
                                _hover={{
                                  transform: "scale(1.02)",
                                  transition: "0.2s ease-in-out",
                                }}
                                _focus={{
                                  borderColor: "blue.400",
                                  boxShadow: "0 0 4px blue",
                                }}
                              >
                                {app.name}
                              </Checkbox>
                            ))}
                          </Stack>
                        </CheckboxGroup>
                      </Box>
                    );
                  })
                ) : (
                  <Text mt={3} color="gray.500">
                    No apps available
                  </Text>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddUser}>
              {editingUser ? "Save Changes" : "Add User"}
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
            <VStack spacing={3} align="stretch">
              {/* Select All */}
              <Checkbox
                isChecked={allAdvanceSelected}
                onChange={handleAdvanceSelectAll}
              >
                Select All
              </Checkbox>

              {/* Role Checkboxes */}
              <Checkbox
                isChecked={checkboxes.minister}
                onChange={(e) =>
                  handleCheckboxChange("minister", e.target.checked)
                }
              >
                Minister
              </Checkbox>
              <Checkbox
                isChecked={checkboxes.regular}
                onChange={(e) =>
                  handleCheckboxChange("regular", e.target.checked)
                }
              >
                Regular
              </Checkbox>
              <Checkbox
                isChecked={checkboxes.layMember}
                onChange={(e) =>
                  handleCheckboxChange("layMember", e.target.checked)
                }
              >
                Lay Member
              </Checkbox>
              <Checkbox
                isChecked={checkboxes.ministersWife}
                onChange={(e) =>
                  handleCheckboxChange("ministersWife", e.target.checked)
                }
              >
                Minister's Wife
              </Checkbox>
              <Checkbox
                isChecked={checkboxes.ministerialStudent}
                onChange={(e) =>
                  handleCheckboxChange("ministerialStudent", e.target.checked)
                }
              >
                Ministerial Student
              </Checkbox>

              {/* District and Local */}
              <HStack spacing={4}>
                <Select
                  placeholder="District"
                  onChange={(e) =>
                    handleDropdownFilterChange("district", e.target.value)
                  }
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Local"
                  onChange={(e) =>
                    handleDropdownFilterChange("local", e.target.value)
                  }
                >
                  {filteredLocals.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </HStack>

              {/* Section and Team */}
              <HStack spacing={4}>
                <Select
                  placeholder="Section"
                  onChange={(e) =>
                    handleDropdownFilterChange("section", e.target.value)
                  }
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Team"
                  onChange={(e) =>
                    handleDropdownFilterChange("team", e.target.value)
                  }
                >
                  {subsections.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </HStack>

              {/* Role and Birthday Month */}
              <HStack spacing={4}>
                <Select
                  placeholder="Role"
                  onChange={(e) =>
                    handleDropdownFilterChange("role", e.target.value)
                  }
                >
                  {designations.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Birthday Month"
                  onChange={(e) =>
                    handleDropdownFilterChange("birthdayMonth", e.target.value)
                  }
                >
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </Select>
              </HStack>

              {/* Blood Type and Language */}
              <HStack spacing={4}>
                <Select
                  placeholder="Select Blood Type"
                  value={advancedFilters.bloodtype}
                  onChange={(e) =>
                    handleDropdownFilterChange("bloodtype", e.target.value)
                  }
                >
                  <option value="">All Blood Types</option>
                  {bloodtypes
                    .filter((bt) => bt && bt.trim() !== "") // removes null, undefined, empty strings
                    .map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                </Select>

                <Select
                  placeholder="Language"
                  onChange={(e) =>
                    handleDropdownFilterChange("language", e.target.value)
                  }
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </Select>
              </HStack>

              {/* Citizenship and Civil Status */}
              <HStack spacing={4}>
                <Select
                  placeholder="Citizenship"
                  onChange={(e) =>
                    handleDropdownFilterChange("citizenship", e.target.value)
                  }
                >
                  {citizenships.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.citizenship}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Civil Status"
                  onChange={(e) =>
                    handleDropdownFilterChange("civil_status", e.target.value)
                  }
                >
                  {civilStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </HStack>

              {/* Educational Level and INC Housing Address */}
              <HStack spacing={4} mt={4}>
                <Select
                  placeholder="Select All"
                  value={advancedFilters.educational_attainment}
                  onChange={(e) =>
                    handleDropdownFilterChange(
                      "educational_attainment",
                      e.target.value
                    )
                  }
                >
                  {educationalLevelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Select All"
                  value={advancedFilters.inc_housing_address_id}
                  onChange={(e) =>
                    handleDropdownFilterChange(
                      "inc_housing_address_id",
                      e.target.value
                    )
                  }
                >
                  {uniqueIncHousingAddresses.map((name, index) => (
                    <option key={index} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={applyAdvancedFilters}>
              Apply Filters
            </Button>
            <Button variant="ghost" onClick={onCloseAdvance}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Users;
