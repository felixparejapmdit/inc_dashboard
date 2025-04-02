import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

const API_URL = process.env.REACT_APP_API_URL;

const HousingManagement = () => {
  const [housingList, setHousingList] = useState([]);
  const [form, setForm] = useState({
    building_name: "",
    floor: "",
    room: "",
    description: "",
  });
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchHousing = async () => {
    const res = await fetch(`${API_URL}/api/housing`);
    const data = await res.json();
    setHousingList(data);
  };

  useEffect(() => {
    fetchHousing();
  }, []);

  const handleSubmit = async () => {
    if (!form.building_name || !form.floor || !form.room) {
      setStatus("Building, floor, and room are required.");
      return;
    }

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${API_URL}/api/housing/${editId}`
      : `${API_URL}/api/housing`;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      await fetchHousing();
      onClose();
      setForm({ building_name: "", floor: "", room: "", description: "" });
      setEditId(null);
      setStatus("");
    } catch (error) {
      console.error("Failed to submit housing:", error);
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this housing entry?"))
      return;
    await fetch(`${API_URL}/api/housing/${id}`, { method: "DELETE" });
    await fetchHousing();
  };

  return (
    <Box p={5}>
      <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onOpen}>
        Add Housing
      </Button>

      <Table variant="simple" mt={4}>
        <Thead>
          <Tr>
            <Th>Building</Th>
            <Th>Floor</Th>
            <Th>Room</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {housingList.map((item) => (
            <Tr key={item.id}>
              <Td>{item.building_name}</Td>
              <Td>{item.floor}</Td>
              <Td>{item.room}</Td>
              <Td>{item.description || "—"}</Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  onClick={() => handleEdit(item)}
                  mr={2}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => handleDelete(item.id)}
                  colorScheme="red"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editId ? "Edit Housing" : "Add Housing"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Building Name</FormLabel>
              <Input
                value={form.building_name}
                onChange={(e) =>
                  setForm({ ...form, building_name: e.target.value })
                }
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Floor</FormLabel>
              <Input
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Room</FormLabel>
              <Input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              />
            </FormControl>
            <FormControl mt={3}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </FormControl>
            {status && (
              <Box color="red.500" mt={2}>
                {status}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {editId ? "Update" : "Submit"}
            </Button>
            <Button variant="ghost" onClick={onClose} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default HousingManagement;
