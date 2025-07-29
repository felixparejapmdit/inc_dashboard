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

const ITEMS_PER_PAGE = 10;

const SubsectionManagement = () => {
  const [subsections, setSubsections] = useState([]);
  const [filteredSubsections, setFilteredSubsections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [filteredEditSections, setFilteredEditSections] = useState([]);
  const [newSubsection, setNewSubsection] = useState({
    name: "",
    department_id: "",
    section_id: "",
  });
  const [editingSubsection, setEditingSubsection] = useState(null);
  const [deletingSubsection, setDeletingSubsection] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const toast = useToast();
  const cancelRef = useRef();

  useEffect(() => {
    fetchSubsections();
    fetchDepartments();
    fetchSections();
  }, []);

  const fetchSubsections = () => {
    fetchData(
      "subsections",
      (data) => {
        setSubsections(data);
        setFilteredSubsections(data);
      },
      (err) =>
        toast({
          title: "Error loading subsections",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch subsections"
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

  const fetchSections = () => {
    fetchData(
      "sections",
      (data) => setSections(data),
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = subsections.filter((sub) =>
      sub.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubsections(filtered);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (departmentId) => {
    setNewSubsection({
      ...newSubsection,
      department_id: departmentId,
      section_id: "",
    });
    setFilteredSections(
      sections.filter((s) => s.department_id === parseInt(departmentId))
    );
  };

  const handleEditDepartmentChange = (departmentId) => {
    setEditingSubsection({
      ...editingSubsection,
      department_id: departmentId,
      section_id: "",
    });
    setFilteredEditSections(
      sections.filter((s) => s.department_id === parseInt(departmentId))
    );
  };

  const handleAddSubsection = async () => {
    const { name, department_id, section_id } = newSubsection;
    if (!name || !department_id || !section_id) {
      toast({
        title: "All fields are required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await postData("subsections", newSubsection, "Failed to add subsection");
      fetchSubsections();
      setNewSubsection({ name: "", department_id: "", section_id: "" });
      setFilteredSections([]);
      setIsAdding(false);
      toast({ title: "Subsection added", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error adding subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateSubsection = async () => {
    try {
      await putData(
        "subsections",
        editingSubsection.id,
        editingSubsection,
        "Failed to update subsection"
      );
      fetchSubsections();
      setEditingSubsection(null);
      toast({ title: "Subsection updated", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error updating subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteSubsection = async () => {
    if (!deletingSubsection) return;
    try {
      await deleteData(
        "subsections",
        deletingSubsection.id,
        "Failed to delete subsection"
      );
      fetchSubsections();
      toast({ title: "Subsection deleted", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error deleting subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingSubsection(null);
    }
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredSubsections.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSubsections.length / ITEMS_PER_PAGE);

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Subsection/Team List
          </Text>
          <Input
            placeholder="Search team..."
            maxW="300px"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Flex>

        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>Team</Th>
              <Th>Department</Th>
              <Th>
                <Flex justify="space-between" align="center">
                  Section
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      onClick={() => setIsAdding(true)}
                      size="sm"
                      aria-label="Add"
                      variant="ghost"
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
                    placeholder="Subsection Name"
                    value={newSubsection.name}
                    onChange={(e) =>
                      setNewSubsection({
                        ...newSubsection,
                        name: e.target.value,
                      })
                    }
                  />
                </Td>
                <Td>
                  <Select
                    placeholder="Select Department"
                    value={newSubsection.department_id}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Select>
                </Td>
                <Td>
                  <Flex>
                    <Select
                      placeholder="Select Section"
                      value={newSubsection.section_id}
                      onChange={(e) =>
                        setNewSubsection({
                          ...newSubsection,
                          section_id: e.target.value,
                        })
                      }
                    >
                      {filteredSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={handleAddSubsection}
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

            {currentItems.map((sub) => (
              <Tr key={sub.id}>
                <Td>
                  {editingSubsection?.id === sub.id ? (
                    <Input
                      value={editingSubsection.name}
                      onChange={(e) =>
                        setEditingSubsection({
                          ...editingSubsection,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <Flex align="center">
                      <Avatar name={sub.name} size="sm" mr={2} />
                      {sub.name}
                    </Flex>
                  )}
                </Td>
                <Td>
                  {editingSubsection?.id === sub.id ? (
                    <Select
                      value={editingSubsection.department_id}
                      onChange={(e) =>
                        handleEditDepartmentChange(e.target.value)
                      }
                    >
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    departments.find((d) => d.id === sub.department_id)?.name ||
                    "N/A"
                  )}
                </Td>
                <Td>
                  <Flex justify="space-between" align="center">
                    {editingSubsection?.id === sub.id ? (
                      <Select
                        value={editingSubsection.section_id}
                        onChange={(e) =>
                          setEditingSubsection({
                            ...editingSubsection,
                            section_id: e.target.value,
                          })
                        }
                      >
                        {filteredEditSections.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      sections.find((s) => s.id === sub.section_id)?.name ||
                      "N/A"
                    )}
                    <Flex ml="auto">
                      {editingSubsection?.id === sub.id ? (
                        <>
                          <Button
                            onClick={handleUpdateSubsection}
                            colorScheme="green"
                            size="sm"
                            mr={2}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingSubsection(null)}
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
                            onClick={() => {
                              setEditingSubsection(sub);
                              setFilteredEditSections(
                                sections.filter(
                                  (s) => s.department_id === sub.department_id
                                )
                              );
                            }}
                            size="sm"
                            variant="ghost"
                            colorScheme="yellow"
                            aria-label="Edit"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => setDeletingSubsection(sub)}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            aria-label="Delete"
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

        {/* Pagination */}
        <Flex justify="center" mt={4}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
              colorScheme={currentPage === i + 1 ? "blue" : "gray"}
              mx={1}
            >
              {i + 1}
            </Button>
          ))}
        </Flex>
      </Stack>

      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={!!deletingSubsection}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingSubsection(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Subsection
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the subsection "
              {deletingSubsection?.name}"?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingSubsection(null)}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSubsection} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SubsectionManagement;
