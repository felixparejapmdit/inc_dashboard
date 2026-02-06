import React, { useEffect, useState, useMemo } from "react";
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
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    Divider,
} from "@chakra-ui/react";
import { Search, History, Calendar, User, Clock, CheckCircle, XCircle } from "lucide-react";
import moment from "moment";
import { fetchData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL || "";

const PersonnelHistory = () => {
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPersonnel, setSelectedPersonnel] = useState(null);

    const bgColor = useColorModeValue("white", "gray.800");
    const cardBg = useColorModeValue("white", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const headingColor = useColorModeValue("teal.600", "teal.300");

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            try {
                await fetchData(
                    "personnels/history",
                    setHistory,
                    null,
                    "Failed to load personnel history."
                );
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    // Group history by personnel
    const groupedPersonnel = useMemo(() => {
        const grouped = history.reduce((acc, item) => {
            if (!acc[item.personnel_id]) {
                acc[item.personnel_id] = {
                    id: item.personnel_id,
                    fullname: item.fullname,
                    currentStatus: item.action, // Assuming latest action defines status roughly
                    lastUpdated: item.timestamp,
                    events: [],
                };
            }

            acc[item.personnel_id].events.push(item);

            // Ensure we keep track of the absolute latest timestamp for sorting
            if (new Date(item.timestamp) > new Date(acc[item.personnel_id].lastUpdated)) {
                acc[item.personnel_id].lastUpdated = item.timestamp;
                acc[item.personnel_id].currentStatus = item.action;
            }

            return acc;
        }, {});

        // Sort events inside each personnel by desc date
        Object.values(grouped).forEach(p => {
            p.events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });

        // Return array sorted by most recent global activity
        return Object.values(grouped).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    }, [history]);

    const filteredPersonnel = groupedPersonnel.filter((person) => {
        const term = search.toLowerCase();
        return (
            person.fullname.toLowerCase().includes(term) ||
            person.events.some(e => e.reason && e.reason.toLowerCase().includes(term))
        );
    });

    const handleCardClick = (person) => {
        setSelectedPersonnel(person);
        onOpen();
    };

    return (
        <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
            <VStack align="stretch" spacing={8}>
                {/* Header Section */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    gap={6}
                >
                    <HStack spacing={4}>
                        <Box p={3} bg="teal.50" borderRadius="xl">
                            <Icon as={History} w={8} h={8} color="teal.500" />
                        </Box>
                        <Box>
                            <Heading size="lg" color={headingColor} letterSpacing="tight">
                                Personnel History
                            </Heading>
                            <Text color="gray.500" fontSize="md">
                                Monitor and track personnel logs and status changes
                            </Text>
                        </Box>
                    </HStack>

                    <InputGroup maxW="400px" size="lg">
                        <InputLeftElement pointerEvents="none">
                            <Icon as={Search} color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search personnel or events..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            borderRadius="full"
                            bg={bgColor}
                            border="1px solid"
                            borderColor={borderColor}
                            _focus={{ borderColor: "teal.400", boxShadow: "md" }}
                        />
                    </InputGroup>
                </Flex>

                {/* Content Grid */}
                {loading ? (
                    <Text>Loading...</Text>
                ) : filteredPersonnel.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" h="400px" bg={bgColor} borderRadius="xl" border="1px dashed" borderColor="gray.300">
                        <Icon as={User} w={12} h={12} color="gray.300" mb={4} />
                        <Text color="gray.500" fontSize="lg">No history records found.</Text>
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                        {filteredPersonnel.map((person) => (
                            <Box
                                key={person.id}
                                bg={cardBg}
                                p={6}
                                borderRadius="xl"
                                boxShadow="sm"
                                border="1px solid"
                                borderColor="transparent"
                                cursor="pointer"
                                position="relative"
                                transition="all 0.3s ease"
                                _hover={{
                                    transform: "translateY(-4px)",
                                    boxShadow: "lg",
                                    borderColor: "teal.200",
                                }}
                                onClick={() => handleCardClick(person)}
                            >
                                <Flex align="center" gap={4} mb={4}>
                                    <Avatar
                                        size="md"
                                        name={person.fullname}
                                        src={`${API_URL}/api/personnel_images/2x2/${person.id}`} // Assuming generic avatar endpoint logic
                                        border="2px solid white"
                                        boxShadow="md"
                                    />
                                    <Box>
                                        <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                                            {person.fullname}
                                        </Text>
                                        <Badge
                                            colorScheme={person.currentStatus === "In" ? "green" : "red"}
                                            variant="subtle"
                                            px={2}
                                            borderRadius="full"
                                            fontSize="xs"
                                        >
                                            {person.currentStatus === "In" ? "Active / Restored" : "Removed / Out"}
                                        </Badge>
                                    </Box>
                                </Flex>

                                <Divider mb={4} />

                                <VStack align="stretch" spacing={2} overflow="hidden">
                                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Latest Activity</Text>
                                    <Flex align="center" gap={2}>
                                        <Icon as={Calendar} size={14} color="gray.400" />
                                        <Text fontSize="sm" color="gray.600">
                                            {moment(person.lastUpdated).format("MMM DD, YYYY")}
                                        </Text>
                                    </Flex>
                                    <Flex align="center" gap={2}>
                                        <Icon as={Clock} size={14} color="gray.400" />
                                        <Text fontSize="sm" color="gray.600">
                                            {moment(person.lastUpdated).format("h:mm A")}
                                        </Text>
                                    </Flex>
                                    <Text fontSize="xs" color="teal.500" mt={2} fontWeight="medium">
                                        {person.events.length} History Logs
                                    </Text>
                                </VStack>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </VStack>

            {/* History Detail Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
                <ModalContent borderRadius="xl" maxH="80vh">
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100" py={4}>
                        <Flex align="center" gap={4}>
                            <Avatar size="md" name={selectedPersonnel?.fullname} src={`${API_URL}/api/personnel_images/2x2/${selectedPersonnel?.id}`} />
                            <Box>
                                <Heading size="md">{selectedPersonnel?.fullname}</Heading>
                                <Text fontSize="sm" color="gray.500">History Log</Text>
                            </Box>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody p={0} bg="gray.50">
                        <VStack align="stretch" spacing={0}>
                            {selectedPersonnel?.events.map((event, index) => (
                                <Flex
                                    key={index}
                                    p={6}
                                    bg="white"
                                    borderBottom="1px solid"
                                    borderColor="gray.100"
                                    position="relative"
                                    _last={{ borderBottom: "none" }}
                                    gap={4}
                                >
                                    {/* Timestamp Column */}
                                    <Box minW="80px" textAlign="right">
                                        <Text fontWeight="bold" fontSize="sm" color="gray.700">
                                            {moment(event.timestamp).format("MMM DD")}
                                        </Text>
                                        <Text fontSize="xs" color="gray.400">
                                            {moment(event.timestamp).format("h:mm A")}
                                        </Text>
                                        <Text fontSize="xs" color="gray.300" mt={1}>
                                            {moment(event.timestamp).format("YYYY")}
                                        </Text>
                                    </Box>

                                    {/* Timeline Line (Visual) */}
                                    <Box position="relative" display="flex" flexDirection="column" alignItems="center">
                                        <Box
                                            w="2px"
                                            h="100%"
                                            bg="gray.200"
                                            position="absolute"
                                            top="0"
                                            bottom="0"
                                            zIndex={0}
                                            display={index === selectedPersonnel.events.length - 1 ? 'none' : 'block'}
                                        />
                                        <Box zIndex={1} bg="white" borderRadius="full">
                                            <Icon
                                                as={event.action === "In" ? CheckCircle : XCircle}
                                                color={event.action === "In" ? "green.500" : "red.500"}
                                                size={20}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Content Column */}
                                    <Box flex={1}>
                                        <Flex justify="space-between" align="center" mb={1}>
                                            <Badge colorScheme={event.action === "In" ? "green" : "red"}>
                                                {event.action === "In" ? "Restored" : "Deleted"}
                                            </Badge>
                                            <Text fontSize="xs" color="gray.400">By: {event.performed_by || "System"}</Text>
                                        </Flex>

                                        <Text color="gray.700" fontSize="sm" fontWeight="medium">
                                            {event.reason || "No reason provided."}
                                        </Text>
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default PersonnelHistory;
