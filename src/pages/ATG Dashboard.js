// src/pages/ATG Dashboard.js
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Grid,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Center,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Avatar,
  Select,
  useToast,
  Stack,
  Badge,
  VStack,
  HStack,
  IconButton,
  Icon,
  Image,
  Skeleton,
  useColorModeValue,
  Tooltip,
  useDisclosure,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from "@chakra-ui/react";
import {
  SearchIcon,
  AddIcon,
  DownloadIcon,
  DeleteIcon,
  AttachmentIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@chakra-ui/icons";
import {
  FaUserTie,
  FaBuilding,
  FaFilePdf,
  FaFileExcel,
  FaFileWord,
  FaFileImage,
  FaFileAlt
} from "react-icons/fa";
import { getAuthHeaders } from "../utils/apiHeaders";
import ATGNewsSidebar from "./ATGNewsSidebar";

const API_URL = process.env.REACT_APP_API_URL;

/* ---------- Helper Components ---------- */

const FileIcon = ({ type }) => {
  if (!type) return <Icon as={FaFileAlt} color="gray.400" />;
  const t = type.toLowerCase();
  if (t.includes('pdf')) return <Icon as={FaFilePdf} color="red.500" />;
  if (t.includes('excel') || t.includes('sheet') || t.includes('xls')) return <Icon as={FaFileExcel} color="green.500" />;
  if (t.includes('word') || t.includes('doc')) return <Icon as={FaFileWord} color="blue.500" />;
  if (t.includes('image') || t.includes('png') || t.includes('jpg')) return <Icon as={FaFileImage} color="purple.500" />;
  return <Icon as={FaFileAlt} color="gray.500" />;
};

const DashboardCard = ({ title, icon, onClick, ...props }) => {
  return (
    <Card
      bg="white"
      shadow="sm"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      p={{ base: 6, md: 10 }}
      cursor="pointer"
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-8px)",
        shadow: "2xl",
        borderColor: "blue.300",
        bg: "blue.50"
      }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      onClick={onClick}
      role="group"
      {...props}
    >
      <Flex
        p={6}
        bg="blue.50"
        borderRadius="2xl"
        color="blue.600"
        mb={6}
        transition="all 0.3s"
        _groupHover={{ bg: "blue.600", color: "white" }}
      >
        {React.cloneElement(icon, { boxSize: 10 })}
      </Flex>
      <Heading size="md" color="gray.700" textAlign="center" fontWeight="800" textTransform="uppercase" letterSpacing="wider">
        {title}
      </Heading>
      <Text mt={2} fontSize="sm" color="gray.400" fontWeight="600" textTransform="uppercase">
        Click to View
      </Text>
    </Card>
  );
};

