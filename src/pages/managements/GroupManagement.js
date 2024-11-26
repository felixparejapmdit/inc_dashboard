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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
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

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>
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
            {groups.map((group) => (
              <Tr key={group.id}>
                <Td>
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
                  <Flex>
                    {editingGroup && editingGroup.id === group.id ? (
                      <>
                        <Button
                          colorScheme="green"
                          onClick={handleUpdateGroup}
                          mr={2}
                        >
                          Save
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => setEditingGroup(null)}
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
                          mr={2}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => setDeletingGroup(group)}
                          colorScheme="red"
                        />
                      </>
                    )}
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Stack>
    </Box>
  );
};

export default GroupManagement;
