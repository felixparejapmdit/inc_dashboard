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
  Avatar,
  Flex,
  Select,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState([]);
  const [newSection, setNewSection] = useState({ name: "", department_id: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSections = () => {
    fetchData(
      "sections",
      (data) => {
        setSections(data);
        setFilteredSections(data);
      },
      (err) =>
        toast({
          title: "Error loading sections",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch sections"
    );
  };

  const fetchDepartments = () => {
    fetchData(
      "departments",
      (data) => setDepartments(data),
      (err) =>
        toast({
          title: "Error loading departments",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch departments"
    );
  };

  useEffect(() => {
    fetchSections();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSections(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, sections]);

  const handleAddSection = async () => {
    if (!newSection.name || !newSection.department_id) {
      toast({
        title: "Name and Department are required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await postData("sections", newSection);
      fetchSections();
      setNewSection({ name: "", department_id: "" });
      setIsAdding(false);
      toast({ title: "Section added", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error adding section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateSection = async () => {
    try {
      await putData("sections", editingSection.id, editingSection);
      fetchSections();
      setEditingSection(null);
      toast({
        title: "Section updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    try {
      await deleteData("sections", deletingSection.id);
      fetchSections();
      toast({
        title: "Section deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingSection(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
  const paginatedSections = filteredSections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="28px" fontWeight="bold">
            Section List
          </Text>
          <Input
            placeholder="Search Sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            width="250px"
          />
        </Flex>

        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  <span>Department</span>
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add section"
                      variant="ghost"
                      _hover={{ bg: "gray.100" }}
                    />
                  )}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isAdding && (
              <Tr>
                <Td>
                  <Input
                    placeholder="Section Name"
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                    autoFocus
                  />
                </Td>
                <Td>
                  <Flex align="center">
                    <Select
                      placeholder="Select Department"
                      value={newSection.department_id}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          department_id: e.target.value,
                        })
                      }
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={handleAddSection}
                      colorScheme="green"
                      size="sm"
                      ml={2}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => setIsAdding(false)}
                      colorScheme="red"
                      size="sm"
                      ml={2}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            )}

            {paginatedSections.map((section) => (
              <Tr key={section.id}>
                <Td>
                  <Flex align="center">
                    <Avatar name={section.name} size="sm" mr={3} />
                    {editingSection?.id === section.id ? (
                      <Input
                        value={editingSection.name}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            name: e.target.value,
                          })
                        }
                        autoFocus
                        mr={2}
                      />
                    ) : (
                      <Text>{section.name}</Text>
                    )}
                  </Flex>
                </Td>
                <Td>
                  <Flex align="center" justify="space-between">
                    {editingSection?.id === section.id ? (
                      <Select
                        value={editingSection.department_id}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            department_id: e.target.value,
                          })
                        }
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      departments.find((d) => d.id === section.department_id)
                        ?.name || "N/A"
                    )}
                    <Flex ml="auto">
                      {editingSection?.id === section.id ? (
                        <>
                          <Button
                            onClick={handleUpdateSection}
                            colorScheme="green"
                            size="sm"
                            mr={2}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingSection(null)}
                            colorScheme="red"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            icon={<EditIcon />}
                            onClick={() => setEditingSection(section)}
                            size="sm"
                            ml={2}
                            variant="ghost"
                            colorScheme="yellow"
                            aria-label="Edit section"
                            _hover={{ bg: "yellow.100" }}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => setDeletingSection(section)}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete section"
                            _hover={{ bg: "red.100" }}
                          />
                        </>
                      )}
                    </Flex>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Flex justify="center" align="center" mt={4}>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
              size="sm"
              mr={2}
            >
              Previous
            </Button>

            <Text mx={2} fontSize="sm">
              Page {currentPage} of {totalPages}
            </Text>

            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              isDisabled={currentPage === totalPages}
              size="sm"
              ml={2}
            >
              Next
            </Button>
          </Flex>
        )}
      </Stack>

      {/* Delete Dialog */}
      <AlertDialog
        isOpen={!!deletingSection}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingSection(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Section
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the section "
              {deletingSection?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingSection(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSection} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SectionManagement;