const DashboardModal = ({ isOpen, onClose, title, children, size = "4xl" }) => (
  <Modal isOpen={isOpen} onClose={onClose} size={size} isCentered scrollBehavior="inside">
    <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
    <ModalContent borderRadius="3xl" shadow="2xl" overflow="hidden" maxH="90vh">
      <ModalHeader borderBottom="1px solid" borderColor="gray.100" bgGradient="linear(to-r, blue.50, white)" py={6}>
        <HStack spacing={4}>
          <Heading size="md" color="blue.800" textTransform="uppercase" letterSpacing="widest">{title}</Heading>
        </HStack>
        <ModalCloseButton mt={2} borderRadius="full" />
      </ModalHeader>
      <ModalBody p={0}>
        {children}
      </ModalBody>
      <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" py={4}>
        <Button colorScheme="blue" onClick={onClose} borderRadius="xl" px={8}>Close</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

const gampaninLookup = [
  { value: "1", name: "Sugo" },
  { value: "2", name: "Sugo 1" },
  { value: "3", name: "Sugo 2" },
  { value: "4", name: "Reserba" },
  { value: "5", name: "Reserba 1" },
  { value: "6", name: "Reserba 2" },
  { value: "7", name: "Sugo SL" },
  { value: "8", name: "Reserba SL" },
  { value: "9", name: "Kasama sa Tribuna" },
];

const getGampaninName = (id) => gampaninLookup.find(g => String(g.value) === String(id))?.name || id;

/* ---------- Main Component ---------- */

export default function ATGDashboard() {
  const toast = useToast();
  const bg = useColorModeValue("gray.50", "gray.900");

  // Modal Disclosures
  const orgModal = useDisclosure();
  const suguanModal = useDisclosure();
  const directoryModal = useDisclosure();
  const filesModal = useDisclosure();

  // Data States
  const [directory, setDirectory] = useState([]);
  const [suguan, setSuguan] = useState([]);
  const [files, setFiles] = useState([]);
  const [news, setNews] = useState([]);
  const [orgChart, setOrgChart] = useState(null);

  // Celebration State
  const [celebrants, setCelebrants] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Loading States
  const [loadingDir, setLoadingDir] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Filters & Pagination
  const [phoneSearch, setPhoneSearch] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("All");
  const [fileCategory, setFileCategory] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  /* ---------- API Functions ---------- */

  const fetchDirectory = async () => {
    setLoadingDir(true);
    try {
      const res = await fetch(`${API_URL}/api/phone-directory`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setDirectory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load directory", err);
    } finally {
      setLoadingDir(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/news`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load news", err);
    }
  };

  const fetchSuguan = async () => {
    try {
      const res = await fetch(`${API_URL}/api/suguan`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSuguan(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load suguan", err);
    }
  };

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`${API_URL}/api/atg-files`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        const fileList = Array.isArray(data) ? data : [];
        setFiles(fileList);

        // Extract Org Chart
        const chart = fileList.find(f => f.category === 'OrgChart');
        if (chart) setOrgChart(chart);
      }
    } catch (err) {
      console.error("Failed to load files", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handlePostNews = async () => {
    const title = prompt("Enter News Title:");
    if (!title) return;
    const excerpt = prompt("Enter short excerpt/summary:");
    const category = prompt("Category (Local/Foreign):", "Local");

    try {
      const res = await fetch(`${API_URL}/api/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")} `
        },
        body: JSON.stringify({ title, excerpt, category })
      });
      if (res.ok) {
        toast({ title: "News Posted", status: "success" });
        fetchNews();
      }
    } catch (err) {
      toast({ title: "Failed to post", status: "error" });
    }
  };

  const handleFileUpload = async (event, category = "General") => {
    const file = event.target.files[0];
    if (!file) return;

    // Reset input value to allow re-uploading same file if needed in future,
    // though hard with the current hidden input structure unless we Ref it.

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("uploaded_by", localStorage.getItem("username") || "User");

    try {
      toast({ title: "Uploading...", status: "info", duration: 1000 });

      const res = await fetch(`${API_URL}/api/atg-files`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")} `
          // Explicitly NO Content-Type header to let browser set boundary
        },
        body: formData
      });

      if (res.ok) {
        toast({ title: "Upload successful!", status: "success" });
        fetchFiles();
      } else {
        const errorText = await res.text();
        console.error("Upload failed details:", errorText);
        throw new Error(errorText || "Upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      toast({ title: "Upload Error", description: "Check console for details", status: "error" });
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const res = await fetch(`${API_URL}/api/atg-files/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        toast({ title: "Deleted", status: "success" });
        fetchFiles();
      }
    } catch (err) {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  useEffect(() => {
    fetchDirectory();
    fetchSuguan();
    fetchFiles();
    fetchNews();
  }, []);

  /* ---------- Render Helpers ---------- */

  // Filter Phone Directory
  const filteredDirectory = useMemo(() => {
    const q = phoneSearch.toLowerCase();
    return directory.filter(d =>
      ((d.name && d.name.toLowerCase().includes(q)) ||
        (d.location && d.location.toLowerCase().includes(q)) ||
        (d.phone_name && d.phone_name.toLowerCase().includes(q))) &&
      (phoneFilter === 'All' || d.location === phoneFilter)
    );
  }, [directory, phoneSearch, phoneFilter]);

  // Reset page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [phoneSearch, phoneFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredDirectory.length / itemsPerPage);
  const paginatedDirectory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDirectory.slice(start, start + itemsPerPage);
  }, [filteredDirectory, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Extract Unique Locations for Filter
  const uniqueLocations = useMemo(() => {
    const locs = directory.map(d => d.location).filter(Boolean);
    return [...new Set(locs)].sort();
  }, [directory]);

  // Filter Suguan (Current Week Only)
  const currentWeekSuguan = useMemo(() => {
    const now = new Date();
    // Calculate start of week (Monday) and end of week (Sunday)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return suguan.filter(s => {
      const sDate = new Date(s.date);
      return sDate >= monday && sDate <= sunday;
    });
  }, [suguan]);

  const visibleFiles = useMemo(() => {
    return files.filter(f => f.category !== 'OrgChart' && (fileCategory === 'All' || f.category === fileCategory));
  }, [files, fileCategory]);




  return (
    <Box minH="100vh" bg={bg} p={{ base: 4, md: 6, lg: 8 }}>
      <Stack spacing={6} maxW="100%" mx="auto">

        {/* Compact Premium Header */}
        <Center
          py={6}
          bg="white"
          borderRadius="2xl"
          shadow="sm"
          border="1px solid"
          borderColor="gray.100"
          bgGradient="linear(to-b, white, blue.50)"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-10px"
            right="-10px"
            bg="blue.500"
            opacity={0.05}
            w="150px"
            h="150px"
            borderRadius="full"
          />
          <VStack spacing={1}>
            <Heading
              size="xl"
              fontWeight="900"
              color="blue.900"
              letterSpacing="tight"
              textTransform="uppercase"
            >
              ATG Dashboard
            </Heading>
            <Box
              h="3px"
              w="60px"
              bg="blue.500"
              borderRadius="full"
            />
          </VStack>
        </Center>



        {/* Main Layout Grid - Optimized for Responsiveness */}
        <Grid templateColumns={{ base: "1fr", xl: "3fr 1fr" }} gap={8} alignItems="start">

          {/* LEFT COLUMN - Minimal 2x2 Interactive Grid */}
          <Box w="full">
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>

              {/* Box 1: Organizational Chart */}
              <DashboardCard
                title="Organizational Chart"
                icon={<Icon as={FaBuilding} />}
                onClick={orgModal.onOpen}
              />

              {/* Box 2: Suguan */}
              <DashboardCard
                title="Suguan Schedule"
                icon={<CalendarIcon />}
                onClick={suguanModal.onOpen}
              />

              {/* Box 3: Phone Directory */}
              <DashboardCard
                title="Phone Directory"
                icon={<Icon as={FaUserTie} />}
                onClick={directoryModal.onOpen}
              />

              {/* Box 4: ATG Files & Docs */}
              <DashboardCard
                title="Files & Documents"
                icon={<Icon as={AttachmentIcon} />}
                onClick={filesModal.onOpen}
              />
            </Grid>

            {/* --- Modals for Each Box --- */}

            {/* 1. Organizational Chart Modal */}
            <DashboardModal
              isOpen={orgModal.isOpen}
              onClose={orgModal.onClose}
              title="Organizational Chart"
            >
              <Box p={6}>
                <Flex justify="space-between" align="center" mb={4} bg="blue.50" p={4} borderRadius="xl">
                  <Text fontWeight="600" color="blue.700">Manage Company Structure Diagram</Text>
                  <Button as="label" size="sm" colorScheme="blue" leftIcon={<AttachmentIcon />} cursor="pointer">
                    Update Image
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'OrgChart')} />
                  </Button>
                </Flex>
                <Flex align="center" justify="center" minH="500px" bg="gray.100" borderRadius="2xl" overflow="hidden" border="1px solid" borderColor="gray.200">
                  {orgChart ? (
                    <Image
                      src={`${API_URL}${orgChart.file_path}`}
                      alt="Org Chart"
                      maxH="100%"
                      maxW="100%"
                      objectFit="contain"
                    />
                  ) : (
                    <VStack spacing={4}>
                      <Icon as={FaBuilding} boxSize={12} color="gray.300" />
                      <Text color="gray.400">No Organizational Chart has been uploaded yet.</Text>
                    </VStack>
                  )}
                </Flex>
              </Box>
            </DashboardModal>

            {/* 2. Suguan Modal */}
            <DashboardModal
              isOpen={suguanModal.isOpen}
              onClose={suguanModal.onClose}
              title="Suguan (This Week's Schedule)"
            >
              <Box>
                <Table variant="simple" size="md">
                  <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th>Time</Th>
                      <Th>Name</Th>
                      <Th>Lokal</Th>
                      <Th>Gampanin</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {currentWeekSuguan.length === 0 ? (
                      <Tr><Td colSpan={4} textAlign="center" py={12} color="gray.500">No schedules recorded for this week.</Td></Tr>
                    ) : (
                      currentWeekSuguan.map((s, i) => (
                        <Tr key={i} _hover={{ bg: "blue.50" }}>
                          <Td fontWeight="bold" color="blue.600">{s.time}</Td>
                          <Td fontWeight="600">{s.name}</Td>
                          <Td>{s.local_congregation}</Td>
                          <Td><Badge colorScheme="blue" variant="subtle" px={2} borderRadius="md">{getGampaninName(s.gampanin_id)}</Badge></Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </DashboardModal>

            {/* 3. Phone Directory Modal */}
            <DashboardModal
              isOpen={directoryModal.isOpen}
              onClose={directoryModal.onClose}
              title="Phone Directory"
              size="6xl"
            >
              <Box>
                <Flex p={4} gap={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                  <InputGroup maxW="400px">
                    <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
                    <Input
                      placeholder="Search by name or number..."
                      bg="white"
                      value={phoneSearch}
                      onChange={(e) => setPhoneSearch(e.target.value)}
                    />
                  </InputGroup>
                  <Select
                    maxW="200px"
                    bg="white"
                    placeholder="All Locations"
                    value={phoneFilter}
                    onChange={(e) => setPhoneFilter(e.target.value)}
                  >
                    {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </Select>
                </Flex>
                <Box maxH="600px" overflowY="auto">
                  <Table variant="simple">
                    <Thead bg="gray.50" position="sticky" top={0} zIndex={5}>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Location</Th>
                        <Th textAlign="right">Ext / Dect</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loadingDir ? (
                        <Tr><Td colSpan={4} textAlign="center" py={10}><Skeleton height="20px" /></Td></Tr>
                      ) : paginatedDirectory.length === 0 ? (
                        <Tr><Td colSpan={4} textAlign="center" py={10}>No contacts found.</Td></Tr>
                      ) : (
                        paginatedDirectory.map((d, i) => (
                          <Tr key={i} _hover={{ bg: "blue.50" }}>
                            <Td>
                              <HStack spacing={3}>
                                <Avatar name={d.name} size="sm" />
                                <Text fontWeight="600">{d.name}</Text>
                              </HStack>
                            </Td>
                            <Td>{d.location}</Td>
                            <Td textAlign="right">
                              <HStack justify="flex-end">
                                {d.extension && <Text fontSize="sm" fontWeight="bold">Loc {d.extension}</Text>}
                                {d.dect_number && <Badge colorScheme="purple">{d.dect_number}</Badge>}
                              </HStack>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </Box>
                {/* Pagination */}
                <Flex justify="space-between" align="center" px={6} py={4} bg="gray.50">
                  <Text fontSize="sm" color="gray.500">Page {currentPage} of {totalPages}</Text>
                  <HStack spacing={2}>
                    <Button size="sm" onClick={() => handlePageChange(currentPage - 1)} isDisabled={currentPage === 1}>Previous</Button>
                    <Button size="sm" onClick={() => handlePageChange(currentPage + 1)} isDisabled={currentPage === totalPages}>Next</Button>
                  </HStack>
                </Flex>
              </Box>
            </DashboardModal>

            {/* 4. ATG Files Modal */}
            <DashboardModal
              isOpen={filesModal.isOpen}
              onClose={filesModal.onClose}
              title="Files & Documents"
            >
              <Box>
                <Flex p={4} gap={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.100" justify="space-between">
                  <Select size="sm" maxW="200px" bg="white" value={fileCategory} onChange={(e) => setFileCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Report">Reports</option>
                    <option value="Memo">Memos</option>
                    <option value="General">General</option>
                  </Select>
                  <Button as="label" size="sm" colorScheme="blue" leftIcon={<AddIcon />} cursor="pointer">
                    Upload New File
                    <input type="file" hidden onChange={(e) => handleFileUpload(e, fileCategory !== 'All' ? fileCategory : 'General')} />
                  </Button>
                </Flex>
                <VStack align="stretch" spacing={0} maxH="600px" overflowY="auto">
                  {loadingFiles ? (
                    <Text p={8} textAlign="center">Loading...</Text>
                  ) : visibleFiles.length === 0 ? (
                    <Text p={8} textAlign="center">No files found.</Text>
                  ) : (
                    visibleFiles.map(file => (
                      <Flex key={file.id} p={4} borderBottom="1px solid" borderColor="gray.100" align="center" justify="space-between" _hover={{ bg: "gray.50" }}>
                        <HStack spacing={4}>
                          <Box p={2} bg="blue.50" borderRadius="md"><FileIcon type={file.file_type} /></Box>
                          <Box>
                            <Text fontWeight="600" fontSize="sm">{file.filename}</Text>
                            <HStack spacing={4}>
                              <Badge size="xs" colorScheme="gray">{file.category}</Badge>
                              <Text fontSize="xs" color="gray.400">{new Date(file.createdAt).toLocaleDateString()}</Text>
                            </HStack>
                          </Box>
                        </HStack>
                        <HStack>
                          <IconButton icon={<DownloadIcon />} size="sm" variant="ghost" colorScheme="blue" onClick={() => window.open(`${API_URL}${file.file_path}`, '_blank')} />
                          <IconButton icon={<DeleteIcon />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDeleteFile(file.id)} />
                        </HStack>
                      </Flex>
                    ))
                  )}
                </VStack>
              </Box>
            </DashboardModal>
          </Box>

          {/* RIGHT COLUMN - News Sidebar (Sticky on Desktop, Stacked on Mobile) */}
          <Box
            position={{ base: "relative", xl: "sticky" }}
            top={{ base: "0", xl: "6" }}
            h={{ base: "700px", xl: "calc(100vh - 120px)" }}
            mt={{ base: 4, xl: 0 }}
          >
            <ATGNewsSidebar />
          </Box>
        </Grid>

      </Stack>
    </Box>
  );
}
