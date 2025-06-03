import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  IconButton,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";

const ITEMS_PER_PAGE = 15;

const LanguagesManagement = () => {
  const [languages, setLanguages] = useState([]);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState({
    country_name: "",
    name: "", // ✅ Match database field name
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingLanguage, setDeletingLanguage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToast();
  const cancelRef = useRef();

  const countryNameInputRef = useRef(null);

  useEffect(() => {
    if (editingLanguage && countryNameInputRef.current) {
      countryNameInputRef.current.focus();
    }
  }, [editingLanguage]);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/languages`
      );
      setLanguages(response.data);
      setFilteredLanguages(response.data);
    } catch (error) {
      toast({
        title: "Error loading languages",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddOrEditLanguage = async () => {
    if (!newLanguage.country_name || !newLanguage.name) {
      toast({
        title: "Fields Required",
        description: "Both Country Name and Language are required.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // Prevent duplicates
    const duplicate = languages.find(
      (lang) =>
        lang.country_name?.toLowerCase() ===
          newLanguage.country_name?.toLowerCase() &&
        lang.name?.toLowerCase() === newLanguage.name?.toLowerCase()
    );

    if (
      duplicate &&
      (!editingLanguage || editingLanguage.id !== duplicate.id)
    ) {
      toast({
        title: "Duplicate Entry",
        description: "This language already exists.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      if (editingLanguage) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/languages/${editingLanguage.id}`,
          newLanguage
        );
        toast({ title: "Language updated", status: "success", duration: 3000 });
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/add_languages`,
          newLanguage
        );
        toast({ title: "Language added", status: "success", duration: 3000 });
      }

      fetchLanguages();
      setNewLanguage({ country_name: "", name: "" }); // ✅ Fix field reference
      setIsAdding(false);
      setEditingLanguage(null);
    } catch (error) {
      toast({
        title: `Error ${editingLanguage ? "updating" : "adding"} language`,
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditLanguage = (language) => {
    setNewLanguage({
      country_name: language.country_name || "", // ✅ Default empty string
      name: language.name || "", // ✅ Ensure it’s always defined
    });
    setEditingLanguage(language);
  };

  const handleDeleteLanguage = async () => {
    if (!deletingLanguage) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/languages/${deletingLanguage.id}`
      );
      fetchLanguages();
      toast({
        title: "Language deleted",
        status: "success",
        duration: 3000,
      });
      setDeletingLanguage(null);
    } catch (error) {
      toast({
        title: "Error deleting language",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    const filtered = languages.filter((lang) =>
      `${lang.country_name} ${lang.name}`
        .toLowerCase()
        .includes(event.target.value.toLowerCase())
    );
    setFilteredLanguages(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLanguages.length / ITEMS_PER_PAGE);
  const currentItems = filteredLanguages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prev) =>
      direction === "next"
        ? Math.min(prev + 1, totalPages)
        : Math.max(prev - 1, 1)
    );
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          Language List
        </Text>

        <Input
          placeholder="Search by Country Name or Language"
          value={searchTerm}
          onChange={handleSearch}
          mb={4}
        />

        {filteredLanguages.length > ITEMS_PER_PAGE && (
          <Flex justify="space-between" align="center" mb={4}>
            <Button
              onClick={() => handlePageChange("previous")}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
        )}

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Country Name</Th>
              <Th>Language</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Actions</span>
                  {!isAdding && !editingLanguage && (
                    <IconButton
                      icon={<AddIcon boxSize={5} />} // ⬅️ Increased size
                      onClick={() => setIsAdding(true)}
                      size="md" // ⬅️ Bigger button
                      aria-label="Add language"
                      variant="solid" // ⬅️ More prominent button
                      colorScheme="green" // ⬅️ Green for visibility
                      _hover={{ bg: "green.500", color: "white" }} // ⬅️ Better hover effect
                      borderRadius="full" // ⬅️ Rounded button
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
                    placeholder="Country Name"
                    value={newLanguage.country_name}
                    onChange={(e) =>
                      setNewLanguage({
                        ...newLanguage,
                        country_name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Input
                    placeholder="Language"
                    value={newLanguage.name} // ✅ Ensure this is correct
                    onChange={
                      (e) =>
                        setNewLanguage({ ...newLanguage, name: e.target.value }) // ✅ Proper state update
                    }
                  />
                </Td>
                <Td>
                  <Flex justify="flex-end">
                    <Button
                      onClick={handleAddOrEditLanguage}
                      colorScheme="green"
                      size="sm"
                      mr={2}
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      colorScheme="red"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            )}
            {currentItems.map((language, index) => (
              // <Tr key={language.id}>
              <Tr key={`${language.id}-${index}`}>
                <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>
                {editingLanguage && editingLanguage.id === language.id ? (
                  <>
                    <Td>
                      <Input
                        ref={countryNameInputRef}
                        value={newLanguage.country_name}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            country_name: e.target.value,
                          })
                        }
                      />
                    </Td>
                    <Td>
                      <Input
                        placeholder="Language"
                        value={newLanguage.name}
                        onChange={(e) =>
                          setNewLanguage({
                            ...newLanguage,
                            name: e.target.value,
                          })
                        }
                      />
                    </Td>
                    <Td>
                      <Flex justify="flex-end">
                        <Button
                          onClick={handleAddOrEditLanguage}
                          colorScheme="green"
                          size="sm"
                          mr={2}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingLanguage(null);
                            setNewLanguage({ country_name: "", name: "" });
                          }}
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
                    <Td>{language.country_name}</Td>
                    <Td>{language.name}</Td>
                    <Td>
                      <Flex justify="flex-center">
                        <IconButton
                          icon={<EditIcon />}
                          onClick={() => handleEditLanguage(language)}
                          size="sm"
                          mr={2}
                          variant="ghost"
                          colorScheme="yellow"
                          aria-label="Edit language"
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => setDeletingLanguage(language)}
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

        {filteredLanguages.length > ITEMS_PER_PAGE && (
          <Flex justify="space-between" align="center" mt={4}>
            <Button
              onClick={() => handlePageChange("previous")}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text>
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
        )}

        <AlertDialog
          isOpen={!!deletingLanguage}
          leastDestructiveRef={cancelRef}
          onClose={() => setDeletingLanguage(null)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Language
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to delete the language:{" "}
                <strong>
                  {deletingLanguage?.country_name} - {deletingLanguage?.name}
                </strong>
                ? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setDeletingLanguage(null)}
                >
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteLanguage} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Stack>
    </Box>
  );
};

export default LanguagesManagement;
