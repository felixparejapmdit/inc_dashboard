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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

// Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedApps, setSelectedApps] = useState([]); // Store selected apps
  const [selectAll, setSelectAll] = useState(false); // State for Select All checkbox
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null); // Error state to handle fetch issues

  // Fetch users and apps data
  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setError("Failed to load users. Data is not an array.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load users. Please try again later.");
      });

    fetch(`${API_URL}/api/apps`)
      .then((res) => res.json())
      .then((data) => setApps(data))
      .catch((err) => {
        console.error("Error fetching apps:", err);
        setError("Failed to load apps.");
      });
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUser = {
      username,
      password,
      name,
      email,
      avatarUrl,
      isLoggedIn: false,
      availableApps: selectedApps, // Link the selected apps
    };

    if (editingUser) {
      fetch(`${API_URL}/api/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })
        .then(() => {
          setUsers((prevUsers) =>
            prevUsers.map((item) =>
              item.id === editingUser.id ? newUser : item
            )
          );
          onClose();
        })
        .catch(() => alert("Error updating user. Please try again."));
    } else {
      fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })
        .then(() => {
          setUsers((prevUsers) => [...prevUsers, newUser]);
          onClose();
        })
        .catch(() => alert("Error adding user. Please try again."));
    }
  };

  const handleDeleteUser = (id) => {
    fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setUsers(users.filter((item) => item.id !== id));
      })
      .catch((err) => console.error("Error deleting user:", err));
  };

  const handleEditUser = (item) => {
    setEditingUser(item);
    setUsername(item.username);
    setPassword(item.password);
    setName(item.name);
    setEmail(item.email);
    setAvatarUrl(item.avatarUrl);
    setSelectedApps(item.availableApps || []); // Populate selected apps
    setSelectAll(item.availableApps?.length === apps.length); // Check if all apps are selected
    onOpen();
  };

  const handleAppChange = (selectedValues) => {
    setSelectedApps(selectedValues); // Handle app selection
    setSelectAll(selectedValues.length === apps.length); // Update Select All state
  };

  // Handle Select All checkbox logic
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
    setPassword("");
    setName("");
    setEmail("");
    setAvatarUrl("");
    setSelectedApps([]);
    setSelectAll(false);
    setEditingUser(null);
  };

  const openAddUserModal = () => {
    resetForm(); // Clear fields when opening the modal
    onOpen();
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  if (error) {
    return (
      <Box p={6}>
        <Heading>{error}</Heading>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Users</Heading>

      <Button
        leftIcon={<AddIcon />}
        onClick={openAddUserModal} // Ensure reset on opening Add User
        colorScheme="teal"
        mb={4}
      >
        Add User
      </Button>

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
          {users.map((item, index) => (
            <Tr key={index}>
              <Td>
                <HStack spacing={3}>
                  <Avatar size="sm" src={item.avatarUrl} name={item.name} />
                  <Text>{item.name}</Text>
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
                  onClick={() => handleDeleteUser(item.id)}
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
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    {apps.map((app, index) => (
                      <Checkbox key={index} value={app.name}>
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
