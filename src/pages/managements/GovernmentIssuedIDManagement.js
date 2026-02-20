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
  ShieldCheck,
  Activity,
  AlertCircle,
  CreditCard
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const GovernmentIssuedIDManagement = () => {
  const toast = useToast();
  const [governmentIDs, setGovernmentIDs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingID, setEditingID] = useState(null);
  const [deletingID, setDeletingID] = useState(null);
  const [newIDName, setNewIDName] = useState("");
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, red.600, orange.600)",
    "linear(to-r, red.400, orange.400)"
  );

  const fetchGovernmentIDs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("government-issued-ids");
      setGovernmentIDs(data || []);
    } catch (err) {
      toast({
        title: "Error loading IDs",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernmentIDs();
  }, []);

  const handleSave = async () => {
    const isEditing = !!editingID;
    const nameToSave = isEditing ? editingID.name : newIDName;

    if (!nameToSave.trim()) {
      toast({ title: "Identification name is required", status: "warning" });
      return;
    }

    try {
      if (isEditing) {
        await putData("government-issued-ids", editingID.id, { name: nameToSave }, "Failed to update ID");
        toast({ title: "Identification updated", status: "success" });
      } else {
        await postData("government-issued-ids", { name: nameToSave }, "Failed to add ID");
        toast({ title: "Identification added", status: "success" });
      }
      fetchGovernmentIDs();
      onAddClose();
      setEditingID(null);
      setNewIDName("");
    } catch (error) {
      toast({ title: "Error saving record", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("government-issued-ids", deletingID.id, "Failed to delete ID");
      toast({ title: "Identification removed", status: "success" });
      setDeletingID(null);
      fetchGovernmentIDs();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    }
  };

  const filteredData = useMemo(() => {
    let data = [...governmentIDs];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(id => id.name.toLowerCase().includes(q));
    }
    return data;
  }, [governmentIDs, searchQuery]);

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
              <Icon as={CreditCard} boxSize={8} color="red.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Government IDs
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage accepted official identifications and credentials</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="red"
              onClick={onAddOpen}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
            >
              Add Identification
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchGovernmentIDs}
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
                  Accepted IDs
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="red.500">
                  {governmentIDs.length}
                </Text>
              </VStack>
              <Box p={3} bg="red.50" borderRadius="xl">
                <Icon as={ShieldCheck} boxSize={6} color="red.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="red.400" borderRadius="full" />
          </MotionBox>
        </SimpleGrid>

        {/* Search Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search ID types..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              focusBorderColor="red.400"
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
              <Spinner size="xl" color="red.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Securing credential data...</Text>
            </Center>
          ) : filteredData.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No identifications found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Official Designation</Th>
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
                          _hover={{ bg: "red.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar size="sm" name={item.name} bg="red.500" color="white" fontWeight="bold" />
                              <Text fontWeight="black" color="gray.800" fontSize="md">{item.name}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="red" variant="subtle" px={3} py={1} borderRadius="lg">
                              ID-{item.id.toString().padStart(4, '0')}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Modify Identification" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => { setEditingID(item); onAddOpen(); }}
                                  variant="ghost"
                                  colorScheme="red"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Remove Designation" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingID(item)}
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
                          colorScheme={page === pageNum ? "red" : "gray"}
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
      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setEditingID(null); setNewIDName(""); }} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">
            {editingID ? "Edit ID Registration" : "New ID Registration"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Identification Name</FormLabel>
                <Input
                  placeholder="e.g. Unified Multi-Purpose ID (UMID)"
                  value={editingID ? editingID.name : newIDName}
                  onChange={e => editingID ? setEditingID({ ...editingID, name: e.target.value }) : setNewIDName(e.target.value)}
                  borderRadius="xl"
                  focusBorderColor="red.400"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onAddClose(); setEditingID(null); }} borderRadius="xl">Cancel</Button>
            <Button colorScheme="red" onClick={handleSave} borderRadius="xl" px={8}>
              {editingID ? "Update Registration" : "Save Credential"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingID}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingID(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Revoke Registration
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Are you sure you want to remove <Text as="span" fontWeight="black">"{deletingID?.name}"</Text> from the accepted IDs list?
              This may affect records using this identification type.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingID(null)} borderRadius="xl" variant="ghost">
                No, Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl" px={8}>
                Yes, Revoke
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default GovernmentIssuedIDManagement;
