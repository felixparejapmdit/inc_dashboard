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
  Layers,
  Activity,
  AlertCircle,
  Building
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const SectionManagement = () => {
  const toast = useToast();
  const [sections, setSections] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingSection, setEditingSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const [formState, setFormState] = useState({ name: "", department_id: "" });
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, orange.600, red.600)",
    "linear(to-r, orange.400, red.400)"
  );

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [secRes, deptRes] = await Promise.all([
        fetchData("sections"),
        fetchData("departments")
      ]);
      setSections(secRes || []);
      setDepartments(deptRes || []);
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

  const handleAddSection = async () => {
    if (!formState.name.trim() || !formState.department_id) {
      toast({ title: "Name and Department are required", status: "warning" });
      return;
    }

    try {
      await postData("sections", formState, "Failed to add section");
      toast({ title: "Section added successfully", status: "success" });
      setFormState({ name: "", department_id: "" });
      onAddClose();
      loadAllData();
    } catch (error) {
      toast({
        title: "Error adding section",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection.name.trim()) {
      toast({ title: "Section name is required", status: "warning" });
      return;
    }

    try {
      await putData("sections", editingSection.id, editingSection, "Failed to update section");
      toast({ title: "Section updated successfully", status: "success" });
      setEditingSection(null);
      loadAllData();
    } catch (error) {
      toast({
        title: "Error updating section",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleDeleteSection = async () => {
    try {
      await deleteData("sections", deletingSection.id, "Failed to delete section");
      toast({ title: "Section deleted successfully", status: "success" });
      setDeletingSection(null);
      loadAllData();
    } catch (error) {
      toast({
        title: "Error deleting section",
        description: error.message,
        status: "error",
      });
    }
  };

  const filteredSections = useMemo(() => {
    let data = [...sections];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (departments.find(d => d.id === s.department_id)?.name || "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [sections, searchQuery, departments]);

  const totalPages = Math.ceil(filteredSections.length / limit) || 1;
  const paginatedData = filteredSections.slice((page - 1) * limit, page * limit);

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
              <Icon as={Layers} boxSize={8} color="orange.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Sections
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Organize and manage departmental sections</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="orange"
              onClick={onAddOpen}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
            >
              Add Section
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
                  Total Sections
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="orange.500">
                  {sections.length}
                </Text>
              </VStack>
              <Box p={3} bg="orange.50" borderRadius="xl">
                <Icon as={Activity} boxSize={6} color="orange.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="orange.400" borderRadius="full" />
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
                placeholder="Search sections or departments..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                borderRadius="xl"
                focusBorderColor="orange.400"
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
              <Spinner size="xl" color="orange.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Loading section data...</Text>
            </Center>
          ) : filteredSections.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No sections found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} width="45%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Section Name</Th>
                      <Th p={6} width="40%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Department</Th>
                      <Th p={6} width="15%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" textAlign="right">Actions</Th>
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
                          _hover={{ bg: "orange.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4} overflow="hidden">
                              <Avatar size="sm" name={item.name} bg="orange.500" color="white" fontWeight="bold" flexShrink={0} />
                              <Text fontWeight="black" color="gray.800" fontSize="md" isTruncated w="full">{item.name}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="lg">
                              {departments.find(d => d.id === item.department_id)?.name || "N/A"}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit Section" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => setEditingSection(item)}
                                  variant="ghost"
                                  colorScheme="orange"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Delete Section" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingSection(item)}
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
                          colorScheme={page === pageNum ? "orange" : "gray"}
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredSections.length)} of {filteredSections.length} entries
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
          <ModalHeader fontWeight="black" fontSize="2xl">Add New Section</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Section Name</FormLabel>
                <Input
                  placeholder="Enter section name"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="orange.400"
                  size="lg"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Department</FormLabel>
                <Select
                  placeholder="Select Department"
                  value={formState.department_id}
                  onChange={e => setFormState({ ...formState, department_id: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                >
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="orange" onClick={handleAddSection} borderRadius="xl" px={8}>Save Section</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingSection} onClose={() => setEditingSection(null)} isCentered motionPreset="slideInBottom" size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">Edit Section</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Section Name</FormLabel>
                <Input
                  placeholder="Enter section name"
                  value={editingSection?.name || ""}
                  onChange={e => setEditingSection({ ...editingSection, name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="orange.400"
                  size="lg"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Department</FormLabel>
                <Select
                  placeholder="Select Department"
                  value={editingSection?.department_id || ""}
                  onChange={e => setEditingSection({ ...editingSection, department_id: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                >
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditingSection(null)} borderRadius="xl">Cancel</Button>
            <Button colorScheme="orange" onClick={handleUpdateSection} borderRadius="xl" px={8}>Update Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingSection}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingSection(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Delete Section
            </AlertDialogHeader>

            <AlertDialogBody fontWeight="medium">
              Are you sure you want to delete <Text as="span" fontWeight="black">"{deletingSection?.name}"</Text>?
              This will permanently remove the section from the system.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingSection(null)} borderRadius="xl" variant="ghost">
                No, Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDeleteSection} ml={3} borderRadius="xl" px={8}>
                Yes, Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SectionManagement;
