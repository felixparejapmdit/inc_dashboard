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
  Target,
  Layers,
  Activity,
  AlertCircle,
  Hash
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const DesignationManagement = () => {
  const toast = useToast();
  const [designations, setDesignations] = useState([]);
  const [sections, setSections] = useState([]);
  const [subsections, setSubsections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingDesignation, setEditingDesignation] = useState(null);
  const [deletingDesignation, setDeletingDesignation] = useState(null);
  const [formState, setFormState] = useState({
    name: "",
    section_id: "",
    subsection_id: ""
  });
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, purple.600, pink.600)",
    "linear(to-r, purple.400, pink.400)"
  );

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [desRes, secRes, subRes] = await Promise.all([
        fetchData("designations"),
        fetchData("sections"),
        fetchData("subsections")
      ]);
      setDesignations(desRes || []);
      setSections(secRes || []);
      setSubsections(subRes || []);
    } catch (err) {
      toast({
        title: "Error loading data",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddDesignation = async () => {
    if (!formState.name.trim()) {
      toast({ title: "Designation name is required", status: "warning" });
      return;
    }

    try {
      await postData("designations", formState, "Failed to add designation");
      toast({ title: "Designation added successfully", status: "success" });
      setFormState({ name: "", section_id: "", subsection_id: "" });
      onAddClose();
      loadAllData();
    } catch (error) {
      toast({
        title: "Error adding designation",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleUpdateDesignation = async () => {
    if (!editingDesignation.name.trim()) {
      toast({ title: "Designation name is required", status: "warning" });
      return;
    }

    try {
      await putData("designations", editingDesignation.id, editingDesignation, "Failed to update designation");
      toast({ title: "Designation updated successfully", status: "success" });
      setEditingDesignation(null);
      loadAllData();
    } catch (error) {
      toast({
        title: "Error updating designation",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleDeleteDesignation = async () => {
    try {
      await deleteData("designations", deletingDesignation.id, "Failed to delete designation");
      toast({ title: "Designation deleted successfully", status: "success" });
      setDeletingDesignation(null);
      loadAllData();
    } catch (error) {
      toast({
        title: "Error deleting designation",
        description: error.message,
        status: "error",
      });
    }
  };

  const filteredDesignations = useMemo(() => {
    let data = [...designations];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (sections.find(s => s.id === d.section_id)?.name || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [designations, searchQuery, sections]);

  const totalPages = Math.ceil(filteredDesignations.length / limit) || 1;
  const paginatedData = filteredDesignations.slice((page - 1) * limit, page * limit);

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
              <Icon as={Target} boxSize={8} color="purple.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Designations
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Define roles and functional designations</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="purple"
              onClick={onAddOpen}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
            >
              Add Designation
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={loadAllData}
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
                  Total Designations
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="purple.500">
                  {designations.length}
                </Text>
              </VStack>
              <Box p={3} bg="purple.50" borderRadius="xl">
                <Icon as={Activity} boxSize={6} color="purple.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="purple.400" borderRadius="full" />
          </MotionBox>
        </SimpleGrid>

        {/* Search and Action Bar */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <Flex justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={4}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Search designations, sections..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                borderRadius="xl"
                focusBorderColor="purple.400"
              />
            </InputGroup>
          </Flex>
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
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Loading designation data...</Text>
            </Center>
          ) : filteredDesignations.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No designations found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Designation</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Section</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Subsection</Th>
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
                          _hover={{ bg: "purple.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar size="sm" name={item.name} bg="purple.500" color="white" fontWeight="bold" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="black" color="gray.800" fontSize="md">{item.name}</Text>
                                <HStack spacing={1}>
                                  <Hash size={10} color="gray" />
                                  <Text fontSize="2xs" fontWeight="bold" color="gray.400">ID: {item.id}</Text>
                                </HStack>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="lg">
                              {sections.find(s => s.id === item.section_id)?.name || "Not Set"}
                            </Badge>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="pink" variant="subtle" px={3} py={1} borderRadius="lg">
                              {subsections.find(s => s.id === item.subsection_id)?.name || "Not Set"}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => setEditingDesignation(item)}
                                  variant="ghost"
                                  colorScheme="purple"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Delete" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingDesignation(item)}
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
                          colorScheme={page === pageNum ? "purple" : "gray"}
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredDesignations.length)} of {filteredDesignations.length} entries
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
      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered motionPreset="slideInBottom" size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">Add New Designation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Designation Name</FormLabel>
                <Input
                  placeholder="Enter designation name"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="purple.400"
                  size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Parent Section</FormLabel>
                <Select
                  placeholder="Select Section"
                  value={formState.section_id}
                  onChange={e => setFormState({ ...formState, section_id: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                >
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Parent Subsection</FormLabel>
                <Select
                  placeholder="Select Subsection"
                  value={formState.subsection_id}
                  onChange={e => setFormState({ ...formState, subsection_id: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                >
                  {subsections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="purple" onClick={handleAddDesignation} borderRadius="xl" px={8}>Save Designation</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingDesignation} onClose={() => setEditingDesignation(null)} isCentered motionPreset="slideInBottom" size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">Edit Designation</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Designation Name</FormLabel>
                <Input
                  placeholder="Enter designation name"
                  value={editingDesignation?.name || ""}
                  onChange={e => setEditingDesignation({ ...editingDesignation, name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="purple.400"
                  size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Parent Section</FormLabel>
                <Select
                  placeholder="Select Section"
                  value={editingDesignation?.section_id || ""}
                  onChange={e => setEditingDesignation({ ...editingDesignation, section_id: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                >
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Parent Subsection</FormLabel>
                <Select
                  placeholder="Select Subsection"
                  value={editingDesignation?.subsection_id || ""}
                  onChange={e => setEditingDesignation({ ...editingDesignation, subsection_id: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                >
                  {subsections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditingDesignation(null)} borderRadius="xl">Cancel</Button>
            <Button colorScheme="purple" onClick={handleUpdateDesignation} borderRadius="xl" px={8}>Update Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingDesignation}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingDesignation(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Delete Designation
            </AlertDialogHeader>

            <AlertDialogBody fontWeight="medium">
              Are you sure you want to delete <Text as="span" fontWeight="black">"{deletingDesignation?.name}"</Text>?
              This will permanently remove the designation from the system.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingDesignation(null)} borderRadius="xl" variant="ghost">
                No, Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDeleteDesignation} ml={3} borderRadius="xl" px={8}>
                Yes, Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DesignationManagement;
