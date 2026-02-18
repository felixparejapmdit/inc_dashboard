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
  HStack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  DownloadIcon,
  PhoneIcon,
  CheckIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import * as XLSX from "xlsx";
import axios from "axios";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
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

  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState("");

  const [isAdding, setIsAdding] = useState(false); // Track whether user is adding a new name
  const [newName, setNewName] = useState(""); // Track the new name input

  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleUpdateName = () => {
    if (!editableName.trim()) {
      toast({
        title: "Name cannot be empty.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const updatedList = nameList.map((name) =>
      name === (editingEntry ? editingEntry.name : newEntry.name)
        ? editableName
        : name
    );
    setNameList(updatedList);

    editingEntry
      ? setEditingEntry({ ...editingEntry, name: editableName })
      : setNewEntry({ ...newEntry, name: editableName });

    setIsEditingName(false);
    toast({
      title: "Name updated.",
      status: "success",
      duration: 3000,
    });
  };

  // Handle name addition
  const handleAddName = () => {
    if (newName.trim()) {
      setNameList((prevNames) => [...prevNames, newName]);
      setNewEntry({ ...newEntry, name: newName }); // Update form entry with the new name
      setNewName(""); // Reset the input field
      setIsAdding(false); // Close input field after adding
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewName("");
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
          await postData("import-phone-directory", { data: newEntries });

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

  // ✅ Fetch names using fetchData
  useEffect(() => {
    fetchData(
      "phone-directory/names",
      (data) => {
        console.log(data); // optional: log data to verify format
        setNameList(data);
      },
      (err) =>
        toast({
          title: "Failed to fetch names",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch names"
    );
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = () => {
    fetchData(
      "phone-directory",
      (data) => {
        setDirectory(data);
        setFiltered(data);
      },
      (err) =>
        toast({
          title: "Error loading data",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch phone directory"
    );
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
    const entry = editingEntry ? { ...editingEntry } : { ...newEntry };

    // Use editableName if editing is active
    if (isEditingName && editableName) {
      entry.name = editableName;
      setIsEditingName(false);
    }

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
        await putData("phone-directory", editingEntry.id, entry);
        toast({ title: "Entry updated", status: "success", duration: 3000 });
      } else {
        await postData(`add_phone-directory`, entry);
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
      await deleteData("phone-directory", deletingEntry.id);
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
    <HStack justifyContent="center" alignItems="center" my={3} spacing={4}>
      <Button onClick={handlePrev} isDisabled={currentPage === 1}>
        Previous
      </Button>
      <Text fontWeight="bold">
        Page {currentPage} of {totalPages || 1}
      </Text>
      <Button
        onClick={handleNext}
        isDisabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </Button>
    </HStack>
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
                  // <Tr key={entry.id}>
                  <Tr key={`${entry.id}-${index}`}>
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
              <Box position="relative" w="100%">
                {!isEditingName ? (
                  <Flex gap={2} alignItems="center">
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
                      border="1px solid #ccc"
                      borderRadius="md"
                      padding="8px"
                      fontSize="16px"
                      flex="1"
                    >
                      {nameList.map((name, index) => (
                        <option key={index} value={name}>
                          {name}
                        </option>
                      ))}
                    </Select>

                    <IconButton
                      icon={<EditIcon />}
                      onClick={() => {
                        const currentName = editingEntry
                          ? editingEntry.name
                          : newEntry.name;
                        setEditableName(currentName || "");
                        setIsEditingName(true);
                      }}
                      aria-label="Edit Name"
                      size="sm"
                      colorScheme="yellow"
                      isDisabled={
                        (editingEntry ? editingEntry.name : newEntry.name) ===
                        ""
                      }
                    />

                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      aria-label="Add New Name"
                      size="sm"
                      colorScheme="blue"
                    />
                  </Flex>
                ) : (
                  <Flex gap={2} alignItems="center" mb={2}>
                    <Input
                      placeholder="Edit Name"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      flex="1"
                    />
                    <IconButton
                      icon={<CheckIcon />}
                      onClick={() => {
                        if (!editableName.trim()) return;

                        // Update name in the nameList
                        setNameList((prev) => {
                          const oldName = editingEntry
                            ? editingEntry.name
                            : newEntry.name;
                          return prev.map((name) =>
                            name === oldName ? editableName : name
                          );
                        });

                        // Update currently selected entry
                        if (editingEntry) {
                          setEditingEntry({
                            ...editingEntry,
                            name: editableName,
                          });
                        } else {
                          setNewEntry({ ...newEntry, name: editableName });
                        }

                        setIsEditingName(false);
                      }}
                      aria-label="Update Name"
                      size="sm"
                      colorScheme="teal"
                    />

                    <IconButton
                      icon={<CloseIcon />}
                      onClick={() => setIsEditingName(false)}
                      aria-label="Cancel Edit"
                      size="sm"
                      colorScheme="red"
                    />
                  </Flex>
                )}

                {/* Add new name section */}
                {isAdding && (
                  <Box mt={2}>
                    <Input
                      placeholder="Enter New Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      mb={2}
                    />
                    <Flex gap={2}>
                      <Button
                        onClick={handleAddName}
                        colorScheme="teal"
                        size="sm"
                        width="100%"
                      >
                        Add Name
                      </Button>
                      <Button
                        onClick={handleCancelAdd}
                        colorScheme="red"
                        size="sm"
                        width="100%"
                      >
                        Cancel
                      </Button>
                    </Flex>
                  </Box>
                )}
              </Box>

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
