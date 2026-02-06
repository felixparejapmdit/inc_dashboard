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
  Radio,
  RadioGroup,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Checkbox,
  Switch,
  Icon,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  FaUserShield,
  FaUsers,
  FaUserTie,
  FaUser,
  FaStar,
  FaRegIdBadge,
} from "react-icons/fa"; // Import icons
import axios from "axios";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import { usePermissionContext } from "../../contexts/PermissionContext";
const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false); // To handle Add/Edit mode
  const [isUserGroupModalOpen, setIsUserGroupModalOpen] = useState(false);

  const [groupUsers, setGroupUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();
  const { fetchPermissions: refreshGlobalPermissions } = usePermissionContext();

  useEffect(() => {
    fetchGroups();
    console.log("Permissions state updated:", permissions);
  }, [permissions]);

  const fetchGroups = () => {
    fetchData(
      "groups",
      (data) => setGroups(data),
      (err) =>
        toast({
          title: "Error loading groups",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to load groups"
    );
  };

  const fetchPermissions = (groupId) => {
    fetchData(
      `groups/${groupId}/permissions`,
      (data) => {
        console.log("Fetched Permissions:", data);

        const groupedPermissions = data.map((category) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          permissions: category.permissions.map((permission) => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            accessrights: permission.accessrights,
          })),
        }));

        setPermissions(groupedPermissions);
      },
      (err) => {
        console.error("Error fetching permissions:", err);
        toast({
          title: "Error loading permissions",
          description: err,
          status: "error",
          duration: 3000,
        });
      },
      "Failed to load permissions"
    );
  };

  const fetchGroupUsers = (groupId) => {
    fetchData(
      `groups/${groupId}/users`,
      (data) => setGroupUsers(data),
      (err) =>
        toast({
          title: "Error loading users",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to load group users"
    );
  };

  const handleShowUsers = (group) => {
    setSelectedGroup(group);
    fetchGroupUsers(group.id);
    setIsUserGroupModalOpen(true); // Open modal when a group row is clicked
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    fetchGroupUsers(group.id);
  };

  /* 
   * Updated handlePermissionChange to accept skipRefresh
   * This prevents spamming the global refresh when batch updating
   */
  const handlePermissionChange = async (
    groupId,
    permissionId,
    categoryId,
    accessrights,
    skipRefresh = false
  ) => {
    try {
      await putData(
        `groups/${groupId}/permissions`,
        { permissionId, categoryId, accessrights },
        null,
        "Failed to update permission"
      );

      if (!skipRefresh) {
        toast({
          title: "Permission updated successfully",
          status: "success",
          duration: 3000,
        });

        // Refresh global permissions if we edited the current user's group
        const currentGroupId = localStorage.getItem("groupId");
        if (currentGroupId && String(currentGroupId) === String(groupId)) {
          refreshGlobalPermissions(currentGroupId);
        }
      }
    } catch (error) {
      toast({
        title: "Error updating permission",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
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
      await postData("groups", newGroup, "Failed to add group");

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

      await putData(
        "user-groups", // endpoint
        userId, // userId becomes part of the URL like /user-groups/:id
        { group_id: newGroupId },
        "Failed to update group"
      );

      toast({
        title: "Group updated successfully",
        status: "success",
        duration: 3000,
      });

      if (selectedGroup) {
        fetchGroupUsers(selectedGroup.id);
      }
    } catch (error) {
      console.error("Error updating group:", error.message || error);
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
      await putData(
        "groups",
        editingGroup.id,
        editingGroup,
        "Failed to update group"
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

  const handleDeleteGroup = async (group) => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the group "${group.name}"?`
      );
      if (!confirmDelete) return;

      await deleteData("groups", group.id, "Failed to delete group");

      fetchGroups();

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
    <Box p={{ base: 2, md: 4 }} maxW="100%" mx="auto">
      <Stack spacing={6}>
        {/* Header Section */}
        <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={4}>
          <Box>
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.700">
              Group Management
            </Text>
            <Text fontSize="sm" color="gray.500">
              Manage user groups and their system access permissions.
            </Text>
          </Box>
          {!isAddingOrEditing && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => {
                setIsAddingOrEditing("add");
                setNewGroup({ name: "", description: "" });
                setPermissions([]);
              }}
            >
              Add New Group
            </Button>
          )}
        </Flex>

        {/* Groups Table Container */}
        <Box
          bg="white"
          shadow="md"
          rounded="lg"
          overflow="hidden"
          border="1px"
          borderColor="gray.200"
          w="100%"
          overflowX="auto"
        >
          <Table variant="simple" size={{ base: "sm", md: "md" }} w="100%">
            <Thead bg="gray.50">
              <Tr>
                <Th width="50px">#</Th>
                <Th minW="150px">Group Name</Th>
                <Th minW="200px" display={{ base: "none", md: "table-cell" }}>Description</Th>
                <Th width="140px" textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {/* Add Group Row (Input Mode) */}
              {isAddingOrEditing === "add" && (
                <Tr bg="blue.50">
                  <Td></Td>
                  <Td>
                    <Input
                      autoFocus
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      placeholder="Enter group name..."
                      value={newGroup.name}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, name: e.target.value })
                      }
                    />
                  </Td>
                  <Td display={{ base: "none", md: "table-cell" }}>
                    <Input
                      bg="white"
                      size={{ base: "sm", md: "md" }}
                      placeholder="Enter description..."
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          description: e.target.value,
                        })
                      }
                    />
                  </Td>
                  <Td>
                    <Flex justify="center" gap={2}>
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={handleAddGroup}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsAddingOrEditing(null);
                          setNewGroup({ name: "", description: "" });
                          setPermissions([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              )}

              {/* Group Rows */}
              {groups.map((group, index) => {
                const groupIcon = (() => {
                  switch (group.name) {
                    case "Admin": return <FaUserShield />;
                    case "Section Chief": return <FaUsers />;
                    case "Team Leader": return <FaUserTie />;
                    case "User": return <FaUser />;
                    case "VIP": return <FaStar />;
                    default: return <FaRegIdBadge />;
                  }
                })();

                const isSelected = selectedGroup?.id === group.id;
                const isEditingThis = editingGroup?.id === group.id;

                return (
                  <React.Fragment key={group.id}>
                    <Tr
                      onClick={() => !isEditingThis && handleShowUsers(group)}
                      cursor="pointer"
                      bg={isSelected ? "blue.50" : "white"}
                      _hover={{ bg: isSelected ? "blue.50" : "gray.50" }}
                      transition="background 0.2s"
                      borderLeft={isSelected ? "4px solid" : "4px solid transparent"}
                      borderColor="blue.500"
                    >
                      <Td fontWeight="medium" color="gray.500">{index + 1}</Td>
                      <Td>
                        {isEditingThis ? (
                          <Input
                            size="sm"
                            value={editingGroup.name}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setEditingGroup({ ...editingGroup, name: e.target.value })
                            }
                          />
                        ) : (
                          <Flex align="center" gap={3}>
                            <Box
                              p={2}
                              bg={isSelected ? "blue.100" : "gray.100"}
                              rounded="full"
                              color={isSelected ? "blue.600" : "gray.500"}
                            >
                              {groupIcon}
                            </Box>
                            <Text fontWeight="semibold" color="gray.700">
                              {group.name}
                            </Text>
                          </Flex>
                        )}
                      </Td>
                      <Td display={{ base: "none", md: "table-cell" }}>
                        {isEditingThis ? (
                          <Input
                            size="sm"
                            value={editingGroup.description}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                          />
                        ) : (
                          <Text color="gray.600" fontSize="sm" noOfLines={1}>
                            {group.description || "No description provided."}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Flex justify="center" gap={2}>
                          {isEditingThis ? (
                            <>
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateGroup();
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingGroup(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                aria-label="Edit group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGroup(group);
                                  setIsAddingOrEditing("edit");
                                  setEditingGroup(group);
                                  fetchPermissions(group.id);
                                }}
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                aria-label="Delete group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGroup(group);
                                }}
                              />
                            </>
                          )}
                        </Flex>
                      </Td>
                    </Tr>

                    {/* Expandable Permissions Section */}
                    {isAddingOrEditing && selectedGroup?.id === group.id && (
                      <Tr bg="gray.50">
                        <Td colSpan={4} p={0}>
                          <Box p={6} borderTop="1px" borderBottom="1px" borderColor="gray.200">
                            <Flex justify="space-between" align="center" mb={6}>
                              <Box>
                                <Text fontSize="lg" fontWeight="bold" color="blue.700">
                                  {isAddingOrEditing === "add"
                                    ? "Add Permissions"
                                    : `Permissions for ${group.name}`}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  Define what this group can access within the system.
                                </Text>
                              </Box>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setIsAddingOrEditing(null);
                                  setSelectedGroup(null);
                                }}
                              >
                                Close Editor
                              </Button>
                            </Flex>

                            <Box bg="white" shadow="sm" rounded="md" border="1px" borderColor="gray.200" overflow="hidden">
                              <Table variant="simple" size="sm">
                                <Thead bg="gray.100">
                                  <Tr>
                                    <Th py={3}>Category / Permission</Th>
                                    <Th py={3}>Description</Th>
                                    <Th py={3} textAlign="center" width="150px">Grant Access</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {permissions.map((category) => {
                                    // Helper for category-level operations
                                    const allGranted = category.permissions.every(p => p.accessrights === 1);

                                    return (
                                      <React.Fragment key={category.categoryId}>
                                        {/* Category Header Row */}
                                        <Tr bg="gray.50">
                                          <Td colSpan={2}>
                                            <Flex align="center" gap={2}>
                                              <Icon as={FaUsers} color="gray.400" />
                                              <Text fontWeight="bold" color="gray.700">
                                                {category.categoryName}
                                              </Text>
                                            </Flex>
                                          </Td>
                                          <Td textAlign="center">
                                            <Flex justify="center" align="center">
                                              <Checkbox
                                                size="sm"
                                                isChecked={allGranted}
                                                onChange={async () => {
                                                  const newAccess = allGranted ? 0 : 1;

                                                  // 1. Optimistic UI Update
                                                  setPermissions(prev => prev.map(cat =>
                                                    cat.categoryId === category.categoryId
                                                      ? { ...cat, permissions: cat.permissions.map(p => ({ ...p, accessrights: newAccess })) }
                                                      : cat
                                                  ));

                                                  // 2. Batch API Calls
                                                  try {
                                                    const promises = category.permissions.map(perm =>
                                                      handlePermissionChange(selectedGroup.id, perm.id, category.categoryId, newAccess, true)
                                                    );

                                                    await Promise.all(promises);

                                                    // 3. Single Global Refresh & Toast
                                                    toast({
                                                      title: "Permissions updated successfully",
                                                      status: "success",
                                                      duration: 3000,
                                                    });

                                                    const currentGroupId = localStorage.getItem("groupId");
                                                    if (currentGroupId && String(currentGroupId) === String(selectedGroup.id)) {
                                                      refreshGlobalPermissions(currentGroupId);
                                                    }

                                                  } catch (error) {
                                                    console.error("Batch update failed", error);
                                                  }
                                                }}
                                              >
                                                <Text fontSize="xs" fontWeight="semibold" ml={1}>
                                                  {allGranted ? "REVOKE ALL" : "GRANT ALL"}
                                                </Text>
                                              </Checkbox>
                                            </Flex>
                                          </Td>
                                        </Tr>

                                        {/* Individual Permissions */}
                                        {category.permissions.map((perm) => (
                                          <Tr key={perm.id} _hover={{ bg: "gray.50" }}>
                                            <Td pl={10}>
                                              <Text fontSize="sm" fontWeight="medium">
                                                {perm.name}
                                              </Text>
                                            </Td>
                                            <Td color="gray.500" fontSize="sm">
                                              {perm.description || "—"}
                                            </Td>
                                            <Td textAlign="center">
                                              <Flex justify="center" align="center">
                                                <Switch
                                                  colorScheme="green"
                                                  isChecked={perm.accessrights === 1}
                                                  onChange={(e) => {
                                                    const newValue = e.target.checked ? 1 : 0;

                                                    // Optimistic UI update
                                                    setPermissions(prev => prev.map(cat =>
                                                      cat.categoryId === category.categoryId
                                                        ? { ...cat, permissions: cat.permissions.map(p => p.id === perm.id ? { ...p, accessrights: newValue } : p) }
                                                        : cat
                                                    ));

                                                    handlePermissionChange(selectedGroup.id, perm.id, category.categoryId, newValue);
                                                  }}
                                                />
                                              </Flex>
                                            </Td>
                                          </Tr>
                                        ))}
                                      </React.Fragment>
                                    );
                                  })}
                                </Tbody>
                              </Table>
                            </Box>
                          </Box>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </Stack>    <Modal
        isOpen={isUserGroupModalOpen}
        onClose={() => setIsUserGroupModalOpen(false)}
        isCentered
        size={{ base: "full", md: "xl", lg: "3xl" }} // Dynamic sizing
      >
        <ModalOverlay />
        <ModalContent
          maxWidth={{ base: "90vw", md: "80vw", lg: "60vw" }} // Responsive width
          overflow="hidden"
          p={4}
        >
          {/* Fixed Modal Header */}
          <ModalHeader>Users in Group: {selectedGroup?.name}</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Box maxHeight="400px" overflowY="auto">
              {" "}
              {/* Scrollable tbody */}
              <Table variant="simple">
                <Thead
                  position="sticky"
                  top="0"
                  zIndex="1"
                  backgroundColor="white"
                  boxShadow="md"
                >
                  <Tr>
                    <Th>#</Th>
                    <Th>Fullname</Th>
                    <Th>Username</Th>
                    <Th>Email</Th>
                    <Th>Group</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {groupUsers.map((user, index) => (
                    // <Tr key={user.id}>
                    <Tr key={`${user.id}-${index}`}>
                      <Td>{index + 1}</Td> {/* Row number */}
                      <Td>{user.fullname || "N/A"}</Td>
                      <Td>{user.username}</Td>
                      <Td>{user.email || "N/A"}</Td>
                      <Td>
                        <Select
                          placeholder="Select Group"
                          value={user.group_id || selectedGroup?.id || ""}
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
                  ))}
                </Tbody>
              </Table>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={() => setIsUserGroupModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* {selectedGroup && (
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
        )} */}
    </Box >
  );
};

export default GroupManagement;
