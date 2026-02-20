import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Button,
  IconButton,
  HStack,
  useToast,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  Badge,
  Flex,
  Divider,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Activity,
  AlertCircle,
  Download
} from "lucide-react";
import Papa from "papaparse";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const PhoneLocationManagement = () => {
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [newLocationName, setNewLocationName] = useState("");
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, blue.600, blue.600)",
    "linear(to-r, blue.400, blue.400)"
  );

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("phonelocations");
      setLocations(data || []);
    } catch (err) {
      toast({
        title: "Error loading locations",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      toast({ title: "Location name is required", status: "warning" });
      return;
    }

    try {
      await postData("phonelocations", { name: newLocationName }, "Failed to add location");
      toast({ title: "Location added successfully", status: "success" });
      setNewLocationName("");
      onAddClose();
      fetchLocations();
    } catch (error) {
      toast({
        title: "Error adding location",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation.name.trim()) {
      toast({ title: "Location name is required", status: "warning" });
      return;
    }

    try {
      await putData("phonelocations", editingLocation.id, editingLocation, "Failed to update location");
      toast({ title: "Location updated successfully", status: "success" });
      setEditingLocation(null);
      fetchLocations();
    } catch (error) {
      toast({
        title: "Error updating location",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleDeleteLocation = async () => {
    try {
      await deleteData("phonelocations", deletingLocation.id, "Failed to delete location");
      toast({ title: "Location deleted successfully", status: "success" });
      setDeletingLocation(null);
      fetchLocations();
    } catch (error) {
      toast({
        title: "Error deleting location",
        description: error.message,
        status: "error",
      });
    }
  };

  const exportToCSV = () => {
    const csv = Papa.unparse(locations.map(loc => ({ ID: loc.id, Name: loc.name })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Phone_Locations.csv";
    link.click();
  };

  const filteredLocations = useMemo(() => {
    let data = [...locations];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(l => l.name.toLowerCase().includes(q));
    }
    return data;
  }, [locations, searchQuery]);

  const totalPages = Math.ceil(filteredLocations.length / limit) || 1;
  const paginatedData = filteredLocations.slice((page - 1) * limit, page * limit);

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="100%" py={8} px={{ base: 4, md: 8 }}>
        {/* Header Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={8}
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={MapPin} boxSize={8} color="blue.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Phone Locations
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage physical sites for communication assets</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="blue"
              onClick={onAddOpen}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
            >
              Add Location
            </Button>
            <IconButton
              icon={<Download size={20} />}
              onClick={exportToCSV}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Export Data"
            />
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchLocations}
              isLoading={isLoading}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Refresh Data"
            />
          </HStack>
        </Flex>

        {/* Stats Section */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <MotionBox
            whileHover={{ y: -4 }}
            bg={cardBg}
            p={5}
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={borderColor}
          >
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="xs" fontWeight="black" color="gray.500" textTransform="uppercase" letterSpacing="widest">
                  Defined Sites
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="blue.500">
                  {locations.length}
                </Text>
              </VStack>
              <Box p={3} bg="blue.50" borderRadius="xl">
                <Icon as={Activity} boxSize={6} color="blue.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="blue.400" borderRadius="full" />
          </MotionBox>
        </SimpleGrid>

        {/* Search Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              focusBorderColor="blue.400"
            />
          </InputGroup>
        </Box>

        {/* Table Section */}
        <Box
          bg={cardBg}
          borderRadius="3xl"
          shadow="2xl"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          {isLoading ? (
            <Center p={20} flexDir="column">
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Mapping site data...</Text>
            </Center>
          ) : filteredLocations.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No locations found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Location Name</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">ID Code</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {paginatedData.map((item) => (
                        <MotionBox
                          key={item.id}
                          as="tr"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          _hover={{ bg: "blue.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar size="sm" name={item.name} bg="blue.500" color="white" fontWeight="bold" />
                              <Text fontWeight="black" color="gray.800" fontSize="md">{item.name}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="lg">
                              LOC-00{item.id}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit Location" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => setEditingLocation(item)}
                                  variant="ghost"
                                  colorScheme="blue"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Delete Location" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingLocation(item)}
                                  variant="ghost"
                                  colorScheme="red"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Delete"
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </MotionBox>
                      ))}
                    </AnimatePresence>
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination */}
              <Flex direction="column" p={6} gap={4} align="center" bg="gray.50/50" borderTop="1px solid" borderColor={borderColor}>
                <HStack spacing={2}>
                  <IconButton
                    icon={<ChevronLeft size={18} />}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    isDisabled={page === 1}
                    variant="outline"
                    borderRadius="lg"
                    size="sm"
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((pageNum, idx, arr) => (
                      <React.Fragment key={pageNum}>
                        {idx > 0 && arr[idx - 1] !== pageNum - 1 && <Text color="gray.400">...</Text>}
                        <Button
                          size="sm"
                          variant={page === pageNum ? "solid" : "outline"}
                          colorScheme={page === pageNum ? "blue" : "gray"}
                          onClick={() => setPage(pageNum)}
                          borderRadius="lg"
                        >
                          {pageNum}
                        </Button>
                      </React.Fragment>
                    ))
                  }
                  <IconButton
                    icon={<ChevronRight size={18} />}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    isDisabled={page === totalPages}
                    variant="outline"
                    borderRadius="lg"
                    size="sm"
                  />
                </HStack>
                <HStack spacing={3}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredLocations.length)} of {filteredLocations.length} entries
                  </Text>
                  <Select
                    size="sm"
                    w="120px"
                    borderRadius="lg"
                    value={limit}
                    onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
                  >
                    {[5, 10, 20, 50].map(val => <option key={val} value={val}>{val} per page</option>)}
                  </Select>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Container>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">Add New Site</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel fontWeight="bold">Location Name</FormLabel>
              <Input
                placeholder="Enter physical site name"
                value={newLocationName}
                onChange={e => setNewLocationName(e.target.value)}
                borderRadius="xl"
                focusBorderColor="blue.400"
                size="lg"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="blue" onClick={handleAddLocation} borderRadius="xl" px={8}>Register Site</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingLocation} onClose={() => setEditingLocation(null)} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">Edit Site Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel fontWeight="bold">Location Name</FormLabel>
              <Input
                placeholder="Enter physical site name"
                value={editingLocation?.name || ""}
                onChange={e => setEditingLocation({ ...editingLocation, name: e.target.value })}
                borderRadius="xl"
                focusBorderColor="blue.400"
                size="lg"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditingLocation(null)} borderRadius="xl">Cancel</Button>
            <Button colorScheme="blue" onClick={handleUpdateLocation} borderRadius="xl" px={8}>Update Site</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingLocation}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingLocation(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Delete Site
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Are you sure you want to delete <Text as="span" fontWeight="black">"{deletingLocation?.name}"</Text>?
              This will remove the site mapping from the system.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingLocation(null)} borderRadius="xl" variant="ghost">
                No, Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDeleteLocation} ml={3} borderRadius="xl" px={8}>
                Yes, Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PhoneLocationManagement;
