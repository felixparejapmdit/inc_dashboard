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
  Flex,
  Badge,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  AppWindow,
  Layers,
  Database,
  Activity,
  AlertCircle,
  Hash,
  Filter
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);
const ITEMS_PER_PAGE = 10;

const ApplicationTypeManagement = () => {
  const toast = useToast();
  const [appTypes, setAppTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingType, setEditingType] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  const [typeName, setTypeName] = useState("");
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

  const fetchApplicationTypes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("application-types");
      setAppTypes(data || []);
    } catch (err) {
      toast({
        title: "Error loading app types",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationTypes();
  }, []);

  const handleSave = async () => {
    if (!typeName.trim()) {
      toast({ title: "Module name is required", status: "warning" });
      return;
    }

    try {
      if (editingType) {
        await putData(`application-types/${editingType.id}`, { name: typeName }, "Failed to update category.");
        toast({ title: "Module refreshed", status: "success" });
      } else {
        await postData("add_application-types", { name: typeName }, "Failed to add category.");
        toast({ title: "New module registered", status: "success" });
      }
      fetchApplicationTypes();
      handleCloseModal();
    } catch (error) {
      toast({ title: "Error saving record", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("application-types", deletingType.id, "Failed to delete category.");
      toast({ title: "Module retired", status: "success" });
      setDeletingType(null);
      fetchApplicationTypes();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    }
  };

  const handleCloseModal = () => {
    onAddClose();
    setEditingType(null);
    setTypeName("");
  };

  const filteredData = useMemo(() => {
    let data = [...appTypes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t => t.name?.toLowerCase().includes(q));
    }
    return data;
  }, [appTypes, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / limit) || 1;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  // Stats
  const stats = {
    total: appTypes.length,
    active: filteredData.length,
    newest: appTypes.length > 0 ? appTypes[appTypes.length - 1].name : "N/A"
  };

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
              <Icon as={AppWindow} boxSize={8} color="blue.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Software Modules
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage Categories and System Designations</Text>
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
              Add Module
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={() => { setSearchQuery(""); fetchApplicationTypes(); }}
              isLoading={isLoading}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Refresh Data"
            />
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {[
            { label: "Total Modules", value: stats.total, icon: Layers, color: "blue" },
            { label: "Filtered Matches", value: stats.active, icon: Filter, color: "blue" },
            { label: "Latest Addition", value: stats.newest, icon: Activity, color: "purple", isText: true }
          ].map((stat, idx) => (
            <MotionBox
              key={idx}
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
                    {stat.label}
                  </Text>
                  <Text fontSize={stat.isText ? "lg" : "3xl"} fontWeight="black" color={`${stat.color}.500`} noOfLines={1}>
                    {stat.value}
                  </Text>
                </VStack>
                <Box p={3} bg={`${stat.color}.50`} borderRadius="xl">
                  <Icon as={stat.icon} boxSize={6} color={`${stat.color}.500`} />
                </Box>
              </HStack>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* Search & Filter Toolbar */}
        <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
          <InputGroup maxW={{ base: "full", md: "400px" }} size="lg">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search module designations..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              bg={cardBg}
              focusBorderColor="blue.400"
            />
          </InputGroup>
        </Stack>

        {/* Content Table */}
        <Box
          bg={cardBg}
          borderRadius="3xl"
          shadow="sm"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          {isLoading ? (
            <Center p={20} flexDir="column">
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Loading modules...</Text>
            </Center>
          ) : filteredData.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No modules found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Module Name</Th>
                    <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">System Identifier</Th>
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
                        _hover={{ bg: "gray.50" }}
                      >
                        <Td p={6}>
                          <HStack spacing={4}>
                            <Avatar
                              size="sm"
                              icon={<Layers size={20} />}
                              bg="blue.100"
                              color="blue.600"
                              fontWeight="bold"
                              borderRadius="md"
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" color="gray.800" fontSize="md">{item.name}</Text>
                              <Text fontSize="xs" color="gray.500">Core Component</Text>
                            </VStack>
                          </HStack>
                        </Td>
                        <Td p={6}>
                          <HStack>
                            <Icon as={Hash} size={14} color="gray.400" />
                            <Badge colorScheme="blue" variant="subtle" px={3} py={1} borderRadius="full" fontFamily="mono" fontSize="xs">
                              ID: {item.id}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td p={6} textAlign="right">
                          <HStack spacing={2} justify="flex-end">
                            <Tooltip label="Update Registry" hasArrow>
                              <IconButton
                                icon={<Edit3 size={18} />}
                                onClick={() => { setEditingType(item); setTypeName(item.name); onAddOpen(); }}
                                variant="ghost"
                                colorScheme="blue"
                                size="sm"
                                aria-label="Edit"
                              />
                            </Tooltip>
                            <Tooltip label="Retire Module" hasArrow>
                              <IconButton
                                icon={<Trash2 size={18} />}
                                onClick={() => setDeletingType(item)}
                                variant="ghost"
                                colorScheme="red"
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" align="center" p={6} borderTop="1px solid" borderColor={borderColor}>
              <HStack spacing={2}>
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  isDisabled={page === 1}
                  size="sm"
                  variant="outline"
                  borderRadius="lg"
                >
                  Previous
                </Button>
                <Text fontSize="sm" fontWeight="bold" color="gray.500" px={2}>
                  {page} of {totalPages}
                </Text>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  isDisabled={page === totalPages}
                  size="sm"
                  variant="outline"
                  borderRadius="lg"
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </Box>
      </Container>

      {/* Add / Edit Modal */}
      <Modal isOpen={isAddOpen} onClose={handleCloseModal} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl" boxShadow="2xl">
          <ModalHeader bgGradient={headerGradient} color="white" borderTopRadius="3xl">
            {editingType ? "Update Module" : "Add New Module"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={8}>
            <VStack spacing={6}>
              <Box bg="blue.50" p={4} borderRadius="xl" w="full" display="flex" alignItems="center" gap={4}>
                <Icon as={AppWindow} boxSize={8} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color="blue.700">Category Configuration</Text>
                  <Text fontSize="xs" color="blue.500">Define the core classification for your applications.</Text>
                </VStack>
              </Box>
              <FormControl isRequired>
                <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">Module Name</FormLabel>
                <Input
                  placeholder="e.g. Productivity Tools"
                  value={typeName}
                  onChange={e => setTypeName(e.target.value)}
                  borderRadius="xl"
                  focusBorderColor="blue.400"
                  size="lg"
                  bg="gray.50"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="3xl" p={6}>
            <Button variant="ghost" mr={3} onClick={handleCloseModal} borderRadius="xl">Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave} borderRadius="xl" px={8} boxShadow="lg">
              {editingType ? "Update Category" : "Save Category"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingType}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingType(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)" />
        <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Retire Module
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete <Text as="span" fontWeight="bold" color="red.500">"{deletingType?.name}"</Text>?
            This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setDeletingType(null)} borderRadius="xl">
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default ApplicationTypeManagement;
