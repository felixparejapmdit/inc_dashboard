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
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal
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
  Phone,
  Activity,
  AlertCircle,
  Download,
  Upload,
  UserPlus,
  CheckCircle2,
  XCircle,
  MoreVertical,
  MapPin,
  Hash,
  Smartphone
} from "lucide-react";
import * as XLSX from "xlsx";
import moment from "moment";
import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const MotionBox = motion.create(Box);

const PhoneDirectory = () => {
  const toast = useToast();
  const [directory, setDirectory] = useState([]);
  const [nameList, setNameList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals/Dialogs
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose
  } = useDisclosure();
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose
  } = useDisclosure();

  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState(null);

  const [formState, setFormState] = useState({
    name: "",
    location: "",
    prefix: "",
    extension: "",
    phone_name: "",
    dect_number: "",
    is_active: true,
  });

  // Custom Name Adder
  const [isAddingNewName, setIsAddingNewName] = useState(false);
  const [newNameInput, setNewNameInput] = useState("");

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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dirRes, namesRes] = await Promise.all([
        fetchData("phone-directory"),
        fetchData("phone-directory/names")
      ]);
      setDirectory(dirRes || []);
      setNameList(namesRes || []);
    } catch (err) {
      toast({
        title: "Error loading directory",
        description: err.message,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    const entry = editingEntry || formState;
    const { name, location, prefix, extension, phone_name } = entry;

    if (!name || !location || !prefix || !extension || !phone_name) {
      toast({ title: "Please fill in all required fields", status: "warning" });
      return;
    }

    try {
      if (editingEntry) {
        await putData("phone-directory", editingEntry.id, editingEntry);
        toast({ title: "Contact updated", status: "success" });
      } else {
        await postData("add_phone-directory", formState);
        toast({ title: "Contact added", status: "success" });
      }
      loadData();
      onAddClose();
      setEditingEntry(null);
      setFormState({
        name: "",
        location: "",
        prefix: "",
        extension: "",
        phone_name: "",
        dect_number: "",
        is_active: true,
      });
    } catch (error) {
      toast({ title: "Error saving contact", status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("phone-directory", deletingEntry.id);
      toast({ title: "Contact removed", status: "success" });
      setDeletingEntry(null);
      loadData();
    } catch (error) {
      toast({ title: "Error deleting contact", status: "error" });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        await postData("import-phone-directory", { data: rows });
        toast({ title: "Import successful", status: "success" });
        loadData();
        onImportClose();
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      toast({ title: "Import failed", status: "error" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddCustomName = () => {
    if (newNameInput.trim()) {
      setNameList([...nameList, newNameInput.trim()]);
      if (editingEntry) setEditingEntry({ ...editingEntry, name: newNameInput.trim() });
      else setFormState({ ...formState, name: newNameInput.trim() });
      setNewNameInput("");
      setIsAddingNewName(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredDirectory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Phone Directory");
    XLSX.writeFile(workbook, `Phone_Directory_Export_${moment().format("YYYY-MM-DD")}.xlsx`);
  };

  const filteredDirectory = useMemo(() => {
    let data = [...directory];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.extension?.toLowerCase().includes(q) ||
        item.phone_name?.toLowerCase().includes(q) ||
        item.dect_number?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [directory, searchQuery]);

  const stats = useMemo(() => ({
    total: directory.length,
    active: directory.filter(i => i.is_active).length,
    inactive: directory.filter(i => !i.is_active).length,
    dect: directory.filter(i => i.dect_number).length
  }), [directory]);

  const totalPages = Math.ceil(filteredDirectory.length / limit) || 1;
  const paginatedData = filteredDirectory.slice((page - 1) * limit, page * limit);

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
              <Icon as={Phone} boxSize={8} color="blue.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Phone Directory
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Manage list of phone directory and DECT assignments</Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="blue"
              onClick={() => { setEditingEntry(null); setFormState({ name: "", location: "", prefix: "", extension: "", phone_name: "", dect_number: "", is_active: true }); onAddOpen(); }}
              size="lg"
              borderRadius="xl"
              boxShadow="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              transition="all 0.2s"
            >
              Add Contact
            </Button>
            <IconButton
              icon={<Download size={20} />}
              onClick={exportToExcel}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Export"
            />
            <IconButton
              icon={<Upload size={20} />}
              onClick={onImportOpen}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Import"
            />
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={loadData}
              isLoading={isLoading}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Refresh Data"
            />
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          {[
            { label: "Total Contacts", value: stats.total, icon: Smartphone, color: "blue" },
            { label: "Active Lines", value: stats.active, icon: CheckCircle2, color: "green" },
            { label: "Inactive", value: stats.inactive, icon: XCircle, color: "red" },
            { label: "DECT Users", value: stats.dect, icon: Hash, color: "purple" }
          ].map(stat => (
            <MotionBox
              key={stat.label}
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
              <Box mt={3} h="2px" bg={`${stat.color}.400`} borderRadius="full" />
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* Action Panel */}
        <Box bg={cardBg} p={6} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor} mb={8}>
          <InputGroup maxW="500px">
            <InputLeftElement pointerEvents="none">
              <Search size={18} color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, location, extension, DECT..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              borderRadius="xl"
              focusBorderColor="blue.400"
              size="lg"
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
              <Text mt={4} fontWeight="bold" color="gray.500">Loading directory...</Text>
            </Center>
          ) : filteredDirectory.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">No contacts found</Heading>
              <Text color="gray.400">Try adjusting your search query</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} width="30%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Name</Th>
                      <Th p={6} width="20%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Location</Th>
                      <Th p={6} width="25%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Communication</Th>
                      <Th p={6} width="15%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Status</Th>
                      <Th p={6} width="10%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" textAlign="right">Actions</Th>
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
                          <Td p={6} overflow="hidden">
                            <HStack spacing={4} overflow="hidden">
                              <Avatar size="sm" name={item.name} bg="blue.500" color="white" fontWeight="bold" />
                              <VStack align="start" spacing={0} overflow="hidden">
                                <Text fontWeight="black" color="gray.800" fontSize="md" isTruncated width="100%">{item.name}</Text>
                                <Text fontSize="xs" color="gray.400" fontWeight="bold" isTruncated width="100%">{item.phone_name}</Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td p={6} overflow="hidden">
                            <HStack spacing={2} overflow="hidden">
                              <Icon as={MapPin} size={14} color="gray.400" flexShrink={0} />
                              <Text fontWeight="medium" color="gray.600" isTruncated>{item.location}</Text>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <VStack align="start" spacing={1}>
                              <Badge colorScheme="blue" variant="subtle" borderRadius="lg" px={2}>
                                Ext: {item.prefix}-{item.extension}
                              </Badge>
                              {item.dect_number && (
                                <Badge colorScheme="purple" variant="subtle" borderRadius="lg" px={2}>
                                  DECT: {item.dect_number}
                                </Badge>
                              )}
                            </VStack>
                          </Td>
                          <Td p={6}>
                            <HStack spacing={1}>
                              <Icon as={item.is_active ? CheckCircle2 : XCircle} color={item.is_active ? "green.500" : "red.500"} size={16} />
                              <Text fontSize="xs" fontWeight="black" color={item.is_active ? "green.600" : "red.600"}>
                                {item.is_active ? "ACTIVE" : "INACTIVE"}
                              </Text>
                            </HStack>
                          </Td>
                          <Td p={6} textAlign="right">
                            <Menu isLazy>
                              <MenuButton as={IconButton} icon={<MoreVertical size={18} />} variant="ghost" borderRadius="full" size="sm" />
                              <Portal>
                                <MenuList borderRadius="xl" shadow="xl" border="1px solid" borderColor={borderColor}>
                                  <MenuItem icon={<Edit2 size={14} />} onClick={() => { setEditingEntry(item); onAddOpen(); }}>Edit Contact</MenuItem>
                                  <MenuItem icon={<Trash2 size={14} />} color="red.500" onClick={() => setDeletingEntry(item)}>Delete Contact</MenuItem>
                                </MenuList>
                              </Portal>
                            </Menu>
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
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredDirectory.length)} of {filteredDirectory.length} entries
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
      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered motionPreset="slideInBottom" size="2xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="3xl" boxShadow="2xl">
          <ModalHeader fontWeight="black" fontSize="2xl">
            {editingEntry ? "Edit Line Details" : "New Line Registration"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Box gridColumn="span 2">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Owner / Personnel Name</FormLabel>
                  {!isAddingNewName ? (
                    <HStack>
                      <Select
                        placeholder="Select Personnel"
                        value={editingEntry ? editingEntry.name : formState.name}
                        onChange={e => editingEntry ? setEditingEntry({ ...editingEntry, name: e.target.value }) : setFormState({ ...formState, name: e.target.value })}
                        borderRadius="xl"
                        size="lg"
                      >
                        {nameList.map((n, i) => <option key={i} value={n}>{n}</option>)}
                      </Select>
                      <IconButton icon={<UserPlus size={18} />} colorScheme="blue" variant="ghost" onClick={() => setIsAddingNewName(true)} />
                    </HStack>
                  ) : (
                    <HStack>
                      <Input placeholder="Enter Full Name" value={newNameInput} onChange={e => setNewNameInput(e.target.value)} borderRadius="xl" size="lg" autoFocus />
                      <IconButton icon={<CheckCircle2 size={18} />} colorScheme="green" onClick={handleAddCustomName} />
                      <IconButton icon={<XCircle size={18} />} colorScheme="red" variant="ghost" onClick={() => setIsAddingNewName(false)} />
                    </HStack>
                  )}
                </FormControl>
              </Box>

              <FormControl isRequired>
                <FormLabel fontWeight="bold">Location</FormLabel>
                <Input
                  placeholder="e.g. Server Room"
                  value={editingEntry ? editingEntry.location : formState.location}
                  onChange={e => editingEntry ? setEditingEntry({ ...editingEntry, location: e.target.value }) : setFormState({ ...formState, location: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold">Phone Model / Name</FormLabel>
                <Input
                  placeholder="e.g. Cisco CP-7841"
                  value={editingEntry ? editingEntry.phone_name : formState.phone_name}
                  onChange={e => editingEntry ? setEditingEntry({ ...editingEntry, phone_name: e.target.value }) : setFormState({ ...formState, phone_name: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              <HStack spacing={4} align="end">
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Prefix</FormLabel>
                  <Input
                    placeholder="8"
                    value={editingEntry ? editingEntry.prefix : formState.prefix}
                    onChange={e => editingEntry ? setEditingEntry({ ...editingEntry, prefix: e.target.value }) : setFormState({ ...formState, prefix: e.target.value })}
                    borderRadius="xl"
                    size="lg"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontWeight="bold">Extension</FormLabel>
                  <Input
                    placeholder="1000"
                    value={editingEntry ? editingEntry.extension : formState.extension}
                    onChange={e => editingEntry ? setEditingEntry({ ...editingEntry, extension: e.target.value }) : setFormState({ ...formState, extension: e.target.value })}
                    borderRadius="xl"
                    size="lg"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontWeight="bold">DECT Number (Optional)</FormLabel>
                <Input
                  placeholder="6XXX"
                  value={editingEntry ? editingEntry.dect_number : formState.dect_number}
                  onChange={e => editingEntry ? setEditingEntry({ ...editingEntry, dect_number: e.target.value }) : setFormState({ ...formState, dect_number: e.target.value })}
                  borderRadius="xl"
                  size="lg"
                />
              </FormControl>

              <Box gridColumn="span 2">
                <Divider my={2} />
                <Checkbox
                  isChecked={editingEntry ? editingEntry.is_active : formState.is_active}
                  onChange={e => editingEntry ? setEditingEntry({ ...editingEntry, is_active: e.target.checked }) : setFormState({ ...formState, is_active: e.target.checked })}
                  colorScheme="blue"
                  size="lg"
                  fontWeight="bold"
                >
                  Active Line Status
                </Checkbox>
              </Box>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter bg="gray.50" borderBottomRadius="3xl" p={6}>
            <Button variant="ghost" mr={3} onClick={onAddClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="blue" onClick={handleSave} borderRadius="xl" px={10} size="lg" boxShadow="lg">
              {editingEntry ? "Update Entry" : "Register Contact"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={isImportOpen} onClose={onImportClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader fontWeight="black">Bulk Import Contacts</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} py={4}>
              <Box w="full" p={8} border="2px dashed" borderColor="blue.200" borderRadius="2xl" bg="blue.50/50" textAlign="center">
                <Icon as={Upload} boxSize={8} color="blue.400" mb={2} />
                <Text fontWeight="bold" color="blue.600">Drop Excel file here</Text>
                <Text fontSize="xs" color="gray.500">Only .xlsx or .csv files supported</Text>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={e => setFile(e.target.files[0])}
                  opacity={0}
                  position="absolute"
                  top={0} left={0} w="full" h="full" cursor="pointer"
                />
              </Box>
              {file && (
                <HStack w="full" bg="gray.100" p={2} borderRadius="lg" justify="space-between">
                  <Text fontSize="sm" fontWeight="bold" isTruncated px={2}>{file.name}</Text>
                  <IconButton icon={<XCircle size={14} />} size="xs" colorScheme="red" variant="ghost" onClick={() => setFile(null)} />
                </HStack>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onImportClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleImport} isLoading={isImporting} isDisabled={!file}>Start Import</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={!!deletingEntry}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingEntry(null)}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="red.500">
              Delete Contact
            </AlertDialogHeader>
            <AlertDialogBody fontWeight="medium">
              Are you sure you want to remove <Text as="span" fontWeight="black">"{deletingEntry?.name}"</Text>?
              This will erase all communication details for this contact.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingEntry(null)} variant="ghost" borderRadius="xl">Cancel</Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="xl" px={8}>Delete Permanently</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PhoneDirectory;
