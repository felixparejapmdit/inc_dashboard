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
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { FiEdit, FiTrash2, FiUser } from "react-icons/fi";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";
import moment from "moment";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;

const Suguan = () => {
  const [suguan, setSuguan] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("isoWeek")); // Monday as start of the week
  const [name, setName] = useState("");
  const [district_id, setDistrictId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [local_id, setLocalId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gampanin_id, setGampaninId] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSuguan, setEditingSuguan] = useState(null);
  const [status, setStatus] = useState("");

  const gampanin = [
    { value: "1", name: "Sugo" },
    { value: "2", name: "Sugo 1" },
    { value: "3", name: "Sugo 2" },
    { value: "4", name: "Reserba" },
    { value: "5", name: "Reserba 1" },
    { value: "6", name: "Reserba 2" },
  ];

  useEffect(() => {
    // Fetch districts for the dropdown
    const fetchDistricts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/districts`);
        if (!response.ok) {
          throw new Error(`Failed to fetch districts: ${response.status}`);
        }
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };

    fetchDistricts();
    fetchSuguan();
  }, [API_URL]);

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

        setSuguan(sortedSuguan); // Update the Suguan state with the sorted data
      } else {
        console.error("Unexpected API response:", data);
      }
    } catch (error) {
      console.error("Error fetching Suguan:", error);
    }
  };

  // Add or Edit Suguan
  const handleAddOrEditSuguan = async (e) => {
    e.preventDefault();

    // Validate input
    if (!name || !district_id || !local_id || !date || !time || !gampanin_id) {
      setStatus("All fields are required.");
      return;
    }
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

      // Log response for debugging
      console.log("API Response:", response);

      if (!response.ok) {
        const errorDetails = await response.text(); // Log the response body
        console.error(`Error Details: ${errorDetails}`);
        throw new Error(
          `Failed to ${editingSuguan ? "update" : "add"} Suguan. Status: ${
            response.status
          }`
        );
      }

      const result = await response.json();

      // Fetch the updated list of Suguan entries
      await fetchSuguan();

      console.log("API Result:", result);

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
      setStatus(
        error.message || "Error processing the request. Please try again."
      );
    }
  };

  // Delete Suguan
  const handleDeleteSuguan = async (id) => {
    if (window.confirm("Are you sure you want to delete this Suguan?")) {
      try {
        const response = await fetch(`${API_URL}/api/suguan/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to delete Suguan. Status: ${response.status}`
          );
        }

        // Remove the deleted Suguan from state
        setSuguan((prev) => prev.filter((item) => item.id !== id));
        setStatus("Suguan deleted successfully.");
      } catch (error) {
        console.error("Error deleting Suguan:", error);
        setStatus("Failed to delete Suguan. Please try again.");
      }
    }
  };

  // Edit Suguan
  const handleEditSuguan = (item) => {
    setEditingSuguan(item); // Set the Suguan being edited
    setName(item.name);
    setDistrictId(item.district_id);
    setLocalId(item.local_congregation); // Correctly map the local congregation
    setDate(moment(item.date).format("YYYY-MM-DD")); // Format the date properly
    setTime(moment(item.time, "HH:mm:ss").format("HH:mm")); // Format the time properly
    setGampaninId(item.gampanin_id.toString()); // Ensure gampanin_id matches the dropdown value
    onOpen(); // Open the modal
  };

  // Reset Form
  const resetForm = () => {
    setName("");
    setDistrictId("");
    setLocalId("");
    setDate("");
    setTime("");
    setGampaninId("");
    setEditingSuguan(null);
    setStatus(""); // Clear any status messages
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

  // Filter Suguan for Midweek (Monday to Thursday)
  const midweekSuguan = suguan.filter((item) => {
    const suguanDate = moment(item.date, "YYYY-MM-DD");
    return (
      suguanDate.isBetween(startOfWeek, endOfWeek, null, "[]") &&
      suguanDate.isoWeekday() >= 1 && // Monday
      suguanDate.isoWeekday() <= 4 // Thursday
    );
  });

  // Filter Suguan for Weekend (Friday to Sunday)
  const weekendSuguan = suguan.filter((item) => {
    const suguanDate = moment(item.date, "YYYY-MM-DD");
    return (
      suguanDate.isBetween(startOfWeek, endOfWeek, null, "[]") &&
      (suguanDate.isoWeekday() === 5 || // Friday
        suguanDate.isoWeekday() === 6 || // Saturday
        suguanDate.isoWeekday() === 7) // Sunday
    );
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
        <Text textAlign="center" color="red.500" mt={4} fontSize="lg">
          No Suguan schedule for this week.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Midweek Suguan */}
          <VStack align="stretch">
            <Heading align="center" as="h3" size="lg" mb={4} color="teal.600">
              Midweek
            </Heading>
            {midweekSuguan.length === 0 ? (
              <Text textAlign="center" fontSize="md" color="gray.500">
                No Midweek Suguan
              </Text>
            ) : (
              midweekSuguan.map((item) => (
                <Box
                  key={item.id}
                  bg="white"
                  p={6}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow="md"
                  _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
                  transition="all 0.3s ease-in-out"
                >
                  <Text fontWeight="bold" fontSize="lg" color="teal.700">
                    {item.name}
                  </Text>
                  <VStack align="start" spacing={2} mt={3}>
                    <Text>
                      <strong>District:</strong>{" "}
                      {districts.find(
                        (district) => district.id === item.district_id
                      )?.name || "N/A"}
                    </Text>
                    <Text>
                      <strong>Local Congregation:</strong>{" "}
                      {item.local_congregation}
                    </Text>
                    <Text>
                      <strong>Date:</strong>{" "}
                      {moment(item.date).format("MMM DD, YYYY")}
                    </Text>
                    <Text>
                      <strong>Time:</strong>{" "}
                      {moment(item.time, "HH:mm").format("h:mm A")}
                    </Text>
                    <Text>
                      <strong>Gampanin:</strong>{" "}
                      {gampanin.find(
                        (g) => parseInt(g.value) === parseInt(item.gampanin_id)
                      )?.name || "N/A"}
                    </Text>
                  </VStack>
                  <HStack mt={4} justifyContent="flex-end">
                    <IconButton
                      icon={<FiEdit />}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSuguan(item)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSuguan(item.id)}
                    />
                  </HStack>
                </Box>
              ))
            )}
          </VStack>

          {/* Weekend Suguan */}
          <VStack align="stretch">
            <Heading align="center" as="h3" size="lg" mb={4} color="teal.600">
              Weekend
            </Heading>
            {weekendSuguan.length === 0 ? (
              <Text textAlign="center" fontSize="md" color="gray.500">
                No Weekend Suguan
              </Text>
            ) : (
              weekendSuguan.map((item) => (
                <Box
                  key={item.id}
                  bg="white"
                  p={6}
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                  boxShadow="md"
                  _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
                  transition="all 0.3s ease-in-out"
                >
                  <Text fontWeight="bold" fontSize="lg" color="teal.700">
                    {item.name}
                  </Text>
                  <VStack align="start" spacing={2} mt={3}>
                    <Text>
                      <strong>District:</strong>{" "}
                      {districts.find(
                        (district) => district.id === item.district_id
                      )?.name || "N/A"}
                    </Text>
                    <Text>
                      <strong>Local Congregation:</strong>{" "}
                      {item.local_congregation}
                    </Text>
                    <Text>
                      <strong>Date:</strong>{" "}
                      {moment(item.date).format("MMM DD, YYYY")}
                    </Text>
                    <Text>
                      <strong>Time:</strong>{" "}
                      {moment(item.time, "HH:mm").format("h:mm A")}
                    </Text>
                    <Text>
                      <strong>Gampanin:</strong>{" "}
                      {gampanin.find(
                        (g) => parseInt(g.value) === parseInt(item.gampanin_id)
                      )?.name || "N/A"}
                    </Text>
                  </VStack>
                  <HStack mt={4} justifyContent="flex-end">
                    <IconButton
                      icon={<FiEdit />}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSuguan(item)}
                    />
                    <IconButton
                      icon={<FiTrash2 />}
                      colorScheme="red"
                      variant="outline"
                      size="sm"
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
              {/* Name Input */}
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                />
              </FormControl>

              {/* District Dropdown */}
              <FormControl isRequired>
                <FormLabel>District</FormLabel>
                <Select
                  placeholder="Select District"
                  value={district_id}
                  onChange={(e) => setDistrictId(e.target.value)}
                >
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Local Congregation Input */}
              <FormControl isRequired>
                <FormLabel>Local Congregation</FormLabel>
                <Input
                  value={local_id}
                  onChange={(e) => setLocalId(e.target.value)}
                  placeholder="Enter Local Congregation"
                />
              </FormControl>

              {/* Date Picker */}
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </FormControl>

              {/* Time Picker */}
              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </FormControl>

              {/* Gampanin Dropdown */}
              <FormControl isRequired>
                <FormLabel>Gampanin</FormLabel>
                <Select
                  value={gampanin_id}
                  onChange={(e) => setGampaninId(e.target.value)}
                  placeholder="Select Gampanin"
                >
                  {gampanin.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
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
