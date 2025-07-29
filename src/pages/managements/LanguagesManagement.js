import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const ITEMS_PER_PAGE = 10;

const LanguagesManagement = () => {
  const [languages, setLanguages] = useState([]);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newLanguage, setNewLanguage] = useState({ country_name: "", name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const toast = useToast();
  const cancelRef = useRef();
  const countryInputRef = useRef(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    const filtered = languages.filter((lang) =>
      `${lang.country_name} ${lang.name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLanguages(filtered);
    setCurrentPage(1);
  }, [searchTerm, languages]);

  useEffect(() => {
    if (editingId && countryInputRef.current) {
      countryInputRef.current.focus();
    }
  }, [editingId]);

  const fetchLanguages = () => {
    fetchData(
      "languages",
      (data) => {
        setLanguages(data);
        setFilteredLanguages(data);
      },
      (err) =>
        toast({
          title: "Error loading languages",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch languages"
    );
  };

  const handleAdd = async () => {
    if (!newLanguage.country_name || !newLanguage.name) {
      toast({ title: "All fields are required", status: "warning", duration: 3000 });
      return;
    }

    try {
      await postData("add_languages", newLanguage, "Failed to add language");
      fetchLanguages();
      setNewLanguage({ country_name: "", name: "" });
      setIsAdding(false);
      toast({ title: "Language added", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error adding", description: err.message, status: "error", duration: 3000 });
    }
  };

  const handleEdit = (lang) => {
    setEditingId(lang.id);
    setFormData({ ...lang });
  };

  const handleUpdate = async () => {
    try {
      await putData("languages", editingId, formData, "Failed to update language");
      fetchLanguages();
      setEditingId(null);
      toast({ title: "Language updated", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error updating", description: err.message, status: "error", duration: 3000 });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("languages",deleteId, () => {}, "Failed to delete language");
      fetchLanguages();
      setDeleteId(null);
      toast({ title: "Language deleted", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error deleting", description: err.message, status: "error", duration: 3000 });
    }
  };

  const totalPages = Math.ceil(filteredLanguages.length / ITEMS_PER_PAGE);
  const currentItems = filteredLanguages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">Language List</Text>

        <Input
          placeholder="Search by Country Name or Language"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Country</Th>
              <Th>Language</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  Actions
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      onClick={() => setIsAdding(true)}
                      aria-label="Add language"
                    />
                  )}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isAdding && (
              <Tr>
                <Td>—</Td>
                <Td>
                  <Input
                    placeholder="Country"
                    value={newLanguage.country_name}
                    onChange={(e) =>
                      setNewLanguage({ ...newLanguage, country_name: e.target.value })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Language"
                    value={newLanguage.name}
                    onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  />
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    <Button onClick={handleAdd} colorScheme="green" size="sm" mr={2}>Save</Button>
                    <Button onClick={() => setIsAdding(false)} colorScheme="red" size="sm">Cancel</Button>
                  </Flex>
                </Td>
              </Tr>
            )}
            {currentItems.map((lang, index) => (
              <Tr key={lang.id}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>

                {editingId === lang.id ? (
                  <>
                    <Td>
                      <Input
                        ref={countryInputRef}
                        value={formData.country_name}
                        onChange={(e) =>
                          setFormData({ ...formData, country_name: e.target.value })
                        }
                      />
                    </Td>
                    <Td>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </Td>
                    <Td>
                      <Flex justify="flex-end">
                        <Button onClick={handleUpdate} colorScheme="blue" size="sm" mr={2}>
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          colorScheme="red"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </Flex>
                    </Td>
                  </>
                ) : (
                  <>
                    <Td>{lang.country_name}</Td>
                    <Td>{lang.name}</Td>
                    <Td>
                      <Flex justify="flex-end">
                        <IconButton
                          icon={<EditIcon />}
                          onClick={() => handleEdit(lang)}
                          size="sm"
                          variant="ghost"
                          colorScheme="yellow"
                          aria-label="Edit language"
                          mr={2}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => setDeleteId(lang.id)}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Delete language"
                        />
                      </Flex>
                    </Td>
                  </>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>

        {totalPages > 1 && (
          <Flex justify="center" mt={4}>
            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              isDisabled={currentPage === 1}
              size="sm"
            >
              Previous
            </Button>
            <Text mx={4}>Page {currentPage} of {totalPages}</Text>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              isDisabled={currentPage === totalPages}
              size="sm"
            >
              Next
            </Button>
          </Flex>
        )}
      </Stack>

      {/* Delete Dialog */}
      <AlertDialog
        isOpen={deleteId !== null}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteId(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Language</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this language? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteId(null)}>
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

export default LanguagesManagement;
