import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { fetchData, putData } from "../utils/fetchData";

const ITEMS_PER_PAGE = 5;

const TemporarilyDeletedUsers = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const toast = useToast();
  const cancelRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchData(
      "personnels/deleted",
      setDeletedUsers,
      null,
      "Failed to load deleted users."
    );
  }, []);

  const handleConfirmRestore = async () => {
    if (!selectedUser) return;

    try {
      await putData(`personnels/restore/${selectedUser.personnel_id}`);
      setDeletedUsers((prev) =>
        prev.filter((user) => user.personnel_id !== selectedUser.personnel_id)
      );
      toast({
        title: "User restored successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Restore failed.",
        description: error.message || "An error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setSelectedUser(null);
    onClose();
  };

  const filteredUsers = deletedUsers.filter((user) => {
    const fullName = `${user.givenname || ""} ${user.middlename || ""} ${
      user.surname_husband || ""
    }`;
    return fullName.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const openRestoreDialog = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  return (
    <Box p={6}>
      <Heading size="md" mb={4}>
        Temporarily Deleted Users
      </Heading>

      <Flex mb={4} justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Input
          placeholder="Search by name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to page 1 on search
          }}
          maxW="300px"
        />
      </Flex>

      <Table variant="simple" size="md">
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
          {paginatedUsers.map((user, index) => (
            <Tr key={user.personnel_id}>
              <Td>{startIndex + index + 1}</Td>
              <Td>{user.givenname || "N/A"}</Td>
              <Td>{user.middlename || "N/A"}</Td>
              <Td>{user.surname_husband || "N/A"}</Td>
              <Td>
                <IconButton
                  icon={<RepeatIcon />}
                  colorScheme="green"
                  size="sm"
                  aria-label="Restore user"
                  onClick={() => openRestoreDialog(user)}
                />
              </Td>
            </Tr>
          ))}
          {paginatedUsers.length === 0 && (
            <Tr>
              <Td colSpan={5}>
                <Text textAlign="center" py={4} color="gray.500">
                  No temporarily deleted users found.
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {totalPages > 1 && (
        <Flex justifyContent="center" mt={4} gap={4}>
          <Button onClick={handlePrevPage} isDisabled={currentPage === 1}>
            Previous
          </Button>
          <Text alignSelf="center">
            Page {currentPage} of {totalPages}
          </Text>
          <Button onClick={handleNextPage} isDisabled={currentPage === totalPages}>
            Next
          </Button>
        </Flex>
      )}

      {/* AlertDialog for Confirmation */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Restore
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to restore{" "}
              <strong>
                {selectedUser?.givenname} {selectedUser?.middlename}{" "}
                {selectedUser?.surname_husband}
              </strong>
              ?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleConfirmRestore}
                ml={3}
              >
                Restore
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TemporarilyDeletedUsers;
