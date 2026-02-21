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
  Hash
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const DistrictManagement = () => {
  const toast = useToast();
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingDistrict, setEditingDistrict] = useState(null);
  const [deletingDistrict, setDeletingDistrict] = useState(null);
  const [newDistrictName, setNewDistrictName] = useState("");
  const cancelRef = useRef();

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, green.600, teal.600)",
    "linear(to-r, green.400, teal.400)"
  );

  const fetchDistricts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("districts");
      setDistricts(data || []);
    } catch (err) {
      toast({
        title: "Error loading districts",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleAddDistrict = async () => {
    if (!newDistrictName.trim()) {
      toast({ title: "District name is required", status: "warning" });
      return;
    }

    try {
      await postData("districts", { name: newDistrictName }, "Failed to add district");
      toast({ title: "District added successfully", status: "success" });
      setNewDistrictName("");
      onAddClose();
      fetchDistricts();
    } catch (error) {
      toast({
        title: "Error adding district",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleUpdateDistrict = async () => {
    if (!editingDistrict.name.trim()) {
      toast({ title: "District name is required", status: "warning" });
      return;
    }

    try {
      await putData("districts", editingDistrict.id, editingDistrict, "Failed to update district");
      toast({ title: "District updated successfully", status: "success" });
      setEditingDistrict(null);
      fetchDistricts();
    } catch (error) {
      toast({
        title: "Error updating district",
        description: error.message,
        status: "error",
      });
    }
  };

  const handleDeleteDistrict = async () => {
    try {
      await deleteData("districts", deletingDistrict.id, "Failed to delete district");
      toast({ title: "District deleted successfully", status: "success" });
      setDeletingDistrict(null);
      fetchDistricts();
    } catch (error) {
      toast({
        title: "Error deleting district",
        description: error.message,
        status: "error",
      });
    }
  };

  const filteredDistricts = useMemo(() => {
    let data = [...districts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(d => d.name.toLowerCase().includes(q));
    }
    return data;
  }, [districts, searchQuery]);

  const totalPages = Math.ceil(filteredDistricts.length / limit) || 1;
  const paginatedData = filteredDistricts.slice((page - 1) * limit, page * limit);

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
              <Icon as={Globe} boxSize={8} color="green.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Districts
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage districts</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="green"
              onClick={onAddOpen}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
            >
              Add District
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchDistricts}
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
                  Total Districts
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="green.500">
                  {districts.length}
                </Text>
              </VStack>
              <Box p={3} bg="green.50" borderRadius="xl">
                <Icon as={Activity} boxSize={6} color="green.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="green.400" borderRadius="full" />
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
                placeholder="Search districts..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                borderRadius="xl"
                focusBorderColor="green.400"
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
              <Spinner size="xl" color="green.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Loading district data...</Text>
            </Center>
          ) : filteredDistricts.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No districts found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} width="60%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">District Name</Th>
                      <Th p={6} width="25%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Code / ID</Th>
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
                          _hover={{ bg: "green.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4} overflow="hidden">
                              <Avatar size="sm" name={item.name} bg="green.500" color="white" fontWeight="bold" flexShrink={0} />
                              <Text fontWeight="black" color="gray.800" fontSize="md" isTruncated>{item.name}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="lg">
                              #{item.id}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Edit District" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => setEditingDistrict(item)}
                                  variant="ghost"
                                  colorScheme="green"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Delete District" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingDistrict(item)}
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
                          colorScheme={page === pageNum ? "green" : "gray"}
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredDistricts.length)} of {filteredDistricts.length} entries
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
          <ModalHeader fontWeight="black" fontSize="2xl">Add New District</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel fontWeight="bold">District Name</FormLabel>
              <Input
                placeholder="Enter district name"
                value={newDistrictName}
                onChange={e => setNewDistrictName(e.target.value)}
                borderRadius="xl"
                focusBorderColor="green.400"
                size="lg"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="green" onClick={handleAddDistrict} borderRadius="xl" px={8}>Save District</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingDistrict} onClose={() => setEditingDistrict(null)} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">Edit District</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel fontWeight="bold">District Name</FormLabel>
              <Input
                placeholder="Enter district name"
                value={editingDistrict?.name || ""}
                onChange={e => setEditingDistrict({ ...editingDistrict, name: e.target.value })}
                borderRadius="xl"
                focusBorderColor="green.400"
                size="lg"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditingDistrict(null)} borderRadius="xl">Cancel</Button>
            <Button colorScheme="green" onClick={handleUpdateDistrict} borderRadius="xl" px={8}>Update Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingDistrict}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingDistrict(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Delete District
            </AlertDialogHeader>

            <AlertDialogBody fontWeight="medium">
              Are you sure you want to delete <Text as="span" fontWeight="black">"{deletingDistrict?.name}"</Text>?
              This will permanently remove the district from the system.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingDistrict(null)} borderRadius="xl" variant="ghost">
                No, Keep it
              </Button>
              <Button colorScheme="red" onClick={handleDeleteDistrict} ml={3} borderRadius="xl" px={8}>
                Yes, Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default DistrictManagement;
