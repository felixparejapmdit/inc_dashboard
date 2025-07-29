import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { fetchData, postData, putData, deleteData } from "../../utils/fetchData";

const HousingManagement = () => {
  const [housingList, setHousingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ building_name: "", floor: "", room: "", description: "" });

  const [editRowId, setEditRowId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const toast = useToast();
  const [deleteId, setDeleteId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  useEffect(() => {
    loadHousing();
  }, []);

  const loadHousing = () => {
    fetchData(
      "housing",
      setHousingList,
      (err) => toast({
        title: "Error loading housing",
        description: err,
        status: "error",
        duration: 3000,
      }),
      "Failed to fetch housing"
    );
  };

  const handleAdd = async () => {
    const { building_name, floor, room } = newItem;
    if (!building_name.trim() || !floor.trim() || !room.trim()) {
      toast({ title: "Building, Floor, and Room are required", status: "warning", duration: 3000 });
      return;
    }

    try {
      await postData("housing", newItem, "Failed to add housing");
      setNewItem({ building_name: "", floor: "", room: "", description: "" });
      setIsAdding(false);
      loadHousing();
      toast({ title: "Housing added", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error adding", description: err.message, status: "error", duration: 3000 });
    }
  };

  const startEdit = (item) => {
    setEditRowId(item.id);
    setEditedData({ ...item });
  };

  const cancelEdit = () => {
    setEditRowId(null);
    setEditedData({});
  };

  const handleUpdate = async (id) => {
    try {
      await putData("housing", id, editedData, "Failed to update housing");
      toast({ title: "Housing updated", status: "success", duration: 3000 });
      setEditRowId(null);
      setEditedData({});
      loadHousing();
    } catch (err) {
      toast({ title: "Update error", description: err.message, status: "error", duration: 3000 });
    }
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    onOpen();
  };

  const confirmDelete = async () => {
    try {
      await deleteData("housing", deleteId, "Failed to delete housing");
      onClose();
      loadHousing();
      toast({ title: "Housing deleted", status: "warning", duration: 3000 });
    } catch (err) {
      toast({ title: "Delete error", description: err.message, status: "error", duration: 3000 });
    }
  };

  const filtered = housingList.filter(h =>
    h.building_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">Housing Management</Text>

        <Input
          placeholder="Search by building name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Table variant="striped" size="md">
          <Thead>
            <Tr>
              <Th>Building</Th>
              <Th>Floor</Th>
              <Th>Room</Th>
              <Th>Description</Th>
              <Th textAlign="right">
                <Flex justify="space-between" align="center">
                  Actions
                  {!isAdding && (
                    <IconButton
                      icon={<AddIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="green"
                      onClick={() => setIsAdding(true)}
                      aria-label="Add"
                    />
                  )}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {isAdding && (
              <Tr>
                <Td><Input value={newItem.building_name} onChange={(e) => setNewItem({ ...newItem, building_name: e.target.value })} /></Td>
                <Td><Input value={newItem.floor} onChange={(e) => setNewItem({ ...newItem, floor: e.target.value })} /></Td>
                <Td><Input value={newItem.room} onChange={(e) => setNewItem({ ...newItem, room: e.target.value })} /></Td>
                <Td><Input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} /></Td>
                <Td>
                  <HStack justify="flex-end">
                    <Button size="sm" colorScheme="green" onClick={handleAdd}>Save</Button>
                    <Button size="sm" colorScheme="red" onClick={() => setIsAdding(false)}>Cancel</Button>
                  </HStack>
                </Td>
              </Tr>
            )}

            {paginated.map((item) => (
              <Tr key={item.id}>
                <Td>
                  {editRowId === item.id ? (
                    <Input value={editedData.building_name} onChange={(e) => setEditedData({ ...editedData, building_name: e.target.value })} />
                  ) : (
                    item.building_name
                  )}
                </Td>
                <Td>
                  {editRowId === item.id ? (
                    <Input value={editedData.floor} onChange={(e) => setEditedData({ ...editedData, floor: e.target.value })} />
                  ) : (
                    item.floor
                  )}
                </Td>
                <Td>
                  {editRowId === item.id ? (
                    <Input value={editedData.room} onChange={(e) => setEditedData({ ...editedData, room: e.target.value })} />
                  ) : (
                    item.room
                  )}
                </Td>
                <Td>
                  {editRowId === item.id ? (
                    <Input value={editedData.description} onChange={(e) => setEditedData({ ...editedData, description: e.target.value })} />
                  ) : (
                    item.description || "—"
                  )}
                </Td>
                <Td>
                  <HStack justify="flex-end">
                    {editRowId === item.id ? (
                      <>
                        <IconButton icon={<CheckIcon />} size="sm" colorScheme="green" onClick={() => handleUpdate(item.id)} aria-label="Save" />
                        <IconButton icon={<CloseIcon />} size="sm" colorScheme="red" onClick={cancelEdit} aria-label="Cancel" />
                      </>
                    ) : (
                      <>
                        <IconButton icon={<EditIcon />} size="sm" colorScheme="yellow" onClick={() => startEdit(item)} aria-label="Edit" />
                        <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => openDeleteDialog(item.id)} aria-label="Delete" />
                      </>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {totalPages > 1 && (
          <HStack justify="center" mt={4}>
            <Button size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>Previous</Button>
            <Text>Page {currentPage} of {totalPages}</Text>
            <Button size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} isDisabled={currentPage === totalPages}>Next</Button>
          </HStack>
        )}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Housing</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this entry? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default HousingManagement;
