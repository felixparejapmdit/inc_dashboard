import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Text,
  Flex,
  Select,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  FaUserShield,
  FaUsers,
  FaUserTie,
  FaUser,
  FaStar,
} from "react-icons/fa"; // Import icons
import axios from "axios";

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupUsers, setGroupUsers] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/groups`
      );
      setGroups(response.data);
    } catch (error) {
      toast({
        title: "Error loading groups",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const fetchGroupUsers = async (groupId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/users`
      );
      setGroupUsers(response.data); // Assuming setGroupUsers is a state setter
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error loading users",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    fetchGroupUsers(group.id);
  };

  const handleAddGroup = async () => {
    if (!newGroup.name) {
      toast({
        title: "Group name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/groups`, newGroup);
      fetchGroups();
      setNewGroup({ name: "", description: "" });
      setIsAdding(false);
      toast({
        title: "Group added successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding group",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleGroupChange = async (userId, newGroupId) => {
    try {
      console.log("Updating user group:", { userId, newGroupId });
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user-groups/${userId}`,
        { group_id: newGroupId }
      );

      toast({
        title: "Group updated successfully",
        status: "success",
        duration: 3000,
      });

      // Refresh the current group's user list
      if (selectedGroup) {
        fetchGroupUsers(selectedGroup.id);
      }
    } catch (error) {
      console.error("Error updating group:", error.response?.data || error);
      toast({
        title: "Error updating group",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateGroup = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/groups/${editingGroup.id}`,
        editingGroup
      );
      fetchGroups();
      setEditingGroup(null);
      toast({
        title: "Group updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating group",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/groups/${deletingGroup.id}`
      );
      fetchGroups();
      setDeletingGroup(null);
      toast({
        title: "Group deleted successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting group",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Group Management
          </Text>
        </Flex>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th> {/* Add header for row number */}
              <Th>Name</Th>
              <Th>Description</Th>
              <Th
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {!isAdding && (
                  <IconButton
                    icon={<AddIcon />}
                    onClick={() => setIsAdding(true)}
                    size="sm"
                    aria-label="Add Group"
                  />
                )}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isAdding && (
              <Tr>
                <Td></Td> {/* Empty cell for row number */}
                <Td>
                  <Input
                    placeholder="Group Name"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Description"
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                  />
                </Td>
                <Td>
                  <Button colorScheme="green" onClick={handleAddGroup} mr={2}>
                    Save
                  </Button>
                  <Button colorScheme="red" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </Td>
              </Tr>
            )}
            {groups.map((group, index) => {
              // Determine the appropriate icon for the group
              const groupIcon = (() => {
                switch (group.name) {
                  case "Admin":
                    return <FaUserShield />;
                  case "Section Chief":
                    return <FaUsers />;
                  case "Team Leader":
                    return <FaUserTie />;
                  case "User":
                    return <FaUser />;
                  case "VIP":
                    return <FaStar />;
                  default:
                    return null; // Fallback if group name doesn't match
                }
              })();

              return (
                <Tr
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  style={{
                    cursor: "pointer",
                    background:
                      selectedGroup && selectedGroup.id === group.id
                        ? "#f0f0f0"
                        : "transparent",
                  }}
                >
                  <Td>{index + 1}</Td> {/* Add row number */}
                  <Td>
                    <Flex align="center">
                      {groupIcon && <Box mr={2}>{groupIcon}</Box>}{" "}
                      {/* Display icon */}
                      {editingGroup && editingGroup.id === group.id ? (
                        <Input
                          value={editingGroup.name}
                          onChange={(e) =>
                            setEditingGroup({
                              ...editingGroup,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        group.name
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    {editingGroup && editingGroup.id === group.id ? (
                      <Input
                        value={editingGroup.description}
                        onChange={(e) =>
                          setEditingGroup({
                            ...editingGroup,
                            description: e.target.value,
                          })
                        }
                      />
                    ) : (
                      group.description
                    )}
                  </Td>
                  <Td>
                    <Flex justify="center">
                      {editingGroup && editingGroup.id === group.id ? (
                        <>
                          <Button
                            colorScheme="green"
                            onClick={handleUpdateGroup}
                            size="sm"
                            mr={2}
                          >
                            Save
                          </Button>
                          <Button
                            colorScheme="red"
                            onClick={() => setEditingGroup(null)}
                            size="sm"
                            mr={2}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            icon={<EditIcon />}
                            onClick={() => setEditingGroup(group)}
                            colorScheme="yellow"
                            size="sm"
                            mr={2}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => setDeletingGroup(group)}
                            size="sm"
                            colorScheme="red"
                          />
                        </>
                      )}
                    </Flex>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        ;
        {selectedGroup && (
          <Box mt={5}>
            <Text fontSize="xl" fontWeight="bold" mb={3}>
              Users in Group: {selectedGroup.name}
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Fullname</Th>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Group</Th>
                </Tr>
              </Thead>
              <Tbody>
                {groupUsers.map((user, index) => {
                  if (!user || !user.id) {
                    console.warn(`Invalid user data at index ${index}:`, user);
                    return null; // Skip invalid rows
                  }
                  return (
                    <Tr key={user.id}>
                      <Td>{user.fullname || "N/A"}</Td>
                      <Td>{user.username}</Td>
                      <Td>{user.email || "N/A"}</Td>
                      <Td>
                        <Select
                          placeholder="Select Group"
                          value={user.group_id || selectedGroup?.id || ""} // Default to selected group ID if user.group_id is undefined
                          onChange={(e) =>
                            handleGroupChange(user.id, e.target.value)
                          }
                        >
                          {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.name}
                            </option>
                          ))}
                        </Select>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default GroupManagement;
