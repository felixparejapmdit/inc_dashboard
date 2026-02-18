import React, { useState, useEffect } from "react";
import {
    Box,
    Heading,
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    HStack,
    VStack,
    Button,
    useToast,
    Spinner,
    Icon,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Select,
    useDisclosure,
    Flex,
    Tooltip,
    Divider,
    Container,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    FiCheckCircle,
    FiCircle,
    FiRefreshCw,
    FiUserCheck,
    FiUsers,
    FiChevronRight,
    FiArrowRight,
    FiAlertCircle,
    FiSearch
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/apiHeaders";

const API_URL = process.env.REACT_APP_API_URL || "";

const MotionTr = motion.create(Tr);

const UsersProgress = () => {
    const [personnels, setPersonnels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen: isSyncModalOpen, onOpen: onSyncModalOpen, onClose: onSyncModalClose } = useDisclosure();

    // Sync Modal State
    const [selectedSyncPersonnel, setSelectedSyncPersonnel] = useState(null);
    const [selectedSyncGroup, setSelectedSyncGroup] = useState("");
    const [loadingSync, setLoadingSync] = useState(false);

    // Derived Data
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = personnels.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(personnels.length / ITEMS_PER_PAGE);

    const stats = {
        total: personnels.length,
        pending: personnels.filter(p => p.personnel_progress !== "8").length,
        ready: personnels.filter(p => p.personnel_progress === "8").length,
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/personnels/monitoring`, {
                headers: getAuthHeaders(),
            });
            setPersonnels(response.data);
        } catch (error) {
            console.error("Error fetching monitoring data:", error);
            statusToast("Error", "Failed to load monitoring data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/groups`, {
                headers: getAuthHeaders(),
            });
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const statusToast = (title, description, status) => {
        toast({ title, description, status, duration: 3000, isClosable: true });
    };

    useEffect(() => {
        fetchData();
        fetchGroups();
    }, []);

    const handleOpenSync = (personnel) => {
        setSelectedSyncPersonnel(personnel);
        setSelectedSyncGroup("");
        onSyncModalOpen();
    };

    const confirmSyncToUsers = async () => {
        if (!selectedSyncPersonnel) return;
        setLoadingSync(true);
        try {
            await axios.post(`${API_URL}/api/sync-to-users`, {
                personnelId: selectedSyncPersonnel.personnel_id,
                personnelName: selectedSyncPersonnel.fullname,
                groupId: selectedSyncGroup || null,
            }, {
                headers: getAuthHeaders(),
            });
            statusToast("Success", "User promoted successfully.", "success");
            onSyncModalClose();
            fetchData();
        } catch (error) {
            statusToast("Error", error.response?.data?.message || "Failed to sync user.", "error");
        } finally {
            setLoadingSync(false);
        }
    };

    const handleStepRedirect = (personnel) => {
        const step = parseInt(personnel.personnel_progress) || 0;
        if (step === 8) {
            // Redirect to User page with highlight parameter
            navigate(`/user?new_enroll_search=${encodeURIComponent(personnel.fullname)}`);
        } else {
            // Redirect to the NEXT step (e.g., Step 5 -> Step 6)
            navigate(`/progress/step${step + 1}`);
        }
    };

    return (
        <Container maxW="100%" py={8}>
            {/* Premium Header Section */}
            <VStack align="start" spacing={1} mb={8}>
                <Heading
                    size="xl"
                    fontWeight="800"
                    lineHeight="shorter"
                    bgGradient="linear(to-r, orange.400, red.500)"
                    bgClip="text"
                >
                    Personnel Onboarding
                </Heading>
                <Text color="gray.500" fontSize="lg" fontWeight="500">
                    Real-time monitoring of newly enrolled personnel pathway.
                </Text>
            </VStack>

            {/* Dashboard Stats Summary */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                <Stat bg="white" p={5} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
                    <StatLabel color="gray.500" fontWeight="bold">TOTAL PIPELINE</StatLabel>
                    <StatNumber fontSize="3xl" color="gray.700">{stats.total}</StatNumber>
                </Stat>
                <Stat bg="white" p={5} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
                    <StatLabel color="orange.500" fontWeight="bold">IN PROGRESS</StatLabel>
                    <StatNumber fontSize="3xl" color="orange.600">{stats.pending}</StatNumber>
                </Stat>
                <Stat bg="white" p={5} borderRadius="2xl" shadow="sm" border="1px" borderColor="gray.100">
                    <StatLabel color="green.500" fontWeight="bold">READY FOR SYNC</StatLabel>
                    <StatNumber fontSize="3xl" color="green.600">{stats.ready}</StatNumber>
                </Stat>
            </SimpleGrid>

            {loading ? (
                <Flex justify="center" py={20}>
                    <VStack spacing={4}>
                        <Spinner size="xl" thickness="4px" speed="0.65s" color="orange.500" />
                        <Text color="gray.500" fontWeight="medium">Loading pipeline data...</Text>
                    </VStack>
                </Flex>
            ) : (
                <Box bg="white" shadow="xl" borderRadius="2xl" overflow="hidden" border="1px" borderColor="gray.100">
                    <Table variant="simple">
                        <Thead bg="gray.50">
                            <Tr h="60px">
                                <Th color="gray.600" fontSize="xs">PERSONNEL DETAILS</Th>
                                <Th textAlign="center" color="gray.600" fontSize="xs">ENROLLMENT STATUS</Th>
                                <Th textAlign="center" color="gray.600" fontSize="xs">LDAP PROVISION</Th>
                                <Th textAlign="center" color="gray.600" fontSize="xs">SECURITY GROUP</Th>
                                <Th textAlign="center" color="gray.600" fontSize="xs">PORTAL SYNC</Th>
                                <Th textAlign="center" color="gray.600" fontSize="xs">FINAL STATUS</Th>
                                <Th textAlign="right" color="gray.600" fontSize="xs">ACTIONS</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            <AnimatePresence mode="popLayout">
                                {currentItems.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={7} textAlign="center" py={12}>
                                            <VStack spacing={2}>
                                                <Icon as={FiSearch} boxSize={8} color="gray.300" />
                                                <Text color="gray.400" fontWeight="medium">No personnel found in the current pipeline.</Text>
                                            </VStack>
                                        </Td>
                                    </Tr>
                                ) : (
                                    currentItems.map((p, idx) => {
                                        const isEnrolled = p.personnel_progress === "8";
                                        const hasUser = p.user_created;
                                        const hasGroup = p.groups && p.groups.length > 0;
                                        const isComplete = hasUser && hasGroup;

                                        return (
                                            <MotionTr
                                                key={p.personnel_id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                _hover={{ bg: "orange.50" }}
                                            >
                                                <Td borderBottom="1px" borderColor="gray.50">
                                                    <HStack spacing={4}>
                                                        <Box
                                                            w="40px" h="40px"
                                                            borderRadius="full"
                                                            bg="orange.100"
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                        >
                                                            <Icon as={FiUsers} color="orange.600" />
                                                        </Box>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="700" color="gray.700" fontSize="sm">{p.fullname}</Text>
                                                            <HStack fontSize="xs" color="gray.500" spacing={2}>
                                                                <Text>{p.section}</Text>
                                                                <Text>•</Text>
                                                                <Text fontWeight="600">{p.personnel_id}</Text>
                                                            </HStack>
                                                        </VStack>
                                                    </HStack>
                                                </Td>

                                                {/* STEP REDIRECTION CELL */}
                                                <Td textAlign="center" cursor="pointer" onClick={() => handleStepRedirect(p)}>
                                                    <Tooltip label={isEnrolled ? "Go to User Management" : `Navigate to Step ${Math.min(8, (parseInt(p.personnel_progress) || 0) + 1)}`} hasArrow>
                                                        <VStack spacing={1}>
                                                            {isEnrolled ? (
                                                                <Badge colorScheme="green" variant="solid" rounded="full" px={3} py={0.5} fontSize="xs">
                                                                    DONE (STEP 8)
                                                                </Badge>
                                                            ) : (
                                                                <Badge colorScheme="orange" variant="outline" rounded="full" px={3} py={0.5} fontSize="xs" display="flex" alignItems="center" gap={1}>
                                                                    STEP {p.personnel_progress || 0} <Icon as={FiArrowRight} />
                                                                </Badge>
                                                            )}
                                                            <Text fontSize="xx-small" color="gray.400" textTransform="uppercase" fontWeight="bold">Onboarding</Text>
                                                        </VStack>
                                                    </Tooltip>
                                                </Td>

                                                <Td textAlign="center">
                                                    <Icon
                                                        as={hasUser ? FiCheckCircle : FiCircle}
                                                        color={hasUser ? "green.500" : "gray.200"}
                                                        boxSize={5}
                                                    />
                                                    <Text fontSize="10px" color="gray.500" fontWeight="700" mt={1}>
                                                        {hasUser ? "VERIFIED" : "PENDING"}
                                                    </Text>
                                                </Td>

                                                <Td textAlign="center">
                                                    {hasGroup ? (
                                                        <Badge colorScheme="purple" variant="subtle" rounded="md" px={2} textTransform="none">
                                                            {p.groups[0]}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="ghost" color="gray.300">—</Badge>
                                                    )}
                                                </Td>

                                                <Td textAlign="center">
                                                    <HStack justify="center" spacing={1}>
                                                        <Icon
                                                            as={hasUser ? FiUserCheck : FiCircle}
                                                            color={hasUser ? "blue.500" : "gray.200"}
                                                            boxSize={4}
                                                        />
                                                        <Text fontSize="xs" fontWeight="bold" color={hasUser ? "blue.600" : "gray.400"}>
                                                            {hasUser ? "Synced" : "—"}
                                                        </Text>
                                                    </HStack>
                                                </Td>

                                                <Td textAlign="center">
                                                    <Badge
                                                        fontSize="10px"
                                                        variant={isComplete ? "solid" : "outline"}
                                                        colorScheme={isComplete ? "green" : "gray"}
                                                        rounded="full" px={3}
                                                    >
                                                        {isComplete ? "COMPLETED" : "PROCESSING"}
                                                    </Badge>
                                                </Td>

                                                <Td textAlign="right">
                                                    {!hasUser ? (
                                                        <Button
                                                            size="sm"
                                                            colorScheme="orange"
                                                            borderRadius="full"
                                                            leftIcon={<Icon as={FiRefreshCw} />}
                                                            onClick={(e) => { e.stopPropagation(); handleOpenSync(p); }}
                                                            isDisabled={!isEnrolled}
                                                            px={4}
                                                            _hover={{ shadow: "md", transform: "translateY(-1px)" }}
                                                        >
                                                            Sync User
                                                        </Button>
                                                    ) : (
                                                        <Tooltip label="User profile is now active">
                                                            <Icon as={FiCheckCircle} color="green.500" boxSize={6} />
                                                        </Tooltip>
                                                    )}
                                                </Td>
                                            </MotionTr>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </Tbody>
                    </Table>

                    {/* Enhanced Pagination */}
                    {personnels.length > 0 && (
                        <Flex bg="gray.50" p={4} justify="center" align="center" borderTop="1px" borderColor="gray.100" gap={6}>
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                isDisabled={currentPage === 1}
                                variant="outline" size="sm" colorScheme="gray"
                                leftIcon={<Icon as={props => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>} />}
                            >
                                Previous
                            </Button>
                            <HStack spacing={2} px={4}>
                                <Text fontSize="sm" fontWeight="800" color="gray.700">Page {currentPage}</Text>
                                <Text fontSize="sm" color="gray.400">/</Text>
                                <Text fontSize="sm" color="gray.500">{totalPages}</Text>
                            </HStack>
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                isDisabled={currentPage === totalPages}
                                variant="outline" size="sm" colorScheme="gray"
                                rightIcon={<Icon as={props => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>} />}
                            >
                                Next
                            </Button>
                        </Flex>
                    )}
                </Box>
            )}

            {/* Sync Modal Overhaul */}
            <Modal isOpen={isSyncModalOpen} onClose={onSyncModalClose} isCentered motionPreset="slideInBottom">
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
                <ModalContent borderRadius="2xl" p={2}>
                    <ModalHeader pb={0}>
                        <VStack align="start" spacing={1}>
                            <Heading size="md" color="gray.800">Promote to User</Heading>
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                                Syncing {selectedSyncPersonnel?.fullname}
                            </Text>
                        </VStack>
                    </ModalHeader>
                    <ModalCloseButton mt={4} />
                    <ModalBody py={6}>
                        <VStack spacing={6} align="stretch">
                            <Box bg="orange.50" p={4} borderRadius="xl" border="1px dashed" borderColor="orange.200">
                                <HStack spacing={3}>
                                    <Icon as={FiAlertCircle} color="orange.500" />
                                    <Text fontSize="xs" color="orange.700" fontWeight="600">
                                        This will create an LDAP credential and link this personnel to the user portal.
                                    </Text>
                                </HStack>
                            </Box>
                            <FormControl isRequired>
                                <FormLabel fontWeight="bold" fontSize="sm">Select Initial Group</FormLabel>
                                <Select
                                    placeholder="Click to assign group"
                                    variant="filled"
                                    h="50px"
                                    borderRadius="xl"
                                    value={selectedSyncGroup}
                                    onChange={(e) => setSelectedSyncGroup(e.target.value)}
                                >
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg="gray.50" borderRadius="xl">
                        <Button variant="ghost" onClick={onSyncModalClose} fontWeight="bold">Cancel</Button>
                        <Button
                            colorScheme="orange"
                            borderRadius="xl"
                            h="45px" px={8}
                            onClick={confirmSyncToUsers}
                            isLoading={loadingSync}
                        >
                            Complete Sync
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default UsersProgress;
