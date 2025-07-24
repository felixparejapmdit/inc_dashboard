import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import axios from "axios";

const TemporarilyDeletedUsers = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const fetchDeletedUsers = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/personnels/deleted`
      );
      setDeletedUsers(res.data);
    } catch (error) {
      toast({
        title: "Failed to fetch deleted users.",
        status: "error",
        description: error.message,
        duration: 3000,
      });
    }
  };

  const handleRestore = async (personnelId) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/personnels/restore/${personnelId}`
      );
      setDeletedUsers((prev) =>
        prev.filter((user) => user.personnel_id !== personnelId)
      );
      toast({
        title: "User restored successfully.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Restore failed.",
        status: "error",
        description: error.message,
        duration: 3000,
      });
    }
  };

  const filteredUsers = deletedUsers.filter((user) => {
    const fullName = `${user.givenname || ""} ${user.middlename || ""} ${user.surname_husband || ""}`;
    return fullName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Box p={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Input
          placeholder="Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="300px"
        />
      </Flex>

      <Table variant="simple" size="lg">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Given Name</Th>
            <Th>Middle Name</Th>
            <Th>Surname (Husband)</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredUsers.map((user, index) => (
            <Tr key={user.personnel_id}>
              <Td>{index + 1}</Td>
              <Td>{user.givenname || "N/A"}</Td>
              <Td>{user.middlename || "N/A"}</Td>
              <Td>{user.surname_husband || "N/A"}</Td>
              <Td>
                <IconButton
                  icon={<RepeatIcon />}
                  colorScheme="green"
                  size="sm"
                  aria-label="Restore user"
                  onClick={() => handleRestore(user.personnel_id)}
                />
              </Td>
            </Tr>
          ))}

          {filteredUsers.length === 0 && (
            <Tr>
              <Td colSpan={5}>
                <Text textAlign="center" color="gray.600" py={4}>
                  No temporarily deleted users found.
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default TemporarilyDeletedUsers;
