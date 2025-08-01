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
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
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

  const handlePermissionChange = async (
    groupId,
    permissionId,
    categoryId,
    accessrights
  ) => {
    try {
      await putData(
        `groups/${groupId}/permissions`,
        { permissionId, categoryId, accessrights },
        null,
        "Failed to update permission"
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
                    <Td
                      onClick={(e) => {
                        if (editingGroup && editingGroup.id === group.id) {
                          e.stopPropagation(); // Prevent modal from opening if editing
                        }
                      }}
                    >
                      <Flex align="center">
                        {groupIcon && <Box mr={2}>{groupIcon}</Box>}{" "}
                        {/* Display icon */}
                        {editingGroup && editingGroup.id === group.id ? (
                          <Input
                            value={editingGroup.name}
                            onClick={(e) => e.stopPropagation()} // Prevent event from propagating while editing
                            onChange={(e) =>
                              setEditingGroup({
                                ...editingGroup,
                                name: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <Text>{group.name}</Text> // Clicking here should still open the modal
                        )}
                      </Flex>
                    </Td>
                    <Td
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking on input
                    >
                      {editingGroup && editingGroup.id === group.id ? (
                        <Input
                          value={editingGroup.description}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent triggering row click
                            setEditingGroup({
                              ...editingGroup,
                              description: e.target.value,
                            });
                          }}
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
                              <Th width="10%">Category</Th>
                              <Th width="20%">Permission</Th>
                              <Th width="30%">Description</Th>{" "}
                              {/* Keep description properly aligned */}
                              <Th width="10%" textAlign="center">
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
                                    <Td>
                                      {/* Keep this blank to align the description column */}
                                    </Td>
                                    <Td textAlign="center">
                                      <Flex align="center" justify="center">
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
                                        <Text
                                          fontSize="sm"
                                          fontWeight="bold"
                                          minWidth="80px"
                                          textAlign="left"
                                        >
                                          Select All
                                        </Text>
                                      </Flex>
                                    </Td>
                                    <Td />{" "}
                                    {/* Empty column to maintain correct alignment */}
                                  </Tr>

                                  {/* Render Permissions Under the Category */}
                                  {category.permissions.map(
                                    (permission, permissionIndex) => (
                                      <Tr key={permission.id}>
                                        <Td textAlign="center">
                                          {permissionIndex + 1}
                                        </Td>
                                        <Td>{permission.name}</Td>
                                        <Td>
                                          {permission.description ||
                                            "No description available"}
                                        </Td>{" "}
                                        {/* Add this line */}
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
      </Stack>
    </Box>
  );
};

export default GroupManagement;
