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

const NationalityManagement = () => {
  const [nationalities, setNationalities] = useState([]);
  const [filteredNationalities, setFilteredNationalities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newNationality, setNewNationality] = useState({ nationality: "", country_name: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const toast = useToast();
  const cancelRef = useRef();
  const inputRef = useRef(null);

  useEffect(() => {
    fetchNationalities();
  }, []);

  useEffect(() => {
    const filtered = nationalities.filter((item) =>
      item.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNationalities(filtered);
    setCurrentPage(1);
  }, [searchTerm, nationalities]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const fetchNationalities = () => {
    fetchData(
      "nationalities",
      (data) => {
        setNationalities(data);
        setFilteredNationalities(data);
      },
      (err) =>
        toast({
          title: "Error loading nationalities",
          description: err,
          status: "error",
          duration: 3000,
        }),
      "Failed to fetch nationalities"
    );
  };

  const handleAdd = async () => {
    if (!newNationality.nationality.trim()) {
      toast({
        title: "Nationality name is required",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await postData("nationalities", newNationality, "Failed to add nationality");
      fetchNationalities();
      setNewNationality({ nationality: "" });
      setIsAdding(false);
      toast({ title: "Nationality added", status: "success", duration: 3000 });
    } catch (err) {
      toast({
        title: "Error adding",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

const handleEdit = (nat) => {
  setEditingId(nat.id);
  setFormData({
    nationality: nat.nationality,
    country_name: nat.country_name || "",
  });
};

  const handleUpdate = async () => {
    try {
      await putData("nationalities", editingId, formData, "Failed to update nationality");
      fetchNationalities();
      setEditingId(null);
      toast({ title: "Nationality updated", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error updating", description: err.message, status: "error", duration: 3000 });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("nationalities", deleteId, () => {}, "Failed to delete nationality");
      fetchNationalities();
      setDeleteId(null);
      toast({ title: "Nationality deleted", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error deleting", description: err.message, status: "error", duration: 3000 });
    }
  };

  const totalPages = Math.ceil(filteredNationalities.length / ITEMS_PER_PAGE);
  const currentItems = filteredNationalities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">Nationality List</Text>

        <Input
          placeholder="Search Nationality"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
<Table variant="striped" size="sm">
  <Thead>
    <Tr>
      <Th>#</Th>
      <Th>Nationality</Th>
      <Th>Country Name</Th>
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
              aria-label="Add nationality"
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
            placeholder="Nationality"
            value={newNationality.nationality}
            onChange={(e) =>
              setNewNationality({ ...newNationality, nationality: e.target.value })
            }
            autoFocus
          />
        </Td>
        <Td>
          <Input
            placeholder="Country Name"
            value={newNationality.country_name || ""}
            onChange={(e) =>
              setNewNationality({ ...newNationality, country_name: e.target.value })
            }
          />
        </Td>
        <Td>
          <Flex justify="flex-end">
            <Button onClick={handleAdd} colorScheme="green" size="sm" mr={2}>
              Save
            </Button>
            <Button onClick={() => setIsAdding(false)} colorScheme="red" size="sm">
              Cancel
            </Button>
          </Flex>
        </Td>
      </Tr>
    )}

    {currentItems.map((nat, index) => (
      <Tr key={nat.id}>
        <Td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</Td>

        {editingId === nat.id ? (
          <>
            <Td>
              <Input
                ref={inputRef}
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
              />
            </Td>
            <Td>
              <Input
                value={formData.country_name}
                onChange={(e) =>
                  setFormData({ ...formData, country_name: e.target.value })
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
            <Td>{nat.nationality}</Td>
            <Td>{nat.country_name}</Td>
            <Td>
              <Flex justify="flex-end">
                <IconButton
                  icon={<EditIcon />}
                  onClick={() => handleEdit(nat)}
                  size="sm"
                  variant="ghost"
                  colorScheme="yellow"
                  aria-label="Edit nationality"
                  mr={2}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => setDeleteId(nat.id)}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  aria-label="Delete nationality"
                />
              </Flex>
            </Td>
          </>
        )}
      </Tr>
    ))}
  </Tbody>
</Table>


        {/* Pagination */}
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
            <AlertDialogHeader>Delete Nationality</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this nationality? This action cannot be undone.
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

export default NationalityManagement;
