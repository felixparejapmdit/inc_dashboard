import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  VStack,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Input,
  FormLabel,
  Checkbox,
  Flex,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  Image,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Icon,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  SearchIcon,
  CalendarIcon,
  TimeIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import {
  FiPrinter,
  FiMapPin,
  FiUser,
  FiPhone,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiWifi,
  FiZap,
} from "react-icons/fi";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import PrintableLokalProfile from "./PrintableLokalProfile";

const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL = process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;

const MotionCard = motion.create(Card);
const LokalProfile = () => {

  // --- State ---
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  // --- Printing ---
  const [profileToPrint, setProfileToPrint] = useState(null);
  const printRef = useRef(null);

  // --- Image Zoom State ---
  const [selectedImage, setSelectedImage] = useState(null);
  const { isOpen: isImageOpen, onOpen: onImageOpen, onClose: onImageClose } = useDisclosure();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      console.log("Print completed");
      setProfileToPrint(null);
    },
  });

  useEffect(() => {
    if (profileToPrint && printRef.current) {
      console.log("Profile to print set:", profileToPrint);
      console.log("Print ref:", printRef.current);
      setTimeout(() => {
        console.log("Triggering print...");
        handlePrint();
      }, 300);
    }
  }, [profileToPrint]);

  // Dropdown Data
  const [districts, setDistricts] = useState([]);
  const [localCongregations, setLocalCongregations] = useState([]);

  // Form Data
  const initialFormState = {
    district: "",
    lokal: "",
    lokalInput: "",
    isManualLokal: false,
    anniversary: "",
    serialNumber: "",
    destinado: "",
    destinadoContact: "",
    districtChronicler: "",
    chroniclerContact: "",
    districtMinister: "",
    ministerContact: "",
    seatingCapacity: "",
    distanceFromCentral: "",
    travelTimeFromCentral: "",
    internetSpeed: "",
    ledWall: false,
    generator: false,
    preparedBy: "",
    signature: "",
    datePrepared: new Date().toISOString().substr(0, 10),
    imageUrl: "",
    imageFile: null,
    scheduleMidweek: { Tuesday: "", Wednesday: "", Thursday: "" },
    scheduleWeekend: { Friday: "", Saturday: "", Sunday: "" },
  };
  const [formData, setFormData] = useState(initialFormState);



  // --- Hooks and Styles ---
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const bgColor = useColorModeValue("gray.50", "gray.900");

  // --- Effects ---


  useEffect(() => {
    fetchProfiles();
    fetchDropdowns();
  }, []);

  // --- Fetch Data ---
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lokal_profiles`);
      setProfiles(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not fetch profiles.",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    // Fetch Districts
    try {
      console.log("Fetching districts from:", `${DISTRICT_API_URL}/api/districts`);
      const districtRes = await axios.get(`${DISTRICT_API_URL}/api/districts`);
      console.log("Districts Response:", districtRes.data);

      const districtsData = Array.isArray(districtRes.data)
        ? districtRes.data
        : (districtRes.data?.data || []);
      setDistricts(districtsData);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast({
        title: "District Failure",
        description: "Could not load Districts. Check console.",
        status: "warning",
        isClosable: true
      });
    }

    // Fetch Lokals
    try {
      console.log("Fetching lokals from:", `${LOCAL_CONGREGATION_API_URL}/api/all-congregations`);
      const lokalRes = await axios.get(`${LOCAL_CONGREGATION_API_URL}/api/all-congregations`);
      console.log("Lokals Response:", lokalRes.data);

      const lokalsData = Array.isArray(lokalRes.data)
        ? lokalRes.data
        : (lokalRes.data?.data || []);
      setLocalCongregations(lokalsData);
    } catch (error) {
      console.error("Error fetching lokals:", error);
      // Don't show generic error if it's just this one failing, user can still proceed with District selecting if needed
      console.warn("Lokal API endpoint might be incorrect or down.");
    }
  };

  // --- Form Handling ---
  const openModal = (profile = null) => {
    setEditProfile(profile);
    if (profile) {
      console.log("Editing Profile:", profile);

      // Determine if the saved lokal corresponds to an existing ID in the loaded content
      // We check if value matches loosely (string vs int)
      const isOfficialLokal = localCongregations && localCongregations.some(l => l.id == profile.lokal);

      // It is manual if there IS a lokal value, but it's NOT in the official list
      const isManual = !!profile.lokal && !isOfficialLokal;

      const formattedAnniversary = profile.anniversary
        ? new Date(profile.anniversary).toISOString().split('T')[0]
        : "";

      console.log("Date Conversion:", profile.anniversary, "->", formattedAnniversary);

      setFormData({
        ...initialFormState,
        ...profile,
        anniversary: formattedAnniversary,
        isEnabled: undefined, // Cleanup if pollution exists
        isManualLokal: isManual,
        lokalInput: isManual ? profile.lokal : "",
        lokal: profile.lokal, // Ensure this is set regardless

        // Ensure nested objects are handled if null
        scheduleMidweek: profile.scheduleMidweek || initialFormState.scheduleMidweek,
        scheduleWeekend: profile.scheduleWeekend || initialFormState.scheduleWeekend,
      });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProfile(null);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };

      // Handle Manual Lokal Input
      if (payload.isManualLokal) {
        payload.lokal = payload.lokalInput; // Send the manual text as the 'lokal' value
      }

      // Basic validation
      if (!payload.district || (!payload.lokal && !payload.isManualLokal)) {
        toast({ title: "Validation Error", description: "District and Lokal are required.", status: "warning" });
        return;
      }

      let requestData = payload;
      let headers = { "Content-Type": "application/json" };

      // Check if we need to upload a file (Multipart)
      if (payload.imageFile) {
        const formDataObj = new FormData();
        formDataObj.append("image", payload.imageFile);

        Object.keys(payload).forEach((key) => {
          if (key === "imageFile" || key === "imageUrl") return; // Skip image fields in text part

          const value = payload[key];
          if (typeof value === "object" && value !== null) {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, value);
          }
        });

        requestData = formDataObj;
        headers = { "Content-Type": "multipart/form-data" };
      }

      if (editProfile) {
        await axios.put(`${API_URL}/api/lokal_profiles/${editProfile.id}`, requestData, { headers });
        toast({ title: "Updated successfully", status: "success" });
      } else {
        await axios.post(`${API_URL}/api/lokal_profiles`, requestData, { headers });
        toast({ title: "Created successfully", status: "success" });
      }
      fetchProfiles();
      closeModal();
    } catch (err) {
      console.error(err);
      toast({
        title: "Save Failed",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        status: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    try {
      await axios.delete(`${API_URL}/api/lokal_profiles/${id}`);
      fetchProfiles();
      toast({ title: "Deleted successfully", status: "info" });
    } catch (err) {
      toast({ title: "Error deleting profile", status: "error" });
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imageUrl: reader.result, // Keep for preview
        imageFile: file          // Store file for upload
      }));
    };
    reader.readAsDataURL(file);
  };

  // --- Filtering ---
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const lowerQuery = searchQuery.toLowerCase();

    return profiles.filter((p) => {
      const distName = districts.find(d => d.id == p.district)?.name.toLowerCase() || "";
      // Handle ID lookup or raw string for Lokal
      const lokalName = (localCongregations.find(l => l.id == p.lokal)?.name || p.lokal || "").toString().toLowerCase();
      const serial = p.serialNumber ? p.serialNumber.toLowerCase() : "";

      return distName.includes(lowerQuery) || lokalName.includes(lowerQuery) || serial.includes(lowerQuery);
    });
  }, [profiles, districts, localCongregations, searchQuery]);

  // --- Components ---

  const ProfileCard = ({ profile }) => {
    const distName = districts.find(d => d.id == profile.district)?.name;
    const lokalName = localCongregations.find(l => l.id == profile.lokal)?.name || profile.lokal;

    return (
      <MotionCard
        bg={cardBg}
        borderRadius="xl"
        shadow="md"
        whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        overflow="hidden"
      >
        <Box h="150px" bg="gray.100" position="relative">
          {profile.imageUrl ? (
            <Image
              src={
                profile.imageUrl?.startsWith("http")
                  ? profile.imageUrl
                  : profile.imageUrl?.startsWith("/")
                    ? `${API_URL}${profile.imageUrl}`
                    : `${API_URL}/${profile.imageUrl}`
              }
              alt={lokalName}
              w="100%"
              h="100%"
              objectFit="cover"
              transition="transform 0.3s ease"
              _hover={{ transform: "scale(1.1)" }}
              cursor="zoom-in"
              onClick={() => {
                setSelectedImage(
                  profile.imageUrl?.startsWith("http")
                    ? profile.imageUrl
                    : profile.imageUrl?.startsWith("/")
                      ? `${API_URL}${profile.imageUrl}`
                      : `${API_URL}/${profile.imageUrl}`
                );
                onImageOpen();
              }}
            />
          ) : (
            <Flex w="100%" h="100%" align="center" justify="center" bg="teal.50" color="teal.300">
              <Icon as={FiMapPin} boxSize={12} />
            </Flex>
          )}
          <Badge position="absolute" top={3} right={3} colorScheme="teal" borderRadius="full" px={2}>
            {profile.serialNumber || "No Serial"}
          </Badge>
        </Box>
        <CardBody>
          <VStack align="start" spacing={1}>
            <Heading size="md" color="teal.700" noOfLines={1} title={lokalName}>{lokalName || "Unknown Lokal"}</Heading>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">{distName || "Unknown District"}</Text>
          </VStack>

          <Divider my={3} />

          <SimpleGrid columns={2} spacing={2} fontSize="sm">
            <HStack color="gray.600">
              <Icon as={FiUser} color="teal.500" />
              <Text noOfLines={1} title={profile.destinado}>{profile.destinado || "N/A"}</Text>
            </HStack>
            <HStack color="gray.600">
              <Icon as={CalendarIcon} color="orange.400" />
              <Text>{profile.anniversary ? new Date(profile.anniversary).getFullYear() : "N/A"}</Text>
            </HStack>
          </SimpleGrid>

          <Flex gap={2} mt={3}>
            {profile.ledWall && <Badge colorScheme="purple" variant="subtle"><Icon as={FiZap} mr={1} />LED</Badge>}
            {profile.internetSpeed && <Badge colorScheme="blue" variant="subtle"><Icon as={FiWifi} mr={1} />{profile.internetSpeed}</Badge>}
          </Flex>

        </CardBody>
        <CardFooter pt={0}>
          <Flex w="100%" justify="space-between" align="center">
            <Text fontSize="xs" color="gray.400">Upd: {new Date(profile.datePrepared).toLocaleDateString()}</Text>
            <HStack>
              <Tooltip label="Print">
                <IconButton size="sm" icon={<FiPrinter />} onClick={() => setProfileToPrint({ ...profile, districtName: distName, lokalName: lokalName })} aria-label="Print" variant="ghost" colorScheme="blue" />
              </Tooltip>
              <Menu>
                <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" />
                <MenuList>
                  <MenuItem icon={<EditIcon />} onClick={() => openModal(profile)}>Edit</MenuItem>
                  <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => handleDelete(profile.id)}>Delete</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </CardFooter>
      </MotionCard>
    );
  };

  return (
    <Box p={{ base: 4, md: 8 }} bg={bgColor} minH="100vh">
      {/* Header Section */}
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" mb={6} gap={4}>
        <Box textAlign={{ base: "center", md: "left" }}>
          <Heading size="xl" bgGradient="linear(to-r, teal.500, blue.600)" bgClip="text" fontWeight="extrabold">Lokal Profiles</Heading>
          <Text color="gray.500" fontSize="sm">Manage congregation information and facilities</Text>
        </Box>

        <HStack w={{ base: "100%", md: "auto" }}>
          <InputGroup maxW={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
            <Input
              placeholder="Search Lokal, District..."
              bg="white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <HStack bg="white" borderRadius="md" p={1} shadow="sm">
            <IconButton
              aria-label="Grid"
              icon={<FiGrid />}
              size="sm"
              variant={viewMode === 'grid' ? 'solid' : 'ghost'}
              colorScheme="teal"
              onClick={() => setViewMode('grid')}
            />
            <IconButton
              aria-label="List"
              icon={<FiList />}
              size="sm"
              variant={viewMode === 'list' ? 'solid' : 'ghost'}
              colorScheme="teal"
              onClick={() => setViewMode('list')}
            />
          </HStack>

          <Tooltip label="Add New Profile" hasArrow>
            <IconButton
              icon={<AddIcon boxSize={6} />}
              colorScheme="teal"
              size="lg"
              isRound
              onClick={() => openModal()}
              shadow="lg"
              bgGradient="linear(to-r, teal.400, teal.600)"
              _hover={{
                transform: "scale(1.1)",
                shadow: "xl",
                bgGradient: "linear(to-r, teal.500, teal.700)"
              }}
              transition="all 0.2s"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Main Content */}
      <Box position="relative">
        {loading ? (
          <Flex justify="center" py={20}>
            <Spinner size="xl" color="teal.500" thickness="4px" />
          </Flex>
        ) : filteredProfiles.length === 0 ? (
          <Flex direction="column" align="center" justify="center" py={20} bg="white" borderRadius="xl" shadow="sm">
            <Icon as={FiMapPin} boxSize={12} color="gray.300" mb={4} />
            <Heading size="md" color="gray.400">No profiles found</Heading>
            <Text color="gray.500">Try adjusting your search or add a new profile.</Text>
          </Flex>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={6}>
                {filteredProfiles.map(profile => <ProfileCard key={profile.id} profile={profile} />)}
              </SimpleGrid>
            ) : (
              <Card overflowX="auto" shadow="md" borderRadius="xl">
                <Table variant="simple" size="sm">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th>Serial</Th>
                      <Th>Lokal</Th>
                      <Th>District</Th>
                      <Th>Resident Minister</Th>
                      <Th>Updated</Th>
                      <Th textAlign="right">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProfiles.map(profile => {
                      const distName = districts.find(d => d.id == profile.district)?.name;
                      const lokalName = localCongregations.find(l => l.id == profile.lokal)?.name || profile.lokal;
                      return (
                        <Tr key={profile.id} _hover={{ bg: "gray.50" }}>
                          <Td>{profile.serialNumber}</Td>
                          <Td fontWeight="medium">{lokalName}</Td>
                          <Td>{distName}</Td>
                          <Td>{profile.destinado}</Td>
                          <Td>{new Date(profile.datePrepared).toLocaleDateString()}</Td>
                          <Td textAlign="right">
                            <HStack justify="end">
                              <IconButton size="xs" icon={<FiPrinter />} colorScheme="blue" variant="ghost" onClick={() => setProfileToPrint({ ...profile, districtName: distName, lokalName: lokalName })} />
                              <IconButton size="xs" icon={<EditIcon />} onClick={() => openModal(profile)} variant="ghost" />
                              <IconButton size="xs" icon={<DeleteIcon />} colorScheme="red" variant="ghost" onClick={() => handleDelete(profile.id)} />
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Card>
            )}
          </>
        )}
      </Box>

      {/* Logic for Printing (Hidden) */}
      <div style={{ visibility: "hidden", position: "absolute", top: "-10000px", left: "-10000px" }}>
        <PrintableLokalProfile innerRef={printRef} profile={profileToPrint} />
      </div>

      {/* Image Zoom Modal */}
      <Modal isOpen={isImageOpen} onClose={onImageClose} size="4xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalBody p={0} display="flex" justifyContent="center">
            {selectedImage && (
              <Image
                src={selectedImage}
                maxH="90vh"
                maxW="90vw"
                objectFit="contain"
                borderRadius="md"
                boxShadow="2xl"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="5xl" scrollBehavior="inside" isCentered>
        <ModalOverlay backdropFilter="blur(3px)" />
        <ModalContent borderRadius="xl" shadow="2xl">
          <ModalHeader bg="gray.50" borderBottomWidth="1px">
            <HStack>
              <Icon as={editProfile ? EditIcon : AddIcon} color="teal.500" />
              <Text>{editProfile ? "Edit" : "Create"} Lokal Profile</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={0}>
            <Tabs orientation="vertical" variant="solid-rounded" colorScheme="teal" size="md" display={{ base: "none", md: "flex" }} h="600px">
              <TabList p={4} bg="gray.50" w="250px" borderRight="1px solid" borderColor="gray.200">
                <Tab justifyContent="flex-start" mb={2}><Icon as={FiMapPin} mr={2} /> General Info</Tab>
                <Tab justifyContent="flex-start" mb={2}><Icon as={FiUser} mr={2} /> Key Personnel</Tab>
                <Tab justifyContent="flex-start" mb={2}><Icon as={TimeIcon} mr={2} /> Schedule</Tab>
                <Tab justifyContent="flex-start" mb={2}><Icon as={FiZap} mr={2} /> Facilities</Tab>
              </TabList>

              <TabPanels flex={1} overflowY="auto">
                {/* Tab 1: General */}
                <TabPanel>
                  <VStack spacing={5} align="stretch" maxW="lg">
                    <Heading size="sm" mb={2} color="teal.600">Location Details</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                        <FormLabel fontSize="sm" fontWeight="bold">District</FormLabel>
                        <Select
                          placeholder="Select District"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: parseInt(e.target.value), lokal: "" })}
                          variant="filled"
                        >
                          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                      </Box>
                      <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                        <Flex justify="space-between" align="center" mb={1}>
                          <FormLabel fontSize="sm" fontWeight="bold" mb={0}>Local Congregation</FormLabel>
                          <Checkbox
                            size="sm"
                            colorScheme="teal"
                            isChecked={formData.isManualLokal}
                            onChange={(e) => setFormData({ ...formData, isManualLokal: e.target.checked, lokal: "", lokalInput: "" })}
                          >
                            Manual Input
                          </Checkbox>
                        </Flex>

                        {formData.isManualLokal ? (
                          <Input
                            placeholder="Type Lokal Name"
                            value={formData.lokalInput}
                            onChange={(e) => setFormData({ ...formData, lokalInput: e.target.value })}
                            variant="filled"
                          />
                        ) : (
                          <Select
                            placeholder="Select Lokal"
                            value={formData.lokal}
                            onChange={(e) => setFormData({ ...formData, lokal: parseInt(e.target.value) })}
                            isDisabled={!formData.district}
                            variant="filled"
                          >
                            {localCongregations.filter(l => l.district_id === formData.district).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </Select>
                        )}
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Serial Number</FormLabel>
                        <Input value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Anniversary</FormLabel>
                        <Input type="date" value={formData.anniversary} onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })} />
                      </Box>
                    </SimpleGrid>

                    <Divider />

                    <Heading size="sm" mb={2} color="teal.600">Image</Heading>
                    <Box
                      border="2px dashed"
                      borderColor="gray.300"
                      borderRadius="md"
                      h="200px"
                      bg="gray.50"
                      cursor="pointer"
                      overflow="hidden"
                      position="relative"
                      onClick={() => document.getElementById('modal-img-upload').click()}
                      _hover={{ borderColor: "teal.400", bg: "teal.50" }}
                    >
                      {formData.imageUrl ? (
                        <Image src={formData.imageUrl?.startsWith('/') ? `${API_URL}${formData.imageUrl}` : formData.imageUrl} h="100%" w="100%" objectFit="contain" />
                      ) : (
                        <Flex direction="column" align="center" justify="center" h="100%" color="gray.400">
                          <Icon as={FiMapPin} boxSize={8} mb={2} />
                          <Text fontSize="sm">Click to upload photo</Text>
                        </Flex>
                      )}
                      <input id="modal-img-upload" type="file" hidden accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Tab 2: Personnel */}
                <TabPanel>
                  <VStack spacing={5} align="stretch" maxW="lg">
                    <Box>
                      <Heading size="sm" mb={4} color="teal.600">Ministerial Staff</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box gridColumn={{ base: "span 1", md: "span 2" }}>
                          <FormLabel fontSize="sm">Resident Minister (Destinado)</FormLabel>
                          <Input value={formData.destinado} onChange={(e) => setFormData({ ...formData, destinado: e.target.value })} placeholder="Full Name" />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">Contact Info</FormLabel>
                          <Input value={formData.destinadoContact} onChange={(e) => setFormData({ ...formData, destinadoContact: e.target.value })} />
                        </Box>
                      </SimpleGrid>
                    </Box>
                    <Divider />
                    <Box>
                      <Heading size="sm" mb={4} color="teal.600">District Oversight</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <FormLabel fontSize="sm">District Minister</FormLabel>
                          <Input value={formData.districtMinister} onChange={(e) => setFormData({ ...formData, districtMinister: e.target.value })} />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">Contact Info</FormLabel>
                          <Input value={formData.ministerContact} onChange={(e) => setFormData({ ...formData, ministerContact: e.target.value })} />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">District Chronicler</FormLabel>
                          <Input value={formData.districtChronicler} onChange={(e) => setFormData({ ...formData, districtChronicler: e.target.value })} />
                        </Box>
                        <Box>
                          <FormLabel fontSize="sm">Contact Info</FormLabel>
                          <Input value={formData.chroniclerContact} onChange={(e) => setFormData({ ...formData, chroniclerContact: e.target.value })} />
                        </Box>
                      </SimpleGrid>
                    </Box>
                  </VStack>
                </TabPanel>

                {/* Tab 3: Schedule */}
                <TabPanel>
                  <Heading size="sm" mb={6} color="teal.600">Worship Service Schedule</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <Box>
                      <Badge colorScheme="purple" mb={3} px={2} py={1} borderRadius="md">Midweek</Badge>
                      <VStack spacing={3}>
                        {["Tuesday", "Wednesday", "Thursday"].map(day => (
                          <Box w="100%" key={day}>
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">{day}</Text>
                            <Input
                              size="sm"
                              placeholder="e.g. 05:45 AM, 06:45 PM"
                              value={formData.scheduleMidweek[day]}
                              onChange={(e) => setFormData({
                                ...formData,
                                scheduleMidweek: { ...formData.scheduleMidweek, [day]: e.target.value }
                              })}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>

                    <Box>
                      <Badge colorScheme="orange" mb={3} px={2} py={1} borderRadius="md">Weekend</Badge>
                      <VStack spacing={3}>
                        {["Friday", "Saturday", "Sunday"].map(day => (
                          <Box w="100%" key={day}>
                            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">{day}</Text>
                            <Input
                              size="sm"
                              placeholder="e.g. 05:45 AM, 09:45 AM"
                              value={formData.scheduleWeekend[day]}
                              onChange={(e) => setFormData({
                                ...formData,
                                scheduleWeekend: { ...formData.scheduleWeekend, [day]: e.target.value }
                              })}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </TabPanel>

                {/* Tab 4: Facilities */}
                <TabPanel>
                  <VStack spacing={5} align="stretch" maxW="lg">
                    <Heading size="sm" color="teal.600">Site Information</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <FormLabel fontSize="sm">Seating Capacity</FormLabel>
                        <Input type="number" value={formData.seatingCapacity} onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Internet Speed</FormLabel>
                        <Input value={formData.internetSpeed} onChange={(e) => setFormData({ ...formData, internetSpeed: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Dist. from Central (km)</FormLabel>
                        <Input value={formData.distanceFromCentral} onChange={(e) => setFormData({ ...formData, distanceFromCentral: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Travel Time</FormLabel>
                        <Input value={formData.travelTimeFromCentral} onChange={(e) => setFormData({ ...formData, travelTimeFromCentral: e.target.value })} />
                      </Box>
                    </SimpleGrid>

                    <Divider />
                    <Heading size="sm" color="teal.600">Equipment</Heading>
                    <HStack spacing={6}>
                      <Checkbox
                        isChecked={formData.ledWall}
                        onChange={(e) => setFormData({ ...formData, ledWall: e.target.checked })}
                        size="lg" colorScheme="teal"
                      >
                        LED Wall
                      </Checkbox>
                      <Checkbox
                        isChecked={formData.generator}
                        onChange={(e) => setFormData({ ...formData, generator: e.target.checked })}
                        size="lg" colorScheme="teal"
                      >
                        Power Generator
                      </Checkbox>
                    </HStack>

                    <Divider />
                    <Heading size="sm" color="teal.600">Meta Data</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <FormLabel fontSize="sm">Prepared By</FormLabel>
                        <Input value={formData.preparedBy} onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })} />
                      </Box>
                      <Box>
                        <FormLabel fontSize="sm">Date Prepared</FormLabel>
                        <Input type="date" value={formData.datePrepared} onChange={(e) => setFormData({ ...formData, datePrepared: e.target.value })} />
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Mobile Fallback for Tabs (Simple Stack) */}
            <Box display={{ base: "block", md: "none" }} p={4} maxH="60vh" overflowY="auto">
              <VStack spacing={6}>
                {/* Condensed layout for mobile */}
                <Box w="100%">
                  <Heading size="sm" mb={2}>Location</Heading>
                  <Select mb={2} placeholder="Select District" value={formData.district} onChange={(e) => setFormData({ ...formData, district: parseInt(e.target.value) })} >
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                  <Select placeholder="Select Lokal" value={formData.lokal} onChange={(e) => setFormData({ ...formData, lokal: parseInt(e.target.value) })} isDisabled={!formData.district}>
                    {localCongregations.filter(l => l.district_id === formData.district).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </Select>
                </Box>
                {/* ... other condensed fields if needed for mobile ... */}
                <Text color="gray.500" fontSize="sm" fontStyle="italic">Use desktop to edit full details.</Text>
              </VStack>
            </Box>
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px">
            <Button variant="ghost" mr={3} onClick={closeModal}>Cancel</Button>
            <Button colorScheme="teal" onClick={handleSave} px={8}>Save Profile</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LokalProfile;
