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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedApps, setSelectedApps] = useState([]); // Store selected apps
  const [selectAll, setSelectAll] = useState(false); // State for Select All checkbox
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState(null); // Holds the entire user object for editing
  const [status, setStatus] = useState(""); // Status message

  // Fetch users and apps data
  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Users Data:", data); // Debug: Log the data to check `fullname` and `availableApps`
        setUsers(data);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setStatus("Failed to load users.");
      });

    fetch(`${API_URL}/api/apps`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Apps Data:", data); // Debug: Log the apps data to verify
        setApps(data);
      })
      .catch((err) => {
        console.error("Error fetching apps:", err);
        setStatus("Failed to load apps.");
      });
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();

    const newUser = {
      username,
      password: "M@sunur1n", // Add a default password if not provided
      fullname,
      email,
      avatar: avatarUrl,
      availableApps: selectedApps.map(
        (appName) => apps.find((app) => app.name === appName)?.id
      ), // Map app names to app IDs
    };

    if (editingUser) {
      // For editing an existing user
      fetch(`${API_URL}/api/users/${editingUser.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
        .then(() => {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.ID === editingUser.ID
                ? { ...newUser, ID: editingUser.ID }
                : user
            )
          );
          setStatus("User updated successfully.");
          closeModal();
        })
        .catch(() => setStatus("Error updating user. Please try again."));
    } else {
      // For adding a new user
      fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
        .then((response) => response.json())
        .then((data) => {
          setUsers((prevUsers) => [...prevUsers, { ...newUser, ID: data.id }]);
          setStatus("User added successfully.");
          closeModal();
        })
        .catch(() => setStatus("Error adding user. Please try again."));
    }
  };

  const handleDeleteUser = (id) => {
    // Display a confirmation dialog before deleting
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return; // If the user clicks "Cancel", stop the deletion

    fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setUsers((prevUsers) => prevUsers.filter((item) => item.ID !== id));
        setStatus("User deleted successfully.");
      })
      .catch(() => setStatus("Error deleting user."));
  };

  const handleEditUser = (item) => {
    // Set the entire user object in `editingUser` to ensure `ID` is accessible
    setEditingUser(item); // Set to the whole item, not just item.ID
    setUsername(item.username);
    setFullname(item.fullname);
    setEmail(item.email);
    setAvatarUrl(item.avatar);
    setSelectedApps(item.availableApps || []);
    setSelectAll(item.availableApps?.length === apps.length);
    onOpen();
  };

  const handleAppChange = (selectedValues) => {
    setSelectedApps(selectedValues);
    setSelectAll(selectedValues.length === apps.length);
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allAppNames = apps.map((app) => app.name);
      setSelectedApps(allAppNames);
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
    setEditingUser(null); // Clear `editingUser` on form reset
  };

  const openAddUserModal = () => {
    resetForm();
    onOpen();
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Users</Heading>

      <Button
        leftIcon={<AddIcon />}
        onClick={openAddUserModal}
        colorScheme="teal"
        mb={4}
      >
        Add User
      </Button>

      {status && (
        <Alert
          status={status.includes("successfully") ? "success" : "error"}
          mb={4}
        >
          <AlertIcon />
          {status}
        </Alert>
      )}

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((item) => (
            <Tr key={item.ID}>
              <Td>
                <HStack spacing={3}>
                  <Avatar size="sm" src={item.avatar} name={item.fullname} />
                  <Text>{item.fullname}</Text>{" "}
                  {/* Make sure item.fullname is used here */}
                </HStack>
              </Td>
              <Td>{item.username}</Td>
              <Td>{item.email}</Td>
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
          ))}
        </Tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingUser ? "Edit User" : "Add User"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Username"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)} // Using `name` here
                  placeholder="Enter Full Name"
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

              <FormControl>
                <FormLabel>Avatar URL</FormLabel>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Enter Avatar URL"
                />
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
