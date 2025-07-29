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
  Text,
  Avatar,
  Select,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

import { fetchData, postData, putData, deleteData } from "../../utils/fetchData";

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [newDesignation, setNewDesignation] = useState({
    name: "",
    section_id: "",
    subsection_id: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();
  const cancelRef = useRef();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  useEffect(() => {
    fetchDesignations();
    fetchSections();
    fetchSubsections();
  }, []);

  const fetchDesignations = () => {
    fetchData(
      "designations",
      setDesignations,
      (errorMsg) =>
        toast({
          title: "Error loading designations",
          description: errorMsg,
          status: "error",
          duration: 3000,
        }),
      "Failed to load designations"
    );
  };

  const fetchSections = () => {
    fetchData(
      "sections",
      setSections,
      (errorMsg) =>
        toast({
          title: "Error loading sections",
          description: errorMsg,
          status: "error",
          duration: 3000,
        }),
      "Failed to load sections"
    );
  };

  const fetchSubsections = () => {
    fetchData(
      "subsections",
      setSubsections,
      (errorMsg) =>
        toast({
          title: "Error loading subsections",
          description: errorMsg,
          status: "error",
          duration: 3000,
        }),
      "Failed to load subsections"
    );
  };

  const handleAddDesignation = async () => {
    try {
      await postData("designations", newDesignation, "Failed to add designation");
      fetchDesignations();
      setNewDesignation({ name: "", section_id: "", subsection_id: "" });
      setIsAdding(false);
      toast({
        title: "Designation added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateDesignation = async () => {
    try {
      await putData(
        "designations",
        editingDesignation.id,
        editingDesignation,
        "Failed to update designation"
      );
      fetchDesignations();
      setEditingDesignation(null);
      toast({
        title: "Designation updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteDesignation = async (id) => {
    try {
      await deleteData("designations", id, "Failed to delete designation");
      fetchDesignations();
      toast({
        title: "Designation deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    onDeleteOpen();
  };

  const handleConfirmDelete = () => {
    handleDeleteDesignation(deletingId);
    setDeletingId(null);
    onDeleteClose();
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          Designation List
        </Text>

       <Table variant="striped">
  <Thead>
    <Tr>
      <Th>Designation Name</Th>
      <Th>Section</Th>
      <Th>Subsection</Th>
      <Th textAlign="center">
        <Flex justify="space-between" align="center">
          <span>Action</span>
          {!isAdding && (
            <IconButton
              icon={<AddIcon />}
              onClick={() => setIsAdding(true)}
              size="sm"
              aria-label="Add designation"
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
            placeholder="Type Designation"
            value={newDesignation.name}
            onChange={(e) =>
              setNewDesignation({ ...newDesignation, name: e.target.value })
            }
            autoFocus
          />
        </Td>
        <Td>
          <Select
            placeholder="Select Section"
            value={newDesignation.section_id}
            onChange={(e) =>
              setNewDesignation({
                ...newDesignation,
                section_id: e.target.value,
              })
            }
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </Select>
        </Td>
        <Td>
          <Select
            placeholder="Select Subsection"
            value={newDesignation.subsection_id}
            onChange={(e) =>
              setNewDesignation({
                ...newDesignation,
                subsection_id: e.target.value,
              })
            }
          >
            {subsections.map((subsection) => (
              <option key={subsection.id} value={subsection.id}>
                {subsection.name}
              </option>
            ))}
          </Select>
        </Td>
        <Td>
          <Flex justify="center" gap={2}>
            <Button
              onClick={handleAddDesignation}
              colorScheme="green"
              size="sm"
            >
              Save
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

    {designations.map((designation) => (
      <Tr key={designation.id}>
        {/* Designation Name */}
        <Td>
          {editingDesignation?.id === designation.id ? (
            <Input
              value={editingDesignation.name}
              onChange={(e) =>
                setEditingDesignation({
                  ...editingDesignation,
                  name: e.target.value,
                })
              }
              autoFocus
            />
          ) : (
            <Flex align="center">
              <Avatar name={designation.name} size="sm" mr={3} />
              <Text>{designation.name}</Text>
            </Flex>
          )}
        </Td>

        {/* Section */}
        <Td>
          {editingDesignation?.id === designation.id ? (
            <Select
              value={editingDesignation.section_id}
              onChange={(e) =>
                setEditingDesignation({
                  ...editingDesignation,
                  section_id: e.target.value,
                })
              }
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </Select>
          ) : (
            sections.find((s) => s.id === designation.section_id)?.name || "N/A"
          )}
        </Td>

        {/* Subsection */}
        <Td>
          {editingDesignation?.id === designation.id ? (
            <Select
              value={editingDesignation.subsection_id}
              onChange={(e) =>
                setEditingDesignation({
                  ...editingDesignation,
                  subsection_id: e.target.value,
                })
              }
            >
              {subsections.map((subsection) => (
                <option key={subsection.id} value={subsection.id}>
                  {subsection.name}
                </option>
              ))}
            </Select>
          ) : (
            subsections.find((s) => s.id === designation.subsection_id)?.name ||
            "N/A"
          )}
        </Td>

        {/* Action */}
        <Td>
          <Flex justify="center" gap={2}>
            {editingDesignation?.id === designation.id ? (
              <>
                <Button
                  onClick={handleUpdateDesignation}
                  colorScheme="green"
                  size="sm"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setEditingDesignation(null)}
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
                  onClick={() => setEditingDesignation(designation)}
                  size="sm"
                  variant="ghost"
                  colorScheme="yellow"
                  aria-label="Edit designation"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => confirmDelete(designation.id)}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  aria-label="Delete designation"
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

      {/* AlertDialog for delete confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Designation
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this designation? This action
              cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DesignationManagement;
