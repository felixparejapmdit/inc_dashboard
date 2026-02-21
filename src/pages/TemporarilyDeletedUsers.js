import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  SimpleGrid,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Container,
  Spinner,
  Center,
  Tooltip,
  Button,
  Select,
  Divider,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RotateCcw,
  Trash2,
  UserX,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Activity,
  ShieldAlert,
  ArchiveRestore,
  MoreVertical,
} from "lucide-react";
import { fetchData, putDataRestore } from "../utils/fetchData";
import { filterPersonnelData } from "../utils/filterUtils";

const API_URL = process.env.REACT_APP_API_URL || "";
const MotionBox = motion.create(Box);

const TemporarilyDeletedUsers = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);

  const toast = useToast();
  const cancelRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Colors
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, red.600, pink.600)",
    "linear(to-r, red.400, pink.400)"
  );

  const loadDeletedUsers = async () => {
    setIsLoading(true);
    try {
      await fetchData(
        "personnels/deleted",
        (data) => {
          const filtered = filterPersonnelData(data);
          setDeletedUsers(filtered);
        },
        null,
        "Failed to load deleted users."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedUsers();
  }, []);

  const handleConfirmRestore = async () => {
    if (!selectedUser) return;

    try {
      await putDataRestore("personnels/restore", selectedUser.personnel_id);
      setDeletedUsers((prev) =>
        prev.filter((user) => user.personnel_id !== selectedUser.personnel_id)
      );
      toast({
        title: "Personnel Restored",
        description: `${selectedUser.givenname} has been successfully reinstated.`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Restoration Failed",
        description: error.message || "An unexpected error occurred during restoration.",
        status: "error",
        duration: 4000,
      });
    }

    setSelectedUser(null);
    onClose();
  };

  const filteredUsers = useMemo(() => {
    return deletedUsers.filter((user) => {
      const fullName = `${user.givenname || ""} ${user.middlename || ""} ${user.surname_husband || ""}`;
      return fullName.toLowerCase().includes(search.toLowerCase());
    });
  }, [deletedUsers, search]);

  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * limit, currentPage * limit);

  const stats = useMemo(() => ({
    total: deletedUsers.length,
    filtered: filteredUsers.length,
    latestDeletion: deletedUsers[0]?.updatedAt // Assuming updatedAt tracks the soft delete
  }), [deletedUsers, filteredUsers]);

  const openRestoreDialog = (user) => {
    setSelectedUser(user);
    onOpen();
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
              <Icon as={Trash2} boxSize={8} color="red.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Recovery Archive
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">Reinstate previously removed personnel records and account data</Text>
          </VStack>

          <HStack spacing={3}>
            <Tooltip label="Reload Archive" hasArrow>
              <IconButton
                icon={<RotateCcw size={20} />}
                onClick={loadDeletedUsers}
                isLoading={isLoading}
                variant="outline"
                size="lg"
                borderRadius="xl"
                aria-label="Refresh Data"
              />
            </Tooltip>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <Search size={18} color="gray" />
              </InputLeftElement>
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                borderRadius="xl"
                bg={cardBg}
                size="lg"
                focusBorderColor="red.400"
              />
            </InputGroup>
          </HStack>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {[
            { label: "Archived Records", value: stats.total, icon: UserX, color: "red" },
            { label: "Matching Search", value: stats.filtered, icon: Activity, color: "orange" },
            { label: "Archive Status", value: "Locked", icon: ShieldAlert, color: "purple" }
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
            </MotionBox>
          ))}
        </SimpleGrid>

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
              <Text mt={4} fontWeight="bold" color="gray.500">Scanning archive index...</Text>
            </Center>
          ) : filteredUsers.length === 0 ? (
            <Center p={20} flexDir="column">
              <Icon as={AlertCircle} boxSize={12} color="gray.300" />
              <Heading size="md" mt={4} color="gray.500">Archive Empty</Heading>
              <Text color="gray.400">No personnel records found in the recovery archive</Text>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple" style={{ tableLayout: "fixed" }}>
                  <Thead bg="gray.50">
                    <Tr>
                      <Th p={6} width="35%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Personnel Identity</Th>
                      <Th p={6} width="25%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Middle Designation</Th>
                      <Th p={6} width="25%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest">Surname (Husband)</Th>
                      <Th p={6} width="15%" color="gray.600" fontSize="xs" fontWeight="black" textTransform="uppercase" letterSpacing="widest" textAlign="right">Record Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <AnimatePresence>
                      {paginatedUsers.map((user, idx) => (
                        <MotionBox
                          key={user.personnel_id}
                          as="tr"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          _hover={{ bg: "red.50/30" }}
                        >
                          <Td p={6}>
                            <HStack spacing={4}>
                              <Avatar
                                size="sm"
                                name={`${user.givenname} ${user.surname_husband}`}
                                src={`${API_URL}/api/personnel_images/2x2/${user.personnel_id}`}
                                border="2px solid"
                                borderColor="red.100"
                              />
                              <VStack align="start" spacing={0} overflow="hidden">
                                <Text fontWeight="black" color="gray.800" fontSize="md" isTruncated w="full">{user.givenname}</Text>
                                <Badge colorScheme="red" variant="subtle" fontSize="10px" isTruncated>ID: {user.personnel_id}</Badge>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td p={6}>
                            <Text color="gray.600" fontWeight="semibold" isTruncated>{user.middlename || "—"}</Text>
                          </Td>
                          <Td p={6}>
                            <Text color="gray.600" fontWeight="bold" isTruncated>{user.surname_husband || "—"}</Text>
                          </Td>
                          <Td p={6} textAlign="right">
                            <Tooltip label="Reinstate Record" hasArrow>
                              <IconButton
                                icon={<ArchiveRestore size={18} />}
                                onClick={() => openRestoreDialog(user)}
                                colorScheme="green"
                                variant="solid"
                                borderRadius="xl"
                                size="md"
                                boxShadow="md"
                                _hover={{ transform: "scale(1.1)" }}
                                aria-label="Restore"
                              />
                            </Tooltip>
                          </Td>
                        </MotionBox>
                      ))}
                    </AnimatePresence>
                  </Tbody>
                </Table>
              </Box>

              {/* Pagination Controls */}
              <Flex direction="column" p={6} gap={4} align="center" bg="gray.50/50" borderTop="1px solid" borderColor={borderColor}>
                <HStack spacing={2}>
                  <IconButton
                    icon={<ChevronLeft size={18} />}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    isDisabled={currentPage === 1}
                    variant="outline"
                    borderRadius="lg"
                    size="sm"
                  />
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((pageNum, idx, arr) => (
                      <React.Fragment key={pageNum}>
                        {idx > 0 && arr[idx - 1] !== pageNum - 1 && <Text color="gray.400">...</Text>}
                        <Button
                          size="sm"
                          variant={currentPage === pageNum ? "solid" : "outline"}
                          colorScheme={currentPage === pageNum ? "red" : "gray"}
                          onClick={() => setCurrentPage(pageNum)}
                          borderRadius="lg"
                        >
                          {pageNum}
                        </Button>
                      </React.Fragment>
                    ))
                  }
                  <IconButton
                    icon={<ChevronRight size={18} />}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    isDisabled={currentPage === totalPages}
                    variant="outline"
                    borderRadius="lg"
                    size="sm"
                  />
                </HStack>
                <HStack spacing={3}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500">
                    Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, filteredUsers.length)} of {filteredUsers.length} archived entries
                  </Text>
                  <Select
                    size="sm"
                    w="120px"
                    borderRadius="lg"
                    value={limit}
                    onChange={e => { setLimit(Number(e.target.value)); setCurrentPage(1) }}
                  >
                    {[5, 10, 20, 50].map(val => <option key={val} value={val}>{val} per page</option>)}
                  </Select>
                </HStack>
              </Flex>
            </>
          )}
        </Box>
      </Container>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(8px)" bg="blackAlpha.400">
          <AlertDialogContent borderRadius="2xl" shadow="2xl">
            <AlertDialogHeader fontSize="xl" fontWeight="black" color="green.500">
              Confirm Restoration
            </AlertDialogHeader>

            <AlertDialogBody fontWeight="medium">
              You are about to reinstate <Text as="span" fontWeight="black">"{selectedUser?.givenname} {selectedUser?.middlename} {selectedUser?.surname_husband}"</Text>.
              This will restore their access and active status in the system.
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onClose} borderRadius="xl" variant="ghost">
                Abort
              </Button>
              <Button
                colorScheme="green"
                onClick={handleConfirmRestore}
                borderRadius="xl"
                px={10}
                boxShadow="lg"
              >
                Yes, Restore
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TemporarilyDeletedUsers;
