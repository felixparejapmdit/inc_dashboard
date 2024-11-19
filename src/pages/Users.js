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
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 15;

const Users = () => {
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setStatus("Failed to load users."));

    fetch(`${API_URL}/api/apps`)
      .then((res) => res.json())
      .then((data) => setApps(Array.isArray(data) ? data : []))
      .catch(() => setStatus("Failed to load apps."));
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUser = {
      username,
      password: "M@sunur1n",
      fullname,
      email,
      avatar: avatarUrl,
      availableApps: selectedApps.map(
        (appName) => apps.find((app) => app.name === appName)?.id
      ),
    };

    if (editingUser) {
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
    setSelectAll(item.availableApps?.length === apps.length);
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
    `${user.username} ${user.fullname} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
      <Heading mb={6}>Manage Personnels</Heading>
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
            <Th>Full Name</Th>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentItems.map((item) => (
            <Tr key={item.ID}>
              <Td>
                <HStack spacing={3}>
                  <Avatar
                    size="sm"
                    src={item.avatar}
                    name={`${item.givenName || "N/A"} ${item.sn || "N/A"}`}
                  />
                  <Text>{`${item.givenName || "N/A"} ${
                    item.sn || "N/A"
                  }`}</Text>
                </HStack>
              </Td>
              <Td>{item.username}</Td>
              <Td>{item.mail || "N/A"}</Td>
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
