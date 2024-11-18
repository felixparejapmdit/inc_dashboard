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
  const [district_id, setDistrictId] = useState("");
  const [local_id, setLocalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gampanin_id, setGampaninId] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSuguan, setEditingSuguan] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchSuguan = async () => {
      try {
        const response = await fetch(`${API_URL}/api/suguan`);
        if (!response.ok) {
          throw new Error(`Failed to fetch Suguan. Status: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          const sortedSuguan = data.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
          });
          setSuguan(sortedSuguan);
        } else {
          console.error("Unexpected API response:", data);
        }
      } catch (error) {
        console.error("Error fetching Suguan:", error);
      }
    };

    fetchSuguan();
  }, [API_URL]);

  const handleAddOrEditSuguan = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        editingSuguan
          ? `${API_URL}/api/suguan/${editingSuguan.id}`
          : `${API_URL}/api/suguan`,
        {
          method: editingSuguan ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            district_id,
            local_id,
            date,
            time,
            gampanin_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingSuguan ? "update" : "add"} Suguan. Status: ${
            response.status
          }`
        );
      }

      const result = await response.json();
      if (editingSuguan) {
        setSuguan((prev) =>
          prev.map((item) =>
            item.id === editingSuguan.id ? { ...item, ...result } : item
          )
        );
        setStatus(`Suguan "${name}" updated successfully.`);
      } else {
        setSuguan((prev) => [...prev, result]);
        setStatus(`Suguan "${name}" added successfully.`);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error in handleAddOrEditSuguan:", error);
      setStatus("Error processing the request. Please try again.");
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
    setDistrictId(item.district);
    setLocalId(item.local);
    setDate(item.date);
    setTime(item.time);
    setGampaninId(item.gampanin);
    onOpen();
  };

  const resetForm = () => {
    setName("");
    setDistrictId("");
    setLocalId("");
    setDate("");
    setTime("");
    setGampaninId("");
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

      {/* Week navigation */}
      <HStack justify="center" mb={4}>
        <Button
          onClick={handlePreviousWeek}
          colorScheme="blue"
          leftIcon={<ArrowLeftIcon />}
        ></Button>
        <Heading size="md">
          Week {currentWeek.isoWeek()} ({startOfWeek.format("MMM DD")} -{" "}
          {endOfWeek.format("MMM DD")})
        </Heading>
        <Button
          onClick={handleNextWeek}
          colorScheme="blue"
          rightIcon={<ArrowRightIcon />}
        ></Button>
      </HStack>

      {/* Add Suguan button */}
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

      {/* Display Suguan schedule */}
      {midweekSuguan.length === 0 && weekendSuguan.length === 0 ? (
        <Text textAlign="center" color="red.500" mt={4}>
          No Suguan schedule for this week.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Midweek Suguan */}
          <VStack align="stretch">
            <Heading align="center" as="h3" size="lg" mb={4}>
              Midweek
            </Heading>
            {midweekSuguan.length === 0 ? (
              <Text textAlign="center">No Midweek Suguan</Text>
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
                    District: {item.district_id}, Local: {item.local_id}
                  </Text>
                  <Text>
                    Date: {moment(item.date).format("MMM DD, YYYY")}, Time:{" "}
                    {moment(item.time, "HH:mm").format("h:mm A")}
                  </Text>
                  <Text>Gampanin ID: {item.gampanin_id}</Text>
                  <HStack mt={3}>
                    <IconButton
                      icon={<FiEdit />}
                      colorScheme="gray"
                      onClick={() => handleEditSuguan(item)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      colorScheme="gray"
                      onClick={() => handleDeleteSuguan(item.id)}
                    />
                  </HStack>
                </Box>
              ))
            )}
          </VStack>

          {/* Weekend Suguan */}
          <VStack align="stretch">
            <Heading align="center" as="h3" size="lg" mb={4}>
              Weekend
            </Heading>
            {weekendSuguan.length === 0 ? (
              <Text textAlign="center">No Weekend Suguan</Text>
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
                    District: {item.district_id}, Local: {item.local_id}
                  </Text>
                  <Text>
                    Date: {moment(item.date).format("MMM DD, YYYY")}, Time:{" "}
                    {moment(item.time, "HH:mm").format("h:mm A")}
                  </Text>
                  <Text>Gampanin ID: {item.gampanin_id}</Text>
                  <HStack mt={3}>
                    <IconButton
                      icon={<FiEdit />}
                      colorScheme="gray"
                      onClick={() => handleEditSuguan(item)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      colorScheme="gray"
                      onClick={() => handleDeleteSuguan(item.id)}
                    />
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </SimpleGrid>
      )}

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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                isRequired
              />
              <Input
                value={district_id}
                onChange={(e) => setDistrictId(e.target.value)}
                placeholder="Enter District ID"
                isRequired
              />
              <Input
                value={local_id}
                onChange={(e) => setLocalId(e.target.value)}
                placeholder="Enter Local ID"
                isRequired
              />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                isRequired
              />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                isRequired
              />
              <Select
                value={gampanin_id}
                onChange={(e) => setGampaninId(e.target.value)}
                placeholder="Select Gampanin"
                isRequired
              >
                <option value="1">Sugo</option>
                <option value="2">Sugo 1</option>
                <option value="3">Sugo 2</option>
                <option value="4">Reserba</option>
                <option value="5">Reserba 1</option>
                <option value="6">Reserba 2</option>
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

      {/* Status message */}
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
