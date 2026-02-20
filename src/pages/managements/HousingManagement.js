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
  Home,
  Activity,
  AlertCircle,
  Building2,
  Lock,
  History,
  Info
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const HousingManagement = () => {
  const toast = useToast();
  const [housingList, setHousingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [formState, setFormState] = useState({ building_name: "", floor: "", room: "", description: "" });
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, orange.600, orange.600)",
    "linear(to-r, orange.400, orange.400)"
  );

  const loadHousing = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("housing");
      setHousingList(data || []);
    } catch (err) {
      toast({
        title: "Error loading housing",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHousing();
  }, []);

  const handleSave = async () => {
    const isEditing = !!editingItem;
    const body = isEditing ? editingItem : formState;

    if (!body.building_name.trim() || !body.floor.trim() || !body.room.trim()) {
      toast({ title: "Building, Floor, and Room are required", status: "warning" });
      return;
    }

    try {
      if (isEditing) {
        await putData("housing", editingItem.id, editingItem, "Failed to update housing");
        toast({ title: "Housing data updated", status: "success" });
      } else {
        await postData("housing", formState, "Failed to add housing");
        toast({ title: "New unit registered", status: "success" });
      }
      loadHousing();
      onAddClose();
      setEditingItem(null);
      setFormState({ building_name: "", floor: "", room: "", description: "" });
    } catch (error) {
      toast({ title: "Error saving record", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("housing", deletingItem.id, "Failed to delete housing");
      toast({ title: "Unit removed", status: "success" });
      setDeletingItem(null);
      loadHousing();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    }
  };

  const filteredData = useMemo(() => {
    let data = [...housingList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(h =>
        h.building_name.toLowerCase().includes(q) ||
        h.description?.toLowerCase().includes(q) ||
        h.room?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [housingList, searchQuery]);

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
              <Icon as={Home} boxSize={8} color="orange.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Housing Portal
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage residential units, building allocations, and room assignments</Text>
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
              Add Housing Unit
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={loadHousing}
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
                  Total Units
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="orange.500">
                  {housingList.length}
                </Text>
              </VStack>
              <Box p={3} bg="orange.50" borderRadius="xl">
                <Icon as={Building2} boxSize={6} color="orange.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="orange.400" borderRadius="full" />
          </MotionBox>
        </SimpleGrid>

        {/* Search Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search by building, room, or desc..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              focusBorderColor="orange.400"
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
              <Spinner size="xl" color="orange.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Indexing housing directory...</Text>
            </Center>
          ) : filteredData.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No housing units found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Building & Level</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Unit / Room</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Status / Description</Th>
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
                          _hover={{ bg: "orange.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar size="sm" icon={<Building2 size={20} />} bg="orange.500" color="white" fontWeight="bold" />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="black" color="gray.800" fontSize="md">{item.building_name}</Text>
                                <Text fontSize="xs" color="gray.500" fontWeight="bold">Floor: {item.floor}</Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="orange" variant="solid" px={3} py={1} borderRadius="lg" fontWeight="black">
                              UNIT {item.room}
                            </Badge>
                          </Td>
                          <Td p={6}>
                            <HStack spacing={2}>
                              <Icon as={Info} size={14} color="gray.400" />
                              <Text color="gray.600" fontSize="sm" noOfLines={1}>{item.description || "No additional records"}</Text>
                            </HStack>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit Details" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => { setEditingItem(item); onAddOpen(); }}
                                  variant="ghost"
                                  colorScheme="orange"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Eject Record" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingItem(item)}
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredData.length)} of {filteredData.length} records
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
      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setEditingItem(null); setFormState({ building_name: "", floor: "", room: "", description: "" }); }} isCentered motionPreset="slideInBottom" size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">
            {editingItem ? "Update Housing Parameters" : "Housing Unit Registration"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Building Designation</FormLabel>
                <Input
                  placeholder="e.g. West Wing Residence"
                  value={editingItem ? editingItem.building_name : formState.building_name}
                  onChange={e => editingItem ? setEditingItem({ ...editingItem, building_name: e.target.value }) : setFormState({ ...formState, building_name: e.target.value })}
                  borderRadius="xl" focusBorderColor="orange.400" size="lg"
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Floor Level</FormLabel>
                  <Input
                    placeholder="e.g. 4th Floor"
                    value={editingItem ? editingItem.floor : formState.floor}
                    onChange={e => editingItem ? setEditingItem({ ...editingItem, floor: e.target.value }) : setFormState({ ...formState, floor: e.target.value })}
                    borderRadius="xl" focusBorderColor="orange.400" size="lg"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Room / Unit Code</FormLabel>
                  <Input
                    placeholder="e.g. 402-A"
                    value={editingItem ? editingItem.room : formState.room}
                    onChange={e => editingItem ? setEditingItem({ ...editingItem, room: e.target.value }) : setFormState({ ...formState, room: e.target.value })}
                    borderRadius="xl" focusBorderColor="orange.400" size="lg"
                  />
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontWeight="bold">Operational Description</FormLabel>
                <Input
                  placeholder="Details about unit status or type..."
                  value={editingItem ? editingItem.description || "" : formState.description}
                  onChange={e => editingItem ? setEditingItem({ ...editingItem, description: e.target.value }) : setFormState({ ...formState, description: e.target.value })}
                  borderRadius="xl" focusBorderColor="orange.400" size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onAddClose(); setEditingItem(null); }} borderRadius="xl">Cancel</Button>
            <Button colorScheme="orange" onClick={handleSave} borderRadius="xl" px={8}>
              {editingItem ? "Modify Allocation" : "Register Unit"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingItem}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingItem(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Revoke Housing Record
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Eject and delete record for <Text as="span" fontWeight="black">"{deletingItem?.building_name} Room {deletingItem?.room}"</Text>?
              This action is permanent and clears all historical occupancy links.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingItem(null)} borderRadius="xl" variant="ghost">
                Abort
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl" px={8}>
                Commit Deletion
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default HousingManagement;
