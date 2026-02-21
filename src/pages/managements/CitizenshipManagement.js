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
  Globe,
  Activity,
  AlertCircle,
  Flag
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const CitizenshipManagement = () => {
  const toast = useToast();
  const [citizenships, setCitizenships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingCitizenship, setEditingCitizenship] = useState(null);
  const [deletingCitizenship, setDeletingCitizenship] = useState(null);
  const [formState, setFormState] = useState({ country_name: "", citizenship: "" });
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, purple.600, blue.600)",
    "linear(to-r, purple.400, blue.400)"
  );

  const fetchCitizenships = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("citizenships");
      setCitizenships(data || []);
    } catch (err) {
      toast({
        title: "Error loading citizenships",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenships();
  }, []);

  const handleSave = async () => {
    const isEditing = !!editingCitizenship;
    const body = isEditing ? editingCitizenship : formState;

    if (!body.country_name.trim() || !body.citizenship.trim()) {
      toast({ title: "Country and Citizenship fields are required", status: "warning" });
      return;
    }

    try {
      if (isEditing) {
        await putData(`citizenships/${editingCitizenship.id}`, body, "Failed to update citizenship");
        toast({ title: "Citizenship updated", status: "success" });
      } else {
        await postData("citizenships", body, "Failed to add citizenship");
        toast({ title: "Citizenship added", status: "success" });
      }
      fetchCitizenships();
      onAddClose();
      setEditingCitizenship(null);
      setFormState({ country_name: "", citizenship: "" });
    } catch (error) {
      toast({ title: "Error saving citizenship", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("citizenships", deletingCitizenship.id, "Failed to delete citizenship");
      toast({ title: "Citizenship deleted", status: "success" });
      setDeletingCitizenship(null);
      fetchCitizenships();
    } catch (error) {
      toast({ title: "Error deleting citizenship", description: error.message, status: "error" });
    }
  };

  const filteredCitizenships = useMemo(() => {
    let data = [...citizenships];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(c =>
        c.country_name.toLowerCase().includes(q) ||
        c.citizenship.toLowerCase().includes(q)
      );
    }
    return data;
  }, [citizenships, searchQuery]);

  const totalPages = Math.ceil(filteredCitizenships.length / limit) || 1;
  const paginatedData = filteredCitizenships.slice((page - 1) * limit, page * limit);

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
              <Icon as={Flag} boxSize={8} color="purple.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Citizenships
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage global nationalities and administrative origins</Text>
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
              Add Nationality
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchCitizenships}
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
                  Nationalities
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="purple.500">
                  {citizenships.length}
                </Text>
              </VStack>
              <Box p={3} bg="purple.50" borderRadius="xl">
                <Icon as={Globe} boxSize={6} color="purple.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="purple.400" borderRadius="full" />
          </MotionBox>
        </SimpleGrid>

        {/* Search Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search by country or nationality..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              focusBorderColor="purple.400"
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
              <Spinner size="xl" color="purple.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Mapping nationalities...</Text>
            </Center>
          ) : filteredCitizenships.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No records found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} width="10%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">#</Th>
                      <Th p={6} width="45%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Country</Th>
                      <Th p={6} width="30%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Nationality</Th>
                      <Th p={6} width="15%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {paginatedData.map((item, idx) => (
                        <MotionBox
                          key={item.id}
                          as="tr"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          _hover={{ bg: "purple.50/30" }}
                        >
                          <Td p={6} fontWeight="bold" color="gray.400">{(page - 1) * limit + idx + 1}</Td>
                          <Td p={6}>
                            <HStack spacing={4} overflow="hidden">
                              <Avatar size="sm" name={item.country_name} bg="purple.500" color="white" fontWeight="bold" flexShrink={0} />
                              <Text fontWeight="black" color="gray.800" fontSize="md" isTruncated w="full">{item.country_name}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="lg">
                              {item.citizenship}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit Details" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => { setEditingCitizenship(item); onAddOpen(); }}
                                  variant="ghost"
                                  colorScheme="purple"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Remove Record" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingCitizenship(item)}
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredCitizenships.length)} of {filteredCitizenships.length} entries
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
      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setEditingCitizenship(null); setFormState({ country_name: "", citizenship: "" }); }} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">
            {editingCitizenship ? "Edit Nationality" : "Add New Nationality"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Country Name</FormLabel>
                <Input
                  placeholder="e.g. Philippines"
                  value={editingCitizenship ? editingCitizenship.country_name : formState.country_name}
                  onChange={e => editingCitizenship ? setEditingCitizenship({ ...editingCitizenship, country_name: e.target.value }) : setFormState({ ...formState, country_name: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="purple.400"
                  size="lg"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Citizenship / Adjective</FormLabel>
                <Input
                  placeholder="e.g. Filipino"
                  value={editingCitizenship ? editingCitizenship.citizenship : formState.citizenship}
                  onChange={e => editingCitizenship ? setEditingCitizenship({ ...editingCitizenship, citizenship: e.target.value }) : setFormState({ ...formState, citizenship: e.target.value })}
                  borderRadius="xl"
                  focusBorderColor="purple.400"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onAddClose(); setEditingCitizenship(null); }} borderRadius="xl">Cancel</Button>
            <Button colorScheme="purple" onClick={handleSave} borderRadius="xl" px={8}>
              {editingCitizenship ? "Update Data" : "Save Record"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingCitizenship}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingCitizenship(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Remove Record
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Are you sure you want to delete the nationality for <Text as="span" fontWeight="black">"{deletingCitizenship?.country_name}"</Text>?
              This administrative action cannot be reversed.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingCitizenship(null)} borderRadius="xl" variant="ghost">
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

export default CitizenshipManagement;
