import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Flex,
  Select as ChakraSelect,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Heading,
  Container,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Badge,
  Avatar,
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
  Textarea,
  Spinner,
  Center
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Shield,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Folder
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentPermission, setCurrentPermission] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const [deletingPermission, setDeletingPermission] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, teal.600, blue.600)",
    "linear(to-r, teal.400, blue.400)"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [permsData, catsData] = await Promise.all([
        fetchData("permissions"),
        fetchData("permission-categories")
      ]);
      setPermissions(permsData || []);
      setCategories(catsData || []);
    } catch (err) {
      toast({
        title: "Error loading data",
        description: err.message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalType("add");
    setFormState({ name: "", description: "", categoryId: "" });
    onOpen();
  };

  const handleOpenEdit = (permission) => {
    setModalType("edit");
    setCurrentPermission(permission);
    setFormState({
      name: permission.name,
      description: permission.description || "",
      categoryId: permission.categoryId || "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formState.name || !formState.categoryId) {
      toast({ title: "Name and Category are required", status: "warning" });
      return;
    }

    try {
      if (modalType === "edit") {
        await putData("permissions", currentPermission.id, formState);
        toast({ title: "Permission updated", status: "success" });
      } else {
        await postData("permissions", formState);
        toast({ title: "Permission added", status: "success" });
      }
      loadData();
      onClose();
    } catch (error) {
      toast({ title: "Error saving permission", description: error.message, status: "error" });
    }
  };

  const handleDelete = async () => {
    if (!deletingPermission) return;
    try {
      await deleteData("permissions", deletingPermission.id);
      toast({ title: "Permission deleted", status: "success" });
      loadData();
    } catch (error) {
      toast({ title: "Error deleting", description: error.message, status: "error" });
    } finally {
      setDeletingPermission(null);
    }
  };

  const filteredPermissions = useMemo(() => {
    let data = [...permissions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      data = data.filter(p => selectedCategories.some(c => c.value === p.categoryId));
    }
    return data;
  }, [permissions, searchQuery, selectedCategories]);

  const stats = {
    total: permissions.length,
    categories: categories.length,
    active: filteredPermissions.length
  };

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="100%" py={8} px={{ base: 4, md: 8 }}>
        {/* Header */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          mb={8}
          gap={4}
        >
          <VStack align="start" spacing={1}>
            <HStack>
              <Icon as={Shield} boxSize={8} color="teal.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Access Controls
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage system permissions and security roles</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="teal"
              onClick={handleOpenAdd}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
            >
              Add Permission
            </Button>
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
                loadData();
              }}
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
            { label: "Total Permissions", value: stats.total, icon: Lock, color: "teal" },
            { label: "Categories", value: stats.categories, icon: Filter, color: "blue" },
            { label: "Visible Items", value: stats.active, icon: CheckCircle2, color: "purple" }
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
                  <Text fontSize="3xl" fontWeight="black" color={`${stat.color}.500`}>
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

        {/* Filters */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <HStack spacing={4} flexWrap="wrap">
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="xl"
                focusBorderColor="teal.400"
              />
            </InputGroup>
            <Box w="300px">
              <Select
                isMulti
                placeholder="Filter by Category..."
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                value={selectedCategories}
                onChange={setSelectedCategories}
                styles={{
                  menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.75rem",
                    borderColor: "inherit",
                    "&:hover": { borderColor: "gray.300" }
                  })
                }}
              />
            </Box>
          </HStack>
        </Box>

        {/* Content Table */}
        <Box
          bg={cardBg}
          borderRadius="3xl"
          shadow="sm"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          {categories.map((category) => {
            if (selectedCategories.length > 0 && !selectedCategories.some(c => c.value === category.id)) return null;

            const categoryPermissions = permissions.filter(
              (p) =>
                p.categoryId === category.id &&
                (searchQuery === "" ||
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (categoryPermissions.length === 0 && searchQuery) return null;

            return (
              <Box
                key={category.id}
                bg={cardBg}
                borderRadius="3xl"
                shadow="sm"
                border="1px solid"
                borderColor={borderColor}
                overflow="hidden"
                mb={6}
              >
                <Box bg="gray.50" px={6} py={4} borderBottom="1px solid" borderColor={borderColor}>
                  <HStack>
                    <Icon as={Folder} color="teal.500" />
                    <Text fontWeight="bold" fontSize="lg" color="gray.700">
                      {category.name} ({categoryPermissions.length})
                    </Text>
                  </HStack>
                </Box>

                {categoryPermissions.length === 0 ? (
                  <Box p={6} textAlign="center" color="gray.500">
                    <Text fontSize="sm">No permissions in this category yet.</Text>
                  </Box>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Permission Name</Th>
                          <Th>Description</Th>
                          <Th textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <AnimatePresence>
                          {categoryPermissions.map((perm) => (
                            <MotionBox
                              key={perm.id}
                              as="tr"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              _hover={{ bg: "gray.50" }}
                            >
                              <Td>
                                <HStack spacing={3}>
                                  <Avatar
                                    size="sm"
                                    icon={<Key size={16} />}
                                    bg="teal.100"
                                    color="teal.600"
                                  />
                                  <Text fontWeight="bold" color="gray.800">
                                    {perm.name}
                                  </Text>
                                </HStack>
                              </Td>
                              <Td>
                                <Text fontSize="sm" color="gray.500">
                                  {perm.description || "N/A"}
                                </Text>
                              </Td>
                              <Td textAlign="right">
                                <HStack justify="flex-end">
                                  <Tooltip label="Edit">
                                    <IconButton
                                      icon={<Edit2 size={18} />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="blue"
                                      onClick={() => handleOpenEdit(perm)}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Delete">
                                    <IconButton
                                      icon={<Trash2 size={18} />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => setDeletingPermission(perm)}
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
              </Box>
            );
          })}
        </Box>
      </Container>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl">
          <ModalHeader bgGradient={headerGradient} color="white" borderTopRadius="3xl">
            {modalType === 'add' ? "New Permission" : "Edit Permission"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={8}>
            <VStack spacing={6}>
              <Box bg="teal.50" p={4} borderRadius="xl" w="full" display="flex" alignItems="center" gap={4}>
                <Icon as={Unlock} boxSize={8} color="teal.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color="teal.700">Access Configuration</Text>
                  <Text fontSize="xs" color="teal.500">Define the scope and category for this permission key.</Text>
                </VStack>
              </Box>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" fontSize="sm">Permission Name</FormLabel>
                <Input
                  placeholder="e.g. view_dashboard"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  borderRadius="xl"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold" fontSize="sm">Category</FormLabel>
                <ChakraSelect
                  placeholder="Select Category"
                  value={formState.categoryId}
                  onChange={(e) => setFormState({ ...formState, categoryId: e.target.value })}
                  borderRadius="xl"
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </ChakraSelect>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm">Description</FormLabel>
                <Textarea
                  placeholder="Brief description of what this permission allows..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  borderRadius="xl"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="3xl" p={6}>
            <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="teal" onClick={handleSubmit} borderRadius="xl" px={8}>
              {modalType === 'add' ? "Create Permission" : "Update Permission"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingPermission}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingPermission(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)" />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Permission
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete <b>{deletingPermission?.name}</b>? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setDeletingPermission(null)} borderRadius="xl">
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

export default PermissionManagement;
