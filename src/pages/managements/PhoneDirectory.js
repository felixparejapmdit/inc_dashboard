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
  useDisclosure,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  DownloadIcon,
  PhoneIcon,
} from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import axios from "axios";

const ITEMS_PER_PAGE = 10;

const PhoneDirectory = () => {
  const [directory, setDirectory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEntry, setNewEntry] = useState({
    name: "",
    location: "",
    prefix: "",
    extension: "",
    phone_name: "",
    dect_number: "",
    is_active: true,
  });

  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cancelRef = useRef();
  const toast = useToast();

  const [nameList, setNameList] = useState([]);
  const [isAdding, setIsAdding] = useState(false); // Track whether user is adding a new name
  const [newName, setNewName] = useState(""); // Track the new name input

  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  // Handle name addition
  const handleAddName = () => {
    if (newName.trim()) {
      setNameList((prevNames) => [...prevNames, newName]);
      setNewEntry({ ...newEntry, name: newName }); // Update form entry with the new name
      setNewName(""); // Reset the input field
      setIsAdding(false); // Close input field after adding
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsAdding(false); // Hide the input field
    setNewName(""); // Clear the input field
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Assuming the data is in the first sheet
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Parse the sheet into JSON
        const rows = XLSX.utils.sheet_to_json(sheet);

        // Now, we need to check if each row already exists in the database
        // You can adjust this logic depending on your backend validation
        const newEntries = rows.filter((row) => {
          // Add validation for checking duplicates based on some unique field like name
          // Example: if a contact already exists, don't import it
          return !nameList.some(
            (name) => name === row.name // Adjust this condition to match your validation
          );
        });

        if (newEntries.length > 0) {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/import-phone-directory`,
            { data: newEntries }
          );

          alert("Data imported successfully!");
        } else {
          alert("No new entries to import!");
        }
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Import error:", error);
      alert("An error occurred while importing the file.");
    }

    setIsImporting(false);
    onClose(); // Close modal after import
  };

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/phone-directory/names`
        );
        console.log(response.data); // Log the response to check data format
        setNameList(response.data);
      } catch (error) {
        console.error("Failed to fetch names", error);
      }
    };

    fetchNames();
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

  // 1️⃣ Search logic (always applies to full directory)
  useEffect(() => {
    const filteredResults = directory.filter((entry) => {
      const fullText = `
        ${entry.name || ""}
        ${entry.location || ""}
        ${entry.prefix || ""}
        ${entry.extension || ""}
        ${entry.dect_number || ""}
        ${entry.phone_name || ""}
      `
        .toLowerCase()
        .trim();

      return fullText.includes(searchQuery.toLowerCase());
    });

    setFiltered(filteredResults);
    setCurrentPage(1); // Reset to page 1 after search
  }, [searchQuery, directory]);

  const handleSave = async () => {
    const entry = editingEntry || newEntry;
    const { name, location, prefix, extension, phone_name } = entry;

    if (!name || !location || !prefix || !extension || !phone_name) {
      toast({
        title: "Please fill in all required fields",
        description:
          "Name, Location, Prefix, Extension, and Phone Name are required.",
        status: "warning",
        duration: 4000,
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
          `${process.env.REACT_APP_API_URL}/api/add_phone-directory`,
          newEntry
        );
        toast({ title: "Entry added", status: "success", duration: 3000 });
      }

      fetchDirectory();
      setIsModalOpen(false);
      setNewEntry({
        name: "",
        location: "",
        prefix: "",
        extension: "",
        dect_number: "",
        phone_name: "",
        is_active: true,
      });
      setEditingEntry(null);
    } catch (error) {
      console.error(error);
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
      console.error(error);
      toast({ title: "Error deleting entry", status: "error", duration: 3000 });
    } finally {
      setDeletingEntry(null);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);

  // 2️⃣ Pagination logic (only affects filtered results)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const renderPagination = () => (
    <Flex justifyContent="space-between" alignItems="center" my={3}>
      <Button onClick={handlePrev} isDisabled={currentPage === 1}>
        Previous
      </Button>
      <Text>
        Page {currentPage} of {totalPages || 1}
      </Text>
      <Button
        onClick={handleNext}
        isDisabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </Button>
    </Flex>
  );

  return (
    <Box p={6} rounded="xl" boxShadow="xl" bg="gray.50">
      <Stack spacing={6}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            📇 Phone Directory
          </Text>
          <Flex>
            {/* Add Contact Button */}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => setIsModalOpen(true)}
            >
              Add Contact
            </Button>

            {/* Import Button */}
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="teal"
              onClick={onOpen} // Open import dialog
              ml={4}
            >
              Import
            </Button>
          </Flex>

          {/* Add/Edit Contact Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {isAdding ? "Add New Name" : "Add Contact"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input
                  placeholder="Enter New Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Button onClick={handleAddName} mt={4}>
                  Add Name
                </Button>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Import Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Import Phone Directory</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  disabled={isImporting}
                />
                <Button
                  onClick={handleImport}
                  colorScheme="green"
                  mt={4}
                  isLoading={isImporting}
                  isDisabled={isImporting || !file}
                >
                  Import
                </Button>
                <Button onClick={onClose} colorScheme="red" mt={4} ml={2}>
                  Cancel
                </Button>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Flex>

        <Input
          placeholder="Search name, location, prefix, extension, DECT, phone name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
          borderColor="gray.400"
        />
        {renderPagination()}
        <Box overflowX="auto" w="100%">
          <Table variant="striped" colorScheme="gray" minW="1000px">
            <Thead>
              <Tr>
                <Th whiteSpace="nowrap">#</Th>
                <Th whiteSpace="nowrap">Name</Th>
                <Th whiteSpace="nowrap">Location</Th>
                <Th whiteSpace="nowrap">Prefix</Th>
                <Th whiteSpace="nowrap">Extension</Th>
                <Th whiteSpace="nowrap">DECT Number</Th>
                {/* <Th whiteSpace="nowrap">Phone Name</Th> */}
                <Th whiteSpace="nowrap">Status</Th>
                <Th textAlign="right" whiteSpace="nowrap">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentItems.length > 0 ? (
                currentItems.map((entry, index) => (
                  <Tr key={entry.id}>
                    <Td whiteSpace="nowrap">{startIndex + index + 1}</Td>
                    <Td
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      maxW="200px"
                    >
                      {entry.name}
                    </Td>
                    <Td
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      maxW="150px"
                    >
                      {entry.location}
                    </Td>
                    <Td whiteSpace="nowrap">{entry.prefix}</Td>
                    <Td whiteSpace="nowrap">{entry.extension}</Td>
                    <Td whiteSpace="nowrap">{entry.dect_number || "-"}</Td>
                    {/* <Td whiteSpace="nowrap">{entry.phone_name}</Td> */}
                    <Td whiteSpace="nowrap">
                      {entry.is_active ? (
                        <Text color="green.500">Active</Text>
                      ) : (
                        <Text color="red.500">Inactive</Text>
                      )}
                    </Td>
                    <Td textAlign="right" whiteSpace="nowrap">
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
                  <Td colSpan={9} textAlign="center">
                    No entries found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {renderPagination()}
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
              <div style={{ position: "relative" }}>
                <Box position="relative">
                  <Select
                    placeholder="Select Personnel Name"
                    value={editingEntry ? editingEntry.name : newEntry.name}
                    onChange={(e) =>
                      editingEntry
                        ? setEditingEntry({
                            ...editingEntry,
                            name: e.target.value,
                          })
                        : setNewEntry({ ...newEntry, name: e.target.value })
                    }
                    isDisabled={isAdding} // Disable Select dropdown while adding new name
                    border="1px solid #ccc"
                    borderRadius="md"
                    padding="8px"
                    fontSize="16px"
                  >
                    {nameList.map((name, index) => (
                      <option key={index} value={name}>
                        {name}
                      </option>
                    ))}
                  </Select>

                  {/* Add Icon Button */}
                  <IconButton
                    icon={<AddIcon />}
                    onClick={() => setIsAdding(true)} // Show input field for new name
                    position="absolute"
                    top="0"
                    right="0"
                    zIndex="1"
                    aria-label="Add New Name"
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="full"
                    size="sm"
                  />
                </Box>

                {/* Input Field for Adding New Name */}
                {isAdding && (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                  >
                    <Input
                      placeholder="Enter New Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      mb={3}
                      border="1px solid #ccc"
                      borderRadius="md"
                      padding="8px"
                      fontSize="16px"
                      width="100%"
                    />
                    <Box
                      display="flex"
                      width="100%"
                      justifyContent="space-between"
                    >
                      <Button
                        onClick={handleAddName}
                        colorScheme="teal"
                        size="sm"
                        width="48%"
                        borderRadius="md"
                      >
                        Add Name
                      </Button>
                      <Button
                        onClick={handleCancel}
                        colorScheme="red"
                        size="sm"
                        width="48%"
                        borderRadius="md"
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Add Icon Button */}
                <IconButton
                  icon={<AddIcon />}
                  onClick={() => setIsAdding(true)} // When clicked, show input for new name
                  position="absolute"
                  top="0"
                  right="0"
                  zIndex="1"
                  aria-label="Add New Name"
                />
              </div>

              {/* Location */}
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

              {/* Prefix */}
              <Input
                placeholder="Prefix"
                value={editingEntry ? editingEntry.prefix : newEntry.prefix}
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        prefix: e.target.value,
                      })
                    : setNewEntry({ ...newEntry, prefix: e.target.value })
                }
              />

              {/* Extension */}
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

              {/* DECT Number */}
              <Input
                placeholder="DECT Number"
                value={
                  editingEntry ? editingEntry.dect_number : newEntry.dect_number
                }
                onChange={(e) =>
                  editingEntry
                    ? setEditingEntry({
                        ...editingEntry,
                        dect_number: e.target.value,
                      })
                    : setNewEntry({ ...newEntry, dect_number: e.target.value })
                }
              />

              {/* Phone Name */}
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

              {/* Active Checkbox */}
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
