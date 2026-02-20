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
  Globe2,
  Activity,
  AlertCircle,
  Map
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const NationalityManagement = () => {
  const toast = useToast();
  const [nationalities, setNationalities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingNat, setEditingNat] = useState(null);
  const [deletingNat, setDeletingNat] = useState(null);
  const [formState, setFormState] = useState({ nationality: "", country_name: "" });
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, teal.600, blue.600)",
    "linear(to-r, teal.400, blue.400)"
  );

  const fetchNationalities = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("nationalities");
      setNationalities(data || []);
    } catch (err) {
      toast({
        title: "Error loading nationalities",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNationalities();
  }, []);

  const handleSave = async () => {
    const isEditing = !!editingNat;
    const body = isEditing ? editingNat : formState;

    if (!body.nationality.trim()) {
      toast({ title: "Nationality name is required", status: "warning" });
      return;
    }

    try {
      if (isEditing) {
        await putData("nationalities", editingNat.id, editingNat, "Failed to update nationality");
        toast({ title: "Nationality updated", status: "success" });
      } else {
        await postData("nationalities", formState, "Failed to add nationality");
        toast({ title: "Nationality added", status: "success" });
      }
      fetchNationalities();
      onAddClose();
      setEditingNat(null);
      setFormState({ nationality: "", country_name: "" });
    } catch (error) {
      toast({ title: "Error saving record", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("nationalities", deletingNat.id, () => { }, "Failed to delete nationality");
      toast({ title: "Nationality deleted", status: "success" });
      setDeletingNat(null);
      fetchNationalities();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    }
  };

  const filteredData = useMemo(() => {
    let data = [...nationalities];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(n =>
        n.nationality.toLowerCase().includes(q) ||
        n.country_name?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [nationalities, searchQuery]);

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
              <Icon as={Map} boxSize={8} color="teal.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Nationalities
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage ethnic and regional designations</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="teal"
              onClick={onAddOpen}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
            >
              Add Entry
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchNationalities}
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
                  Total Records
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="teal.500">
                  {nationalities.length}
                </Text>
              </VStack>
              <Box p={3} bg="teal.50" borderRadius="xl">
                <Icon as={Activity} boxSize={6} color="teal.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="teal.400" borderRadius="full" />
          </MotionBox>
        </SimpleGrid>

        {/* Search Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search nationality or country..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              focusBorderColor="teal.400"
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
              <Spinner size="xl" color="teal.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Retrieving records...</Text>
            </Center>
          ) : filteredData.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No entries found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Nationality</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Associated Country</Th>
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
                          _hover={{ bg: "teal.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar size="sm" name={item.nationality} bg="teal.500" color="white" fontWeight="bold" />
                              <Text fontWeight="black" color="gray.800" fontSize="md">{item.nationality}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="lg">
                              {item.country_name || "Not Specified"}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit Label" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => { setEditingNat(item); onAddOpen(); }}
                                  variant="ghost"
                                  colorScheme="teal"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Remove Entry" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingNat(item)}
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
                          colorScheme={page === pageNum ? "teal" : "gray"}
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
      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setEditingNat(null); setFormState({ nationality: "", country_name: "" }); }} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">
            {editingNat ? "Modify Nationality" : "Define Nationality"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Nationality Name</FormLabel>
                <Input
                  placeholder="e.g. American"
                  value={editingNat ? editingNat.nationality : formState.nationality}
                  onChange={e => editingNat ? setEditingNat({ ...editingNat, nationality: e.target.value }) : setFormState({ ...formState, nationality: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="teal.400"
                  size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Associated Country</FormLabel>
                <Input
                  placeholder="e.g. United States"
                  value={editingNat ? editingNat.country_name : formState.country_name}
                  onChange={e => editingNat ? setEditingNat({ ...editingNat, country_name: e.target.value }) : setFormState({ ...formState, country_name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="teal.400"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onAddClose(); setEditingNat(null); }} borderRadius="xl">Cancel</Button>
            <Button colorScheme="teal" onClick={handleSave} borderRadius="xl" px={8}>
              {editingNat ? "Update Changes" : "Save Definition"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingNat}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingNat(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Remove Definition
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Confirm removal of <Text as="span" fontWeight="black">"{deletingNat?.nationality}"</Text>?
              This will affect associated personnel records.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingNat(null)} borderRadius="xl" variant="ghost">
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

export default NationalityManagement;
