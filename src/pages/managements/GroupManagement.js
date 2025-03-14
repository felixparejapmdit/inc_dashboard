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

  useEffect(() => {
    fetchGroups();
    console.log("Permissions state updated:", permissions);
  }, [permissions]);

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

  const fetchPermissions = async (groupId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/permissions`
      );
      console.log("Fetched Permissions:", response.data);

      // Group permissions by category
      const groupedPermissions = response.data.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        permissions: category.permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
          accessrights: permission.accessrights,
        })),
      }));

      setPermissions(groupedPermissions); // Set state with grouped permissions
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        title: "Error loading permissions",
        description: error.response?.data?.message || error.message,
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

  const handleShowUsers = (group) => {
    setSelectedGroup(group);
    fetchGroupUsers(group.id);
    setIsUserGroupModalOpen(true); // Open modal when a group row is clicked
  };

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    fetchGroupUsers(group.id);
  };

  const handlePermissionChange = async (
    groupId,
    permissionId,
    categoryId,
    accessrights
  ) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/groups/${groupId}/permissions`,
        { permissionId, categoryId, accessrights }
      );
      toast({
        title: "Permission updated successfully",
        status: "success",
        duration: 3000,
      });
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

  const handleDeleteGroup = async (group) => {
    try {
      // Confirm before deleting the group
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the group "${group.name}"?`
      );

      if (!confirmDelete) return;

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/groups/${group.id}`
      );

      fetchGroups(); // Refresh the list of groups
      toast({
        title: "Group deleted successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting group",
        description: error.response?.data?.message || error.message,
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
                {!isAddingOrEditing && (
                  <IconButton
                    icon={<AddIcon />}
                    onClick={() => {
                      setIsAddingOrEditing("add");
                      setNewGroup({ name: "", description: "" });
                      setPermissions([]); // Reset permissions for adding a new group
                    }}
                    size="sm"
                    aria-label="Add Group"
                  />
                )}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {/* Add Group Row */}
            {isAddingOrEditing === "add" && (
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
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      setIsAddingOrEditing(null); // Exit add mode
                      setSelectedGroup(null); // Deselect group to hide permissions table
                      setNewGroup({ name: "", description: "" }); // Clear input fields
                      setPermissions([]); // Reset permissions to default
                    }}
                  >
                    Cancel
                  </Button>
                </Td>
              </Tr>
            )}

            {/* Group Rows */}
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
                    return <FaRegIdBadge />; // Default icon for unmatched cases
                }
              })();

              return (
                <React.Fragment key={group.id}>
                  <Tr
                    onClick={() => handleShowUsers(group)}
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
                              onClick={(event) => {
                                event.stopPropagation(); // Prevents row click event
                                handleUpdateGroup();
                              }}
                              size="sm"
                              mr={2}
                            >
                              Save
                            </Button>

                            <Button
                              colorScheme="red"
                              onClick={(event) => {
                                event.stopPropagation(); // Prevents row click event
                                setEditingGroup(null);
                              }}
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
                              onClick={(event) => {
                                event.stopPropagation(); // Prevent triggering row click
                                setSelectedGroup(group);
                                setIsAddingOrEditing("edit");
                                setEditingGroup(group);
                                fetchPermissions(group.id); // Load permissions for editing
                              }}
                              colorScheme="yellow"
                              size="sm"
                              mr={2}
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              onClick={(event) => {
                                event.stopPropagation(); // Prevent triggering row click
                                handleDeleteGroup(group);
                              }}
                              size="sm"
                              colorScheme="red"
                            />
                          </>
                        )}
                      </Flex>
                    </Td>
                  </Tr>
                  {/* Inline Permissions Table */}
                  {isAddingOrEditing && selectedGroup?.id === group.id && (
                    <Tr>
                      <Td colSpan={4}>
                        <Text fontSize="lg" fontWeight="bold" mt={4}>
                          {isAddingOrEditing === "add"
                            ? "Add Group with Permissions"
                            : `Edit Permissions for ${group.name}`}
                        </Text>
                        <Flex mt={4} justify="flex-end">
                          <Button
                            colorScheme="green"
                            onClick={() => {
                              setIsAddingOrEditing(null); // Exit editing/adding mode
                              setSelectedGroup(null); // Hide permissions table
                            }}
                          >
                            Hide
                          </Button>
                        </Flex>
                        <Table variant="striped" mt={2}>
                          <Thead>
                            <Tr>
                              <Th width="30%">Category</Th>
                              <Th width="40%">Permission</Th>
                              <Th width="15%" textAlign="center">
                                <Flex align="center" justify="center">
                                  <Checkbox
                                    isChecked={permissions.every((category) =>
                                      category.permissions.every(
                                        (perm) => perm.accessrights === 1
                                      )
                                    )}
                                    onChange={() => {
                                      const allGranted = permissions.every(
                                        (category) =>
                                          category.permissions.every(
                                            (perm) => perm.accessrights === 1
                                          )
                                      );

                                      const newAccessRight = allGranted ? 0 : 1;

                                      const updatedPermissions =
                                        permissions.map((cat) => ({
                                          ...cat,
                                          permissions: cat.permissions.map(
                                            (perm) => ({
                                              ...perm,
                                              accessrights: newAccessRight,
                                            })
                                          ),
                                        }));

                                      setPermissions(updatedPermissions);

                                      permissions.forEach((category) =>
                                        category.permissions.forEach(
                                          (permission) => {
                                            handlePermissionChange(
                                              selectedGroup.id,
                                              permission.id,
                                              category.categoryId,
                                              newAccessRight
                                            );
                                          }
                                        )
                                      );
                                    }}
                                  />
                                  <span style={{ marginLeft: "8px" }}>
                                    {permissions.every((category) =>
                                      category.permissions.every(
                                        (perm) => perm.accessrights === 1
                                      )
                                    )
                                      ? "Unselect All"
                                      : "Grant All"}
                                  </span>
                                </Flex>
                              </Th>
                              <Th width="15%" textAlign="center">
                                Deny
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {permissions.map((category) => {
                              // Check if all permissions in this category are granted
                              const allCategoryGranted =
                                category.permissions.every(
                                  (permission) => permission.accessrights === 1
                                );

                              return (
                                <React.Fragment key={category.categoryId}>
                                  {/* Category Header with Checkbox */}
                                  <Tr bg="gray.100">
                                    <Td colSpan={2} fontWeight="bold">
                                      {category.categoryName}
                                    </Td>
                                    <Td textAlign="center">
                                      <Flex align="left" justify="left" gap={2}>
                                        <Checkbox
                                          isChecked={allCategoryGranted}
                                          onChange={() => {
                                            const newAccessRight =
                                              allCategoryGranted ? 0 : 1;

                                            const updatedPermissions =
                                              permissions.map((cat) =>
                                                cat.categoryId ===
                                                category.categoryId
                                                  ? {
                                                      ...cat,
                                                      permissions:
                                                        cat.permissions.map(
                                                          (perm) => ({
                                                            ...perm,
                                                            accessrights:
                                                              newAccessRight,
                                                          })
                                                        ),
                                                    }
                                                  : cat
                                              );

                                            setPermissions(updatedPermissions);

                                            category.permissions.forEach(
                                              (permission) => {
                                                handlePermissionChange(
                                                  selectedGroup.id,
                                                  permission.id,
                                                  category.categoryId,
                                                  newAccessRight
                                                );
                                              }
                                            );
                                          }}
                                        />
                                        <Text fontSize="sm" fontWeight="bold">
                                          Select All
                                        </Text>
                                      </Flex>
                                    </Td>
                                    <Td />
                                  </Tr>

                                  {/* Render Permissions Under the Category */}
                                  {category.permissions.map(
                                    (permission, permissionIndex) => (
                                      <Tr key={permission.id}>
                                        <Td textAlign="center">
                                          {permissionIndex + 1}
                                        </Td>
                                        <Td>{permission.name}</Td>
                                        <Td textAlign="center">
                                          <RadioGroup
                                            onChange={async (value) => {
                                              const updatedPermissions =
                                                permissions.map((cat) =>
                                                  cat.categoryId ===
                                                  category.categoryId
                                                    ? {
                                                        ...cat,
                                                        permissions:
                                                          cat.permissions.map(
                                                            (perm) =>
                                                              perm.id ===
                                                              permission.id
                                                                ? {
                                                                    ...perm,
                                                                    accessrights:
                                                                      parseInt(
                                                                        value
                                                                      ),
                                                                  }
                                                                : perm
                                                          ),
                                                      }
                                                    : cat
                                                );

                                              setPermissions(
                                                updatedPermissions
                                              );

                                              await handlePermissionChange(
                                                selectedGroup.id,
                                                permission.id,
                                                category.categoryId,
                                                parseInt(value)
                                              );
                                            }}
                                            value={String(
                                              permission.accessrights
                                            )}
                                          >
                                            <Flex
                                              justifyContent="left"
                                              align="left"
                                              gap={10}
                                            >
                                              <Radio value="1">Grant</Radio>
                                            </Flex>
                                          </RadioGroup>
                                        </Td>
                                        <Td textAlign="center">
                                          <RadioGroup
                                            onChange={async (value) => {
                                              const updatedPermissions =
                                                permissions.map((cat) =>
                                                  cat.categoryId ===
                                                  category.categoryId
                                                    ? {
                                                        ...cat,
                                                        permissions:
                                                          cat.permissions.map(
                                                            (perm) =>
                                                              perm.id ===
                                                              permission.id
                                                                ? {
                                                                    ...perm,
                                                                    accessrights:
                                                                      parseInt(
                                                                        value
                                                                      ),
                                                                  }
                                                                : perm
                                                          ),
                                                      }
                                                    : cat
                                                );

                                              setPermissions(
                                                updatedPermissions
                                              );

                                              await handlePermissionChange(
                                                selectedGroup.id,
                                                permission.id,
                                                category.categoryId,
                                                parseInt(value)
                                              );
                                            }}
                                            value={String(
                                              permission.accessrights
                                            )}
                                          >
                                            <Flex
                                              justifyContent="center"
                                              align="center"
                                              gap={6}
                                            >
                                              <Radio value="0">Deny</Radio>
                                            </Flex>
                                          </RadioGroup>
                                        </Td>
                                      </Tr>
                                    )
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </Tbody>
                        </Table>

                        <Flex mt={4} justify="flex-end">
                          <Button
                            colorScheme="green"
                            onClick={() => {
                              setIsAddingOrEditing(null); // Exit editing/adding mode
                              setSelectedGroup(null); // Hide permissions table
                            }}
                          >
                            Hide
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              );
            })}
          </Tbody>
        </Table>

        <Modal
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
                      <Tr key={user.id}>
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
      </Stack>
    </Box>
  );
};

export default GroupManagement;
