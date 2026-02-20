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
  Textarea
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
  Key,
  Info
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const PermissionCategoriesManagement = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();

  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [formState, setFormState] = useState({ name: "", description: "" });
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

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchData("permission-categories");
      setCategories(data || []);
    } catch (err) {
      toast({
        title: "Error loading classifications",
        description: err.message || "Failed to fetch data",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    const isEditing = !!editingCategory;
    const dataToSave = isEditing ? editingCategory : formState;

    if (!dataToSave.name.trim()) {
      toast({ title: "Category designation is required", status: "warning" });
      return;
    }

    try {
      if (isEditing) {
        await putData("permission-categories", editingCategory.id, dataToSave, "Error updating category");
        toast({ title: "Classification updated", status: "success" });
      } else {
        await postData("permission-categories", dataToSave);
        toast({ title: "New category authorized", status: "success" });
      }
      fetchCategories();
      onAddClose();
      setEditingCategory(null);
      setFormState({ name: "", description: "" });
    } catch (error) {
      toast({ title: "Error saving record", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("permission-categories", deletingCategory.id, "Error deleting category");
      toast({ title: "Category revoked", status: "success" });
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    }
  };

  const filteredData = useMemo(() => {
    let data = [...categories];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(c => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    return data;
  }, [categories, searchQuery]);

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
              <Icon as={ShieldCheck} boxSize={8} color="green.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Permission Categories
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage access control hierarchy and security classifications</Text>
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
              Add Category
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchCategories}
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
                  Defined Classifications
                </Text>
                <Text fontSize="3xl" fontWeight="black" color="green.500">
                  {categories.length}
                </Text>
              </VStack>
              <Box p={3} bg="green.50" borderRadius="xl">
                <Icon as={Key} boxSize={6} color="green.500" />
              </Box>
            </HStack>
            <Box mt={3} h="2px" bg="green.400" borderRadius="full" />
          </MotionBox>
        </SimpleGrid>

        {/* Search Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search security categories..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              focusBorderColor="green.400"
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
              <Spinner size="xl" color="green.500" thickness="4px" />
              <Text mt={4} fontWeight="bold" color="gray.500">Decrypting security registry...</Text>
            </Center>
          ) : filteredData.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No classifications found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Classification Label</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Functional Context</Th>
                      <Th p={6} color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">System Index</Th>
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
                          _hover={{ bg: "green.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar size="sm" icon={<ShieldCheck size={20} />} bg="green.500" color="white" fontWeight="bold" />
                              <Text fontWeight="black" color="gray.800" fontSize="md">{item.name}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Text color="gray.500" fontSize="sm" fontStyle={!item.description ? "italic" : "normal"}>
                              {item.description || "No functional context provided"}
                            </Text>
                          </Td>
                          <Td p={6}>
                            <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="lg" fontFamily="mono">
                              SEC-{item.id.toString().padStart(3, '0')}
                            </Badge>
                          </Td>
                          <Td p={6} textAlign="right">
                            <HStack spacing={2} justify="flex-end">
                              <Tooltip label="Update Registry" hasArrow>
                                <IconButton
                                  icon={<Edit2 size={16} />}
                                  onClick={() => { setEditingCategory(item); onAddOpen(); }}
                                  variant="ghost"
                                  colorScheme="green"
                                  borderRadius="full"
                                  size="sm"
                                  aria-label="Edit"
                                />
                              </Tooltip>
                              <Tooltip label="Revoke Category" hasArrow>
                                <IconButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => setDeletingCategory(item)}
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
      <Modal isOpen={isAddOpen} onClose={() => { onAddClose(); setEditingCategory(null); setFormState({ name: "", description: "" }); }} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">
            {editingCategory ? "Update Classification" : "Authorize New Category"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Category Designation</FormLabel>
                <Input
                  placeholder="e.g. Sensitive Data Access"
                  value={editingCategory ? editingCategory.name : formState.name}
                  onChange={e => editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setFormState({ ...formState, name: e.target.value })}
                  borderRadius="xl" focusBorderColor="emerald.400" size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontWeight="bold">Functional Description</FormLabel>
                <Textarea
                  placeholder="Define the scope and context of this category..."
                  value={editingCategory ? editingCategory.description : formState.description}
                  onChange={e => editingCategory ? setEditingCategory({ ...editingCategory, description: e.target.value }) : setFormState({ ...formState, description: e.target.value })}
                  borderRadius="xl" focusBorderColor="emerald.400" size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { onAddClose(); setEditingCategory(null); }} borderRadius="xl">Cancel</Button>
            <Button colorScheme="emerald" onClick={handleSave} borderRadius="xl" px={8}>
              {editingCategory ? "Commit Sync" : "Authorize Class"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingCategory}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingCategory(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl" boxShadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Revoke Classification
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Confirm revocation of <Text as="span" fontWeight="black">"{deletingCategory?.name}"</Text>?
              This will neutralize all permission sets associated with this category.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingCategory(null)} borderRadius="xl" variant="ghost">
                Abort
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl" px={8}>
                Revoke Authorization
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PermissionCategoriesManagement;
