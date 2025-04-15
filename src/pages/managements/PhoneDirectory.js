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
  Flex,
  Checkbox,
  Select,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, PhoneIcon } from "@chakra-ui/icons";
import axios from "axios";

const PhoneDirectory = () => {
  const [directory, setDirectory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEntry, setNewEntry] = useState({
    name: "",
    phone: "",
    department: "",
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cancelRef = useRef();
  const toast = useToast();

  const [personnelList, setPersonnelList] = useState([]);

  useEffect(() => {
    const fetchPersonnels = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/personnels`
        );
        setPersonnelList(response.data);
      } catch (error) {
        console.error("Failed to fetch personnels", error);
      }
    };

    fetchPersonnels();
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/phone-directory`
      );
      setDirectory(response.data);
      setFiltered(response.data);
    } catch (error) {
      toast({ title: "Error loading data", status: "error", duration: 3000 });
    }
  };

  useEffect(() => {
    const filteredResults = directory.filter((entry) =>
      `${entry.personnel_id} ${entry.location} ${entry.extension} ${entry.phone_number} ${entry.phone_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFiltered(filteredResults);
  }, [searchQuery, directory]);

  const handleSave = async () => {
    const entry = editingEntry || newEntry;
    const { personnel_id, location } = entry;

    if (!personnel_id || !location) {
      toast({
        title: "Personnel ID and Location are required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      if (editingEntry) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/phone-directory/${editingEntry.id}`,
          editingEntry
        );
        toast({ title: "Entry updated", status: "success", duration: 3000 });
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/phone-directory`,
          newEntry
        );
        toast({ title: "Entry added", status: "success", duration: 3000 });
      }

      fetchDirectory();
      setIsModalOpen(false);
      setNewEntry({
        personnel_id: "",
        location: "",
        extension: "",
        phone_number: "",
        phone_name: "",
        is_active: true,
      });
      setEditingEntry(null);
    } catch (error) {
      toast({ title: "Error saving entry", status: "error", duration: 3000 });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/phone-directory/${deletingEntry.id}`
      );
      toast({ title: "Entry deleted", status: "success", duration: 3000 });
      fetchDirectory();
    } catch (error) {
      toast({ title: "Error deleting entry", status: "error", duration: 3000 });
    } finally {
      setDeletingEntry(null);
    }
  };

  return (
    <Box p={6} rounded="xl" boxShadow="xl" bg="gray.50">
      <Stack spacing={6}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            📇 Phone Directory
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => setIsModalOpen(true)}
          >
            Add Contact
          </Button>
        </Flex>

        <Input
          placeholder="Search name or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
          borderColor="gray.400"
        />

        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Department</Th>
              <Th textAlign="right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.length > 0 ? (
              filtered.map((entry, index) => (
                <Tr key={entry.id}>
                  <Td>{index + 1}</Td>
                  <Td>{entry.name}</Td>
                  <Td>{entry.phone}</Td>
                  <Td>{entry.department}</Td>
                  <Td textAlign="right">
                    <IconButton
                      icon={<EditIcon />}
                      colorScheme="yellow"
                      mr={2}
                      onClick={() => {
                        setEditingEntry(entry);
                        setIsModalOpen(true);
                      }}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => setDeletingEntry(entry)}
                    />
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} textAlign="center">
                  No entries found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Stack>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(null);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingEntry ? "Edit Entry" : "Add New Entry"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Select
                placeholder="Select Personnel"
                value={
                  editingEntry
                    ? editingEntry.personnel_id
                    : newEntry.personnel_id
                }
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        personnel_id: e.target.value,
                      })
                    : setNewEntry({
                        ...newEntry,
                        personnel_id: e.target.value,
                      })
                }
              >
                {personnelList.map((person) => (
                  <option key={person.personnel_id} value={person.personnel_id}>
                    {person.givenname} {person.surname_husband}
                  </option>
                ))}
              </Select>

              <Input
                placeholder="Location"
                value={editingEntry ? editingEntry.location : newEntry.location}
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        location: e.target.value,
                      })
                    : setNewEntry({ ...newEntry, location: e.target.value })
                }
              />
              <Input
                placeholder="Extension"
                value={
                  editingEntry ? editingEntry.extension : newEntry.extension
                }
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        extension: e.target.value,
                      })
                    : setNewEntry({ ...newEntry, extension: e.target.value })
                }
              />
              <Input
                placeholder="Phone Number"
                value={
                  editingEntry
                    ? editingEntry.phone_number
                    : newEntry.phone_number
                }
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        phone_number: e.target.value,
                      })
                    : setNewEntry({ ...newEntry, phone_number: e.target.value })
                }
              />
              <Input
                placeholder="Phone Name"
                value={
                  editingEntry ? editingEntry.phone_name : newEntry.phone_name
                }
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        phone_name: e.target.value,
                      })
                    : setNewEntry({ ...newEntry, phone_name: e.target.value })
                }
              />
              <Checkbox
                isChecked={
                  editingEntry ? editingEntry.is_active : newEntry.is_active
                }
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        is_active: e.target.checked,
                      })
                    : setNewEntry({ ...newEntry, is_active: e.target.checked })
                }
              >
                Active
              </Checkbox>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSave}>
              {editingEntry ? "Update" : "Save"}
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingEntry(null);
              }}
              ml={3}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingEntry}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingEntry(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Entry
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{deletingEntry?.name}" from the
              directory?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingEntry(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PhoneDirectory;
