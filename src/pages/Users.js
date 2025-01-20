import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  InfoIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import axios from "axios";

import { usePermissionContext } from "../contexts/PermissionContext";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 15;

const Users = ({ personnelId }) => {
  const [users, setUsers] = useState([]);

  const { hasPermission } = usePermissionContext(); // Correct usage

  const [setFilteredUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [avatarFile, setAvatarFile] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(""); // For group assignment
  const [apps, setApps] = useState([]);
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState(null);
  const [status, setStatus] = useState("");

  const [existingPersonnel, setExistingPersonnel] = useState([]); // Personnel already in LDAP but no personnel_id
  const [newPersonnels, setNewPersonnels] = useState([]);

  const avatarBaseUrl = `${API_URL}/uploads/`;

  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setStatus("Failed to load users."));

    fetch(`${API_URL}/api/apps`)
      .then((res) => res.json())
      .then((data) => setApps(Array.isArray(data) ? data : []))
      .catch(() => setStatus("Failed to load apps."));
    // Fetch groups
    fetch(`${API_URL}/api/groups`)
      .then((res) => res.json())
      .then((data) => setGroups(Array.isArray(data) ? data : []))
      .catch(() => setStatus("Failed to load groups."));

    // Fetch new personnels
    fetch(`${API_URL}/api/personnels/new`)
      .then((res) => res.json())
      .then((data) => setNewPersonnels(Array.isArray(data) ? data : []))
      .catch(() => setStatus("Failed to load new personnels."));
  }, []);

  const navigate = useNavigate(); // Initialize navigation

  const handleRowClick = (personnelId) => {
    // Navigate to Step6 page with the personnelId as a query parameter
    navigate(`/step6/${personnelId}`);
  };

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
        setUsers((prevUsers) => prevUsers.filter((item) => item.ID !== id));
        setStatus("User deleted successfully.");
      })
      .catch(() => setStatus("Error deleting user."));
  };

  const handleEditUser = (item) => {
    setEditingUser(item);
    setUsername(item.username);
    setFullname(`${item.givenName || ""} ${item.sn || ""}`);
    setEmail(item.mail || "");
    setAvatarUrl(item.avatar || "");
    setSelectedApps(item.availableApps || []);
    setSelectAll(item.availableApps?.length === apps.length); // Set the current group of the user
    setSelectedGroup(item.groupId || ""); // Ensure groupId exists in user data

    onOpen();
  };

  const handleAppChange = (selectedValues) => {
    setSelectedApps(selectedValues);
    setSelectAll(selectedValues.length === apps.length);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page whenever search term changes
  };

  const filteredUsers = users.filter((user) => {
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
      user.personnel_department_name || "", // Updated to use resolved department name
      user.personnel_section_name || "", // Updated to use resolved section name
      user.personnel_subsection_name || "", // Updated to use resolved subsection name
      user.personnel_designation_name || "", // Updated to use resolved designation name
      user.personnel_district_name || "", // Updated to use resolved district name
      user.personnel_language_name || "", // Updated to use resolved language name
    ];

    const combinedFields = [
      user.username || "",
      user.fullname || `${user.givenName || ""} ${user.sn || ""}`,
      user.email || "",
      ...personnelFields,
    ]
      .join(" ")
      .toLowerCase();

    return combinedFields.includes(searchTerm.toLowerCase());
  });

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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentItems = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPages)
        : Math.max(prev - 1, 1)
    );
  };

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSyncLdapUser = async () => {
    if (!personnelId) {
      toast({
        title: "Validation Error",
        description: "Personnel ID is required to sync LDAP user.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/sync-ldap-user`, {
        personnelId,
      });

      toast({
        title: "Success",
        description: res.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh users after syncing
      const updatedUsers = await axios.get(`${API_URL}/api/users`);
      setUsers(updatedUsers.data || []);
    } catch (error) {
      console.error("Error syncing LDAP user:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to sync LDAP user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync personnel_id for existing personnel
  const handleSyncPersonnelId = async (personnel) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/sync-personnel-id`, {
        uid: personnel.uid, // Use LDAP uid to find the personnel
      });

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the existing personnel table
      setExistingPersonnel((prev) =>
        prev.filter((item) => item.uid !== personnel.uid)
      );
    } catch (error) {
      console.error("Error syncing personnel ID:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to sync personnel ID.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync to users table for new personnel
  const handleSyncToUsersTable = async (personnelId, personnelName) => {
    // alert(personnelId);
    setLoading((prevLoading) => ({ ...prevLoading, [personnelId]: true })); // Set loading for the specific button
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
      setLoading((prevLoading) => ({ ...prevLoading, [personnelId]: false })); // Reset loading for the specific button
    }
  };

  const fetchUsers = async () => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() =>
        setStatus("Failed to load users from Sync users from ldap.")
      );
  };

  const handleSyncUsers = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/migrateLdapToPmdLoginUsers`);
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
      setLoading(false);
    }
  };

  const handleViewUser = (personnelId) => {
    window.open(`/personnel-preview/${personnelId}`, "_blank");
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Personnel Management</Heading>

      {/* Sync Users Button */}
      {hasPermission("personnels.syncfromldap") && (
        <Button
          colorScheme="blue"
          mb={4}
          isLoading={loading}
          onClick={handleSyncUsers}
        >
          Sync Users from LDAP
        </Button>
      )}
      <Input
        placeholder="Search personnel..."
        value={searchTerm}
        onChange={handleSearchChange}
        mb={6}
      />
      {status && (
        <Alert
          status={status.includes("successfully") ? "success" : "error"}
          mb={4}
        >
          <AlertIcon />
          {status}
        </Alert>
      )}

      <Heading size="md"> Personnel List</Heading>
      <Flex justify="space-between" align="center" mt={4} mb={6}>
        <Button
          onClick={() => handlePageChange("previous")}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <Button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Flex>
      {/* Existing Personnel Table */}
      <VStack align="start" spacing={4} mb={6}>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Avatar</Th>
              <Th>Full Name</Th>
              <Th>District</Th>
              <Th>Local Congregation Assignment</Th>
              <Th>Email</Th>
              <Th>Group</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((item) => {
              // Prepend the base URL if needed
              const avatarSrc = item.avatar ? `${API_URL}${item.avatar}` : "";
              return (
                <Tr
                  key={item.ID}
                  cursor="pointer"
                  //onClick={() => handleRowClick(item.personnel_id)} // Pass personnel_id to Step6
                >
                  <Td>
                    <Avatar
                      size="sm"
                      src={avatarSrc}
                      name={`${item.givenName || "N/A"} ${item.sn || "N/A"}`}
                    />
                  </Td>
                  <Td>
                    <HStack spacing={3}>
                      <Text>{`${item.givenName || "N/A"} ${
                        item.sn || "N/A"
                      }`}</Text>
                    </HStack>
                  </Td>
                  <Td>{item.personnel_district_name || "N/A"}</Td>
                  <Td>
                    {item.personnel_local_congregation_assignment || "N/A"}
                  </Td>
                  <Td>{item.mail || "N/A"}</Td>
                  <Td>{item.groupname || "N/A"}</Td>
                  <Td>
                    {hasPermission("personnels.edit") && (
                      <IconButton
                        icon={<EditIcon />}
                        mr={2}
                        colorScheme="blue"
                        onClick={() => handleEditUser(item)}
                      />
                    )}
                    {hasPermission("personnels.view") && (
                      <Tooltip
                        label={
                          !item.personnel_id
                            ? "No personnel data is available. To view, please click the Info icon to proceed."
                            : ""
                        }
                      >
                        <IconButton
                          icon={<ViewIcon />}
                          mr={2}
                          colorScheme="teal"
                          onClick={() => handleViewUser(item.personnel_id)}
                          isDisabled={!item.personnel_id}
                        />
                      </Tooltip>
                    )}
                    {hasPermission("personnels.info") && (
                      <IconButton
                        icon={<InfoIcon />} // Change this to your preferred enrollment icon
                        mr={2}
                        colorScheme="teal"
                        onClick={() => {
                          const personnelId = item.personnel_id; // Adjust based on how `personnel_id` is stored in your `item` object
                          if (personnelId) {
                            window.location.href = `/enroll?personnel_id=${personnelId}`;
                          } else {
                            window.location.href = `/enroll?not_enrolled=${item.username}`;
                          }
                        }}
                      />
                    )}
                    {hasPermission("personnels.delete") && (
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDeleteUser(item.ID)}
                      />
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </VStack>

      <Flex justify="space-between" align="center" mt={4}>
        <Button
          onClick={() => handlePageChange("previous")}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <Button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </Flex>

      {/* New Personnel Table */}
      <VStack align="start" spacing={4}>
        {hasPermission("personnels.newly_enrolled_personnel") && (
          <Heading size="md">Newly Enrolled Personnel</Heading>
        )}
        {/* Updated Table with Row Numbers and Action Button */}
        {hasPermission("personnels.newly_enrolled_personnel") && (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>#</Th> {/* Row number column */}
                <Th>Personnel ID</Th> {/* Add Personnel ID column */}
                <Th>Section</Th>
                <Th>First Name</Th>
                <Th>Last Name</Th>
                <Th>Email</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {newPersonnels.map((personnel, index) => {
                const personnelName = `${personnel.givenname} ${personnel.surname_husband}`; // Construct the full name dynamically
                return (
                  <Tr key={personnel.personnel_id}>
                    <Td>{index + 1}</Td> {/* Display the row number */}
                    <Td>{personnel.personnel_id}</Td>{" "}
                    {/* Display Personnel ID */}
                    <Td>{personnel.section || "No Section"}</Td>{" "}
                    {/* Display the section name */}
                    <Td>{personnel.givenname}</Td> {/* Display first name */}
                    <Td>{personnel.surname_husband}</Td>{" "}
                    {/* Display last name */}
                    <Td>{personnel.email_address}</Td>{" "}
                    {/* Display email address */}
                    {hasPermission("personnels.sync_to_users") && (
                      <Td>
                        <Button
                          colorScheme="teal"
                          onClick={() =>
                            handleSyncToUsersTable(
                              personnel.personnel_id,
                              personnelName
                            )
                          }
                          isLoading={loading[personnel.personnel_id]} // Loading state specific to this button
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
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={fullname.split(" ")[0]}
                  onChange={(e) => {
                    const lastName = fullname.split(" ")[1] || "";
                    setFullname(`${e.target.value} ${lastName}`);
                  }}
                  placeholder="Enter First Name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={fullname.split(" ")[1] || ""}
                  onChange={(e) => {
                    const firstName = fullname.split(" ")[0] || "";
                    setFullname(`${firstName} ${e.target.value}`);
                  }}
                  placeholder="Enter Last Name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
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
                <FormLabel>Available Apps</FormLabel>
                <Checkbox
                  isChecked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  Select All
                </Checkbox>
                <CheckboxGroup value={selectedApps} onChange={handleAppChange}>
                  <Stack spacing={2}>
                    {apps.map((app) => (
                      <Checkbox key={app.id} value={app.name}>
                        {app.name}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
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
    </Box>
  );
};

export default Users;
