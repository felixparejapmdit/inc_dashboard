import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { FiEdit, FiTrash2, FiUser } from "react-icons/fi";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";
import moment from "moment";

const API_URL = process.env.REACT_APP_API_URL;

const Suguan = () => {
  const [suguan, setSuguan] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("isoWeek")); // Monday as start of the week
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [local, setLocal] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gampanin, setGampanin] = useState("");
  const [status, setStatus] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSuguan, setEditingSuguan] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/suguan`)
      .then((res) => res.json())
      .then((data) => {
        const sortedSuguan = data.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA - dateB;
        });
        setSuguan(sortedSuguan);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAddOrEditSuguan = (e) => {
    e.preventDefault();
    const newSuguan = {
      id: editingSuguan ? editingSuguan.id : new Date().getTime(),
      name,
      district,
      local,
      date,
      time,
      gampanin,
    };

    if (editingSuguan) {
      fetch(`${API_URL}/api/suguan/${editingSuguan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSuguan),
      })
        .then(() => {
          setSuguan((prevSuguan) =>
            prevSuguan.map((item) =>
              item.id === editingSuguan.id ? newSuguan : item
            )
          );
          setStatus(`Suguan "${name}" updated successfully.`);
          onClose();
          resetForm();
        })
        .catch(() => setStatus("Error updating suguan. Please try again."));
    } else {
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

  const handleDeleteSuguan = (id) => {
    fetch(`${API_URL}/api/suguan/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setSuguan(suguan.filter((item) => item.id !== id));
      })
      .catch((err) => console.error("Error deleting suguan:", err));
  };

  const handleEditSuguan = (item) => {
    setEditingSuguan(item);
    setName(item.name);
    setDistrict(item.district);
    setLocal(item.local);
    setDate(item.date);
    setTime(item.time);
    setGampanin(item.gampanin);
    onOpen();
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

  // Get the start and end of the current week (Monday 12:00 AM to Sunday 11:59 PM)
  const startOfWeek = currentWeek.clone().startOf("isoWeek");
  const endOfWeek = currentWeek.clone().endOf("isoWeek").endOf("day");

  // Handle next and previous week
  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => prev.clone().subtract(1, "week"));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => prev.clone().add(1, "week"));
  };

  // Filter Suguan for Midweek and Weekend categories
  const midweekSuguan = suguan.filter((item) => {
    const suguanDate = moment(item.date);
    return (
      suguanDate.isBetween(startOfWeek, endOfWeek, null, "[]") &&
      suguanDate.day() >= 1 &&
      suguanDate.day() <= 4
    ); // Monday to Thursday
  });

  const weekendSuguan = suguan.filter((item) => {
    const suguanDate = moment(item.date);
    return (
      suguanDate.isBetween(startOfWeek, endOfWeek, null, "[]") &&
      (suguanDate.day() === 0 || suguanDate.day() >= 5)
    ); // Friday to Sunday
  });

  const colors = {
    suguanBg: useColorModeValue("gray.100", "gray.700"),
    cardText: useColorModeValue("gray.700", "white"),
    cardHeader: useColorModeValue("black.600", "black.300"),
    cardBorder: useColorModeValue("gray.300", "gray.700"),
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Manage Suguan</Heading>

      <HStack justify="center" mb={4}>
        <Button
          onClick={handlePreviousWeek}
          colorScheme="blue"
          leftIcon={<ArrowLeftIcon />}
        >
          Previous
        </Button>
        <Heading size="md">
          Week {currentWeek.isoWeek()} ({startOfWeek.format("MMM DD")} -{" "}
          {endOfWeek.format("MMM DD")})
        </Heading>
        <Button
          onClick={handleNextWeek}
          colorScheme="blue"
          rightIcon={<ArrowRightIcon />}
        >
          Next
        </Button>
      </HStack>

      <Button
        leftIcon={<FiUser />}
        onClick={() => {
          resetForm();
          onOpen();
        }}
        colorScheme="teal"
        mb={4}
        _hover={{ transform: "scale(1.05)", transition: "0.3s ease-in-out" }}
      >
        Add Suguan
      </Button>

      {midweekSuguan.length === 0 && weekendSuguan.length === 0 ? (
        <Text textAlign="center" color="red.500" mt={4}>
          No suguan schedule for this week...
        </Text>
      ) : (
        <SimpleGrid columns={2} spacing={6}>
          <VStack align="stretch">
            <Heading align="center" as="h3" size="lg" mb={4}>
              Midweek
            </Heading>
            {midweekSuguan.length === 0 ? (
              <Text>No Midweek Suguan</Text>
            ) : (
              midweekSuguan.map((item) => (
                <Box
                  key={item.id}
                  bg={colors.suguanBg}
                  p={6}
                  borderRadius="lg"
                  border={`1px solid ${colors.cardBorder}`}
                  _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
                  transition="all 0.3s ease-in-out"
                >
                  <Text fontWeight="bold" color={colors.cardHeader}>
                    {item.name}
                  </Text>
                  <Text>
                    {item.district} - {item.local}
                  </Text>
                  <Text>
                    Time: {moment(item.time, "HH:mm").format("h:mm A")},{" "}
                    {moment(item.date).format("dddd")}
                  </Text>
                  <Text>Gampanin: {item.gampanin}</Text>
                  <Box mt={3}>
                    <IconButton
                      icon={<FiEdit />}
                      colorScheme="gray"
                      onClick={() => handleEditSuguan(item)}
                      mr={2}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      colorScheme="gray"
                      onClick={() => handleDeleteSuguan(item.id)}
                    />
                  </Box>
                </Box>
              ))
            )}
          </VStack>

          <VStack align="stretch">
            <Heading align="center" as="h3" size="lg" mb={4}>
              Weekend
            </Heading>
            {weekendSuguan.length === 0 ? (
              <Text>No Weekend Suguan</Text>
            ) : (
              weekendSuguan.map((item) => (
                <Box
                  key={item.id}
                  bg={colors.suguanBg}
                  p={6}
                  borderRadius="lg"
                  border={`1px solid ${colors.cardBorder}`}
                  _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
                  transition="all 0.3s ease-in-out"
                >
                  <Text fontWeight="bold" color={colors.cardHeader}>
                    {item.name}
                  </Text>
                  <Text>
                    {item.district} - {item.local}
                  </Text>
                  <Text>
                    Time: {moment(item.time, "HH:mm").format("h:mm A")},{" "}
                    {moment(item.date).format("dddd")}
                  </Text>
                  <Text>Gampanin: {item.gampanin}</Text>
                  <Box mt={3}>
                    <IconButton
                      icon={<FiEdit />}
                      colorScheme="gray"
                      onClick={() => handleEditSuguan(item)}
                      mr={2}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      colorScheme="gray"
                      onClick={() => handleDeleteSuguan(item.id)}
                    />
                  </Box>
                </Box>
              ))
            )}
          </VStack>
        </SimpleGrid>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingSuguan ? "Edit Suguan" : "Add Suguan"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
              />
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Enter District"
              />
              <Input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Enter Local"
              />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
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
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddOrEditSuguan}>
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
