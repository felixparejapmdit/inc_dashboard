import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 15;

const Users = () => {
  const [users, setUsers] = useState([]);
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

  const filteredUsers = users.filter((user) =>
    `${user.username} ${
      user.fullname || `${user.givenName || ""} ${user.sn || ""}`
    } ${user.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Personnel</Heading>
      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={handleSearchChange}
        mb={4}
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
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Avatar</Th>
            <Th>Full Name</Th>
            <Th>Username</Th>
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
              <Tr key={item.ID}>
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
                <Td>{item.username || "N/A"}</Td>
                <Td>{item.mail || "N/A"}</Td>
                <Td>{item.groupname || "N/A"}</Td>
                <Td>
                  <IconButton
                    icon={<EditIcon />}
                    mr={2}
                    colorScheme="blue"
                    onClick={() => handleEditUser(item)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDeleteUser(item.ID)}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

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
