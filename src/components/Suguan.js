import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

// Use environment variable
const API_URL = process.env.REACT_APP_API_URL;

const Suguan = () => {
  const [suguan, setSuguan] = useState([]);
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [local, setLocal] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gampanin, setGampanin] = useState("");
  const [status, setStatus] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure(); // Single modal state
  const [editingSuguan, setEditingSuguan] = useState(null); // Track the suguan being edited

  // Fetch suguan data
  useEffect(() => {
    fetch(`${API_URL}/api/suguan`)
      .then((res) => res.json())
      .then((data) => setSuguan(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddOrEditSuguan = (e) => {
    e.preventDefault();
    const newSuguan = { name, district, local, date, time, gampanin };

    if (editingSuguan) {
      // Edit existing suguan
      fetch(`${API_URL}/api/suguan/${editingSuguan.name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSuguan),
      })
        .then(() => {
          setSuguan((prevSuguan) =>
            prevSuguan.map((item) =>
              item.name === editingSuguan.name ? newSuguan : item
            )
          );
          setStatus(`Suguan "${name}" updated successfully.`);
          onClose();
          resetForm();
        })
        .catch(() => setStatus("Error updating suguan. Please try again."));
    } else {
      // Add new suguan
      fetch(`${API_URL}/api/suguan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSuguan),
      })
        .then(() => {
          setSuguan((prevSuguan) => [...prevSuguan, newSuguan]);
          setStatus(`Suguan "${name}" added successfully.`);
          onClose();
          resetForm();
        })
        .catch(() => setStatus("Error adding suguan. Please try again."));
    }
  };

  const handleDeleteSuguan = (name) => {
    fetch(`${API_URL}/api/suguan/${name}`, {
      method: "DELETE",
    })
      .then(() => {
        setSuguan(suguan.filter((item) => item.name !== name));
      })
      .catch((err) => console.error("Error deleting suguan:", err));
  };

  const handleEditSuguan = (item) => {
    setEditingSuguan(item); // Set the suguan to edit
    setName(item.name);
    setDistrict(item.district);
    setLocal(item.local);
    setDate(item.date);
    setTime(item.time);
    setGampanin(item.gampanin);
    onOpen(); // Open modal for editing
  };

  const resetForm = () => {
    setName("");
    setDistrict("");
    setLocal("");
    setDate("");
    setTime("");
    setGampanin("");
    setEditingSuguan(null);
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Suguan</Heading>

      <Button
        leftIcon={<AddIcon />}
        onClick={() => {
          resetForm();
          onOpen();
        }}
        colorScheme="teal"
        mb={4}
      >
        Add Suguan
      </Button>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>District</Th>
            <Th>Local</Th>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Gampanin</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {suguan.map((item, index) => (
            <Tr key={index}>
              <Td>{item.name}</Td>
              <Td>{item.district}</Td>
              <Td>{item.local}</Td>
              <Td>{item.date}</Td>
              <Td>{item.time}</Td>
              <Td>{item.gampanin}</Td>
              <Td>
                <IconButton
                  icon={<EditIcon />}
                  mr={2}
                  colorScheme="blue"
                  onClick={() => handleEditSuguan(item)}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleDeleteSuguan(item.name)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingSuguan ? "Edit Suguan" : "Add Suguan"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>District</FormLabel>
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Enter District"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Local</FormLabel>
                <Input
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  placeholder="Enter Local"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Gampanin</FormLabel>
                <Select
                  value={gampanin}
                  onChange={(e) => setGampanin(e.target.value)}
                  placeholder="Select Gampanin"
                >
                  <option value="Sugo">Sugo</option>
                  <option value="Sugo 1">Sugo 1</option>
                  <option value="Sugo 2">Sugo 2</option>
                  <option value="Reserba">Reserba</option>
                  <option value="Reserba 1">Reserba 1</option>
                  <option value="Reserba 2">Reserba 2</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddOrEditSuguan}>
              {editingSuguan ? "Save Changes" : "Add Suguan"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {status && (
        <Box
          mt={4}
          textAlign="center"
          color={status.includes("successfully") ? "green.500" : "red.500"}
        >
          {status}
        </Box>
      )}
    </Box>
  );
};

export default Suguan;
