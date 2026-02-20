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
  Languages,
  Activity,
  AlertCircle,
  MessageSquare
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const LanguagesManagement = () => {
  const toast = useToast();
  const [languages, setLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingLang, setEditingLang] = useState(null);
  const [deletingLang, setDeletingLang] = useState(null);
  const [formState, setFormState] = useState({ country_name: "", name: "" });
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, blue.600, cyan.600)",
    "linear(to-r, blue.400, cyan.400)"
  );

  const fetchLanguages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("languages");
      setLanguages(data || []);
    } catch (err) {
      toast({
        title: "Error loading languages",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const handleSave = async () => {
    const isEditing = !!editingLang;
    const body = isEditing ? editingLang : formState;

    if (!body.country_name.trim() || !body.name.trim()) {
      toast({ title: "All fields are required", status: "warning" });
      return;
    }

    try {
      if (isEditing) {
        await putData("languages", editingLang.id, editingLang, "Failed to update language");
        toast({ title: "Language modified", status: "success" });
      } else {
        await postData("add_languages", formState, "Failed to add language");
        toast({ title: "Language registered", status: "success" });
      }
      fetchLanguages();
      onAddClose();
      setEditingLang(null);
      setFormState({ country_name: "", name: "" });
    } catch (error) {
      toast({ title: "Error saving record", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("languages", deletingLang.id, () => { }, "Failed to delete language");
      toast({ title: "Language removed", status: "success" });
      setDeletingLang(null);
      fetchLanguages();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    }
  };

  const filteredData = useMemo(() => {
    let data = [...languages];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.country_name?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [languages, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

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
              <Icon as={Languages} boxSize={8} color="blue.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Languages
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Global dialect and linguistic proficiency registration</Text>
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
              Add Language
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchLanguages}
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
                  Active Dialects
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="blue.500">
                  {languages.length}
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
              placeholder="Search dialect or region..."
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
              <Text mt={4} fontWeight="bold" color="gray.500">Mapping linguistic data...</Text>
            </Center>
          ) : filteredData.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No languages found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Language Name</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Primary Country</Th>
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
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="black" color="gray.800" fontSize="md">{item.name}</Text>
                                <Text fontSize="xs" color="gray.400" fontWeight="bold">Linguistics Ref: {item.id}</Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <HStack spacing={2}>
                              <Icon as={MessageSquare} size={14} color="gray.400" />
                              <Text fontWeight="medium" color="gray.600">{item.country_name}</Text>
                            </HStack>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit Language" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => { setEditingLang(item); onAddOpen(); }}
                                  variant="ghost"
                                  colorScheme="blue"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Remove Record" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingLang(item)}
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredData.length)} of {filteredData.length} entries
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

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setEditingLang(null); setFormState({ country_name: "", name: "" }); }} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">
            {editingLang ? "Update Language Data" : "New Language Registration"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Language Name</FormLabel>
                <Input
                  placeholder="e.g. Spanish"
                  value={editingLang ? editingLang.name : formState.name}
                  onChange={e => editingLang ? setEditingLang({ ...editingLang, name: e.target.value }) : setFormState({ ...formState, name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="blue.400"
                  size="lg"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Primary Country / Region</FormLabel>
                <Input
                  placeholder="e.g. Spain"
                  value={editingLang ? editingLang.country_name : formState.country_name}
                  onChange={e => editingLang ? setEditingLang({ ...editingLang, country_name: e.target.value }) : setFormState({ ...formState, country_name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="blue.400"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onAddClose(); setEditingLang(null); }} borderRadius="xl">Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave} borderRadius="xl" px={8}>
              {editingLang ? "Update Entry" : "Register Language"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingLang}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingLang(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Remove Record
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Confirm deletion of <Text as="span" fontWeight="black">"{deletingLang?.name}"</Text>?
              This will remove it from all personnel proficiency profiles.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingLang(null)} borderRadius="xl" variant="ghost">
                No, Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl" px={8}>
                Yes, Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default LanguagesManagement;
