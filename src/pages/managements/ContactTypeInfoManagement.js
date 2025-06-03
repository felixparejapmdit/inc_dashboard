import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  IconButton,
  VStack,
  HStack,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import axios from "axios";

const ContactTypeInfoManagement = () => {
  const [contactTypes, setContactTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newContactType, setNewContactType] = useState({ name: "" });
  const [editingContactType, setEditingContactType] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deletingContactType, setDeletingContactType] = useState(null);

  const toast = useToast();
  const cancelRef = React.useRef();

  useEffect(() => {
    fetchContactTypes();
  }, []);

  const fetchContactTypes = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/contact-type-info`
      );
      setContactTypes(response.data);
    } catch (error) {
      toast({
        title: "Error fetching contact types.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddContactType = async () => {
    if (!newContactType.name) {
      toast({
        title: "Field Required",
        description: "Please provide a contact type name.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/contact-type-info`,
        newContactType
      );
      setContactTypes((prev) => [...prev, response.data]);
      toast({
        title: "Contact type added successfully.",
        status: "success",
        duration: 3000,
      });
      setNewContactType({ name: "" });
      setIsAddingNew(false);
    } catch (error) {
      toast({
        title: "Error adding contact type.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditContactType = async () => {
    if (!editingContactType.name) {
      toast({
        title: "Field Required",
        description: "Please provide a contact type name.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/contact-type-info/${editingContactType.id}`,
        { name: editingContactType.name }
      );
      setContactTypes((prev) =>
        prev.map((type) =>
          type.id === editingContactType.id ? editingContactType : type
        )
      );
      toast({
        title: "Contact type updated successfully.",
        status: "success",
        duration: 3000,
      });
      setEditingContactType(null);
    } catch (error) {
      toast({
        title: "Error updating contact type.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteContactType = async () => {
    if (!deletingContactType) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/contact-type-info/${deletingContactType.id}`
      );
      setContactTypes((prev) =>
        prev.filter((type) => type.id !== deletingContactType.id)
      );
      toast({
        title: "Contact type deleted successfully.",
        status: "success",
        duration: 3000,
      });
      setDeletingContactType(null);
    } catch (error) {
      toast({
        title: "Error deleting contact type.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const filteredContactTypes = contactTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box p={6}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Input
          placeholder="Search by Contact Type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          mb={4}
        />
      </Flex>

      <Table variant="simple" size="lg">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Contact Type</Th>
            <Th>
              <Flex justify="space-between" align="center">
                <span>Actions</span>
                {!isAddingNew && !editingContactType && (
                  <IconButton
                    icon={<AddIcon />}
                    onClick={() => setIsAddingNew(true)}
                    size="sm"
                    aria-label="Add language"
                    variant="ghost"
                    _hover={{ bg: "gray.100" }}
                  />
                )}
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {isAddingNew && (
            <Tr>
              <Td>—</Td>
              <Td>
                <Input
                  placeholder="Contact Type Name"
                  value={newContactType.name}
                  onChange={(e) =>
                    setNewContactType({
                      ...newContactType,
                      name: e.target.value,
                    })
                  }
                />
              </Td>
              <Td>
                <HStack>
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={handleAddContactType}
                  >
                    Add
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => setIsAddingNew(false)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </Td>
            </Tr>
          )}
          {filteredContactTypes.map((type, index) => (
            // <Tr key={type.id}>
            <Tr key={`${type.id}-${index}`}>
              <Td>{index + 1}</Td>
              <Td>
                {editingContactType?.id === type.id ? (
                  <Input
                    value={editingContactType.name}
                    onChange={(e) =>
                      setEditingContactType({
                        ...editingContactType,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  type.name
                )}
              </Td>
              <Td>
                <HStack>
                  {editingContactType?.id === type.id ? (
                    <>
                      <IconButton
                        icon={<CheckIcon />}
                        colorScheme="green"
                        size="sm"
                        onClick={handleEditContactType}
                      />
                      <IconButton
                        icon={<CloseIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => setEditingContactType(null)}
                      />
                    </>
                  ) : (
                    <>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="yellow"
                        size="sm"
                        onClick={() => setEditingContactType(type)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => setDeletingContactType(type)}
                      />
                    </>
                  )}
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingContactType}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingContactType(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Contact Type
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="bold">
                {deletingContactType?.name}
              </Text>
              ? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setDeletingContactType(null)}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteContactType}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ContactTypeInfoManagement;
