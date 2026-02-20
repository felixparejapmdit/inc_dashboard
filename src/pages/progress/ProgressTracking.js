
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  useToast,
  Input,
  Flex,
  Divider,
  Slide,
  useDisclosure,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Badge,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Tooltip,
  Circle,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  List,
  ListItem,
  Portal,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  CheckIcon,
  Search2Icon,
  ExternalLinkIcon,
  CloseIcon,
  ViewIcon,
  DeleteIcon,
  TimeIcon,
  ArrowForwardIcon,
} from "@chakra-ui/icons";
import { MdTrackChanges, MdPerson, MdEmail, MdTimeline, MdCheckCircle, MdCancel, MdGridView, MdViewList } from "react-icons/md";
import { fetchEnrollData, fetchProgressData, deleteData, putData } from "../../utils/fetchData";
import { filterPersonnelData } from "../../utils/filterUtils";
import { usePermissionContext } from "../../contexts/PermissionContext";

const API_URL = process.env.REACT_APP_API_URL;

const stages = [
  "Report to the Section Chief",
  "Report to the Building Admin Office",
  "Report to the Building Security Overseer",
  "Report to PMD IT",
  "Report to ATG Office 1 for Photoshoot",
  "Report to ATG Office 2 for Confidentiality",
  "Submit forms to ATG Office for Approval",
  "Report to the Personnel Office to get the ID",
];



const PersonnelListPopover = ({ items, label, children }) => {
  if (!items || items.length === 0) {
    return children;
  }

  // Helper to get image if available in user object
  // Note: users in this file might not have 'image' property populated by default API.
  // We use what we have, or fallback to name initials.

  return (
    <Popover trigger="hover" placement="bottom" isLazy>
      <PopoverTrigger>
        <Box display="inline-block" cursor="pointer">{children}</Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w="300px" boxShadow="xl" _focus={{ outline: "none" }}>
          <PopoverArrow />
          <PopoverBody maxH="300px" overflowY="auto" p={0}>
            <Box p={2} bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
              <Text fontSize="xs" fontWeight="bold" color="gray.500">{label} ({items.length})</Text>
            </Box>
            <List spacing={0}>
              {items.map((p, idx) => {
                const API_URL = process.env.REACT_APP_API_URL;
                const rawImage = p.image || (p.images && p.images.length > 0 ? p.images[0].image_url : null);
                const avatarSrc = rawImage
                  ? (rawImage.startsWith('http') ? rawImage : `${API_URL}/${rawImage.startsWith('/') ? rawImage.slice(1) : rawImage}`)
                  : null;

                const name = p.fullname || `${p.givenname || ""} ${p.surname_husband || ""}`.trim() || "Unknown";

                return (
                  <ListItem key={p.personnel_id || idx} p={2} _hover={{ bg: "gray.50" }}>
                    <HStack>
                      <Avatar size="sm" src={avatarSrc} name={name} />
                      <Text fontSize="sm" noOfLines={1}>{name}</Text>
                    </HStack>
                  </ListItem>
                );
              })}
            </List>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

const ProgressTracking = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [search, setSearch] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { hasPermission } = usePermissionContext();
  // Check if user is in "Admin" group OR has superuser permission
  const userGroup = localStorage.getItem("userGroupName");
  const isAdmin = userGroup === "Admin" || hasPermission("*");

  const [viewMode, setViewMode] = useState("list"); // 'grid' | 'list'
  const [isUpdating, setIsUpdating] = useState(false);

  // Colors
  const cardBg = useColorModeValue("white", "gray.700");
  const mainBg = useColorModeValue("gray.50", "gray.900");

  const fetchUsers = () => {
    // ... (logic remains same)
    // NOTE: Using the useEffect hook logic below instead.
  };

  useEffect(() => {
    // Re-implementing the fetch call exactly as it was to ensure data consistency
    fetchEnrollData(
      "personnels/new",
      (data) => {
        // ✅ Apply RBAC Filter
        data = filterPersonnelData(data);

        const formattedUsers = data.map((user) => ({
          ...user,
          fullname: `${user.givenname || ""} ${user.surname_husband || ""}`.trim(),
        }));
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      },
      (err) => console.error(err),
      "Failed to fetch users"
    );
  }, []);

  // Delete Confirmation State
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();
  const [personnelToDelete, setPersonnelToDelete] = useState(null);
  const cancelRef = React.useRef();

  const initiateDelete = (personnelId) => {
    setPersonnelToDelete(personnelId);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (!personnelToDelete) return;

    try {
      await deleteData(
        "personnels",
        personnelToDelete,
        "Failed to delete personnel"
      );

      toast({
        title: "Deleted",
        description: "Personnel record deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const updatedUsers = users.filter(
        (user) => user.personnel_id !== personnelToDelete
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      onDeleteClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete personnel",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUserSelect = (user) => {
    if (!user || !user.personnel_id) {
      toast({
        title: "Error",
        description: "Invalid personnel data selected.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    fetchProgressData(
      "personnels",
      (updatedUser) => {
        const userObj = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser;

        if (!userObj) {
          toast({
            title: "Error",
            description: "No data received for this user.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }

        setSelectedUser(userObj);
        const rawProgress = userObj.personnel_progress;
        const currentProgress = (rawProgress !== undefined && rawProgress !== null)
          ? Number(rawProgress)
          : 0;

        setProgress(currentProgress);
        onOpen();
      },
      (err) => {
        toast({
          title: "Error",
          description: err,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      },
      "Failed to load user progress",
      String(user.personnel_id),
      () => setLoading(false)
    );
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = users.filter((user) => {
      const fullname = user.fullname || "";
      const email = user.email || "";
      return (
        fullname.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });
    setFilteredUsers(filtered);
  };

  const handleUpdateProgress = async (newProgressStep) => {
    if (!selectedUser || !selectedUser.personnel_id) return;

    const confirmUpdate = window.confirm(
      `Are you sure you want to update the progress to: "${stages[newProgressStep]}"?`
    );
    if (!confirmUpdate) return;

    setIsUpdating(true);
    try {
      await putData("users/update-progress", {
        personnel_id: selectedUser.personnel_id,
        personnel_progress: newProgressStep,
      });

      setProgress(newProgressStep);

      // Update the local users list to reflect the change immediately
      const updatedUsers = users.map(u =>
        u.personnel_id === selectedUser.personnel_id
          ? { ...u, personnel_progress: newProgressStep }
          : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(
        updatedUsers.filter(u => {
          const fullname = u.fullname || "";
          const email = u.email || "";
          return fullname.toLowerCase().includes(search.toLowerCase()) ||
            email.toLowerCase().includes(search.toLowerCase());
        })
      );

      toast({
        title: "Progress Updated",
        description: `Successfully moved to step ${newProgressStep}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update progress.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Stats
  const pendingUsersAll = filteredUsers.filter(u => (u.personnel_progress || 0) < 8);
  const completedUsersAll = filteredUsers.filter(u => (u.personnel_progress || 0) >= 8);

  const totalRequests = pendingUsersAll.length;
  const totalCompleted = completedUsersAll.length;

  // Pagination State
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed

  // Pagination Logic
  const paginate = (items, page, perPage) => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  };

  const pendingUsers = paginate(pendingUsersAll, pendingPage, itemsPerPage);
  const completedUsers = paginate(completedUsersAll, completedPage, itemsPerPage);

  const pendingTotalPages = Math.ceil(pendingUsersAll.length / itemsPerPage);
  const completedTotalPages = Math.ceil(completedUsersAll.length / itemsPerPage);

  // Reset pagination on search
  useEffect(() => {
    setPendingPage(1);
    setCompletedPage(1);
  }, [search, users]);
  // Estimate completed: progress >= 7? Or based on some other flag. 
  // We'll just show Total for now.

  return (
    <Box bg={mainBg} minH="100vh" py={6} px={{ base: 4, md: 6 }}>
      {/* Use full width container if needed, or keeping it cleaner maxW="full" */}
      <Box maxW="full" mx="auto">
        {/* Header Section */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={0}>
              <Heading size="lg" bgGradient="linear(to-r, orange.400, red.500)" bgClip="text" fontWeight="extrabold">
                Personnel Tracker
              </Heading>
              <Text color="gray.500" fontSize="sm">Monitor and manage enrollment progress</Text>
            </VStack>

            <HStack spacing={3} w={{ base: "full", md: "auto" }}>
              <Input
                placeholder="Search personnel..."
                value={search}
                onChange={handleSearch}
                bg="white"
                variant="outline"
                borderColor="gray.300"
                focusBorderColor="orange.500"
                width={{ base: "full", md: "300px" }}
                borderRadius="md"
              />

              {/* View Toggle */}
              <HStack spacing={0} border="1px solid" borderColor="gray.300" borderRadius="md" overflow="hidden">
                <IconButton
                  aria-label="Grid View"
                  icon={<Icon as={MdGridView} />}
                  variant={viewMode === 'grid' ? "solid" : "ghost"}
                  colorScheme={viewMode === 'grid' ? "orange" : "gray"}
                  borderRadius="0"
                  size="md"
                  onClick={() => setViewMode("grid")}
                />
                <IconButton
                  aria-label="List View"
                  icon={<Icon as={MdViewList} />}
                  variant={viewMode === 'list' ? "solid" : "ghost"}
                  colorScheme={viewMode === 'list' ? "orange" : "gray"}
                  borderRadius="0"
                  size="md"
                  onClick={() => setViewMode("list")}
                />
              </HStack>

              <Button
                leftIcon={<Icon as={MdTimeline} />}
                colorScheme="purple"
                variant="solid"
                size="md"
                onClick={() => navigate("/progress/step1")}
                shadow="sm"
                _hover={{ transform: "translateY(-1px)", shadow: "md" }}
              >
                Start Step
              </Button>
            </HStack>
          </Flex>

          {/* Stats Section (Compact) */}
          <SimpleGrid columns={{ base: 1, sm: 3, md: 4 }} spacing={4}>
            <Stat
              px={4} py={3}
              bg="white"
              shadow="sm"
              rounded="lg"
              borderLeft="4px solid"
              borderColor="orange.400"
            >
              <StatLabel color="gray.500" fontSize="xs" fontWeight="bold">PENDING REQUESTS</StatLabel>
              <PersonnelListPopover items={pendingUsersAll} label="Pending Requests">
                <StatNumber fontSize="2xl" fontWeight="bold" _hover={{ color: "orange.500", transition: "color 0.2s" }}>
                  {totalRequests}
                </StatNumber>
              </PersonnelListPopover>
            </Stat>

            <Stat
              px={4} py={3}
              bg="white"
              shadow="sm"
              rounded="lg"
              borderLeft="4px solid"
              borderColor="green.400"
            >
              <StatLabel color="gray.500" fontSize="xs" fontWeight="bold">COMPLETED</StatLabel>
              <PersonnelListPopover items={completedUsersAll} label="Completed Personnel">
                <StatNumber fontSize="2xl" fontWeight="bold" _hover={{ color: "green.500", transition: "color 0.2s" }}>
                  {totalCompleted}
                </StatNumber>
              </PersonnelListPopover>
            </Stat>
          </SimpleGrid>
        </VStack>

        {/* Content Area */}
        {pendingUsersAll.length === 0 && completedUsersAll.length === 0 ? (
          <Flex justify="center" align="center" h="200px" bg="white" rounded="lg" shadow="sm">
            <Text color="gray.500">No personnel found matching your search.</Text>
          </Flex>
        ) : (
          <VStack spacing={8} align="stretch">

            {/* PENDING / IN PROGRESS SECTION */}
            {pendingUsers.length > 0 && (
              <Box>
                <Heading size="md" mb={4} color="orange.600">Pending / In Progress</Heading>
                {viewMode === "grid" ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                    {pendingUsers.map((user, index) => (
                      <Card
                        key={`pending-${user.id}-${index}`}
                        bg={cardBg}
                        shadow="sm"
                        rounded="lg"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.100"
                        _hover={{ shadow: "md", borderColor: "orange.200" }}
                      >
                        <CardHeader pb={0} pt={4}>
                          <Flex gap={3} alignItems="center">
                            <Avatar
                              name={user.fullname}
                              size="sm"
                              bg="orange.100"
                              color="orange.600"
                              fontWeight="bold"
                            />
                            <Box overflow="hidden">
                              <Text fontWeight="bold" fontSize="md" noOfLines={1}>{user.fullname || "Unknown"}</Text>
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {user.email_address || "No Email"}
                              </Text>
                            </Box>
                          </Flex>
                        </CardHeader>

                        <CardBody py={3}>
                          <Flex justify="space-between" align="center">
                            <Badge
                              colorScheme="orange"
                              variant="subtle"
                              rounded="full"
                              px={2}
                              fontSize="xx-small"
                            >
                              IN PROGRESS
                            </Badge>
                            <Text fontSize="xs" fontWeight="bold" color="gray.400">Step {user.personnel_progress || 0}</Text>
                          </Flex>
                        </CardBody>

                        <Divider color="gray.100" />

                        <CardFooter justify="space-between" bg="gray.50" py={2} px={4}>
                          <Button
                            leftIcon={<Icon as={MdTrackChanges} />}
                            colorScheme="orange"
                            variant="solid"
                            size="xs"
                            onClick={() => handleUserSelect(user)}
                          >
                            Track
                          </Button>

                          <HStack spacing={0}>
                            <Tooltip label="Preview">
                              <IconButton
                                icon={<ViewIcon />}
                                variant="ghost" colorScheme="blue" size="xs"
                                onClick={() => window.open(`/personnel-preview/${user.personnel_id}`, "_blank")}
                              />
                            </Tooltip>
                            <Tooltip label="Update">
                              <IconButton
                                icon={<ExternalLinkIcon />}
                                variant="ghost" colorScheme="teal" size="xs"
                                onClick={() => {
                                  const pid = user.personnel_id;
                                  const url = pid ? `/enroll?personnel_id=${pid}&type=editprogress`
                                    : `/enroll?not_enrolled=${user.username}&type=editprogress`;
                                  window.location.href = url;
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Delete">
                              <IconButton
                                icon={<DeleteIcon />}
                                variant="ghost" colorScheme="red" size="xs"
                                onClick={() => initiateDelete(user.personnel_id)}
                              />
                            </Tooltip>
                          </HStack>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  // LIST VIEW (Table) - Pending
                  <Box bg="white" shadow="md" rounded="lg" overflowX="auto">
                    <Table variant="striped" colorScheme="gray">
                      <Thead>
                        <Tr>
                          <Th>#</Th>
                          <Th>Full Name</Th>
                          <Th>Email</Th>
                          <Th>Status</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {pendingUsers.map((user, index) => (
                          <Tr key={`pending-${user.id}-${index}`}>
                            <Td>{index + 1}</Td>
                            <Td fontWeight="bold">{user.fullname || "N/A"}</Td>
                            <Td>{user.email_address || "No Email"}</Td>
                            <Td>
                              <Badge colorScheme="orange" variant="subtle" rounded="full" fontSize="xx-small">
                                STEP {user.personnel_progress || 0}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  leftIcon={<Icon as={MdTrackChanges} />}
                                  colorScheme="orange"
                                  size="sm"
                                  onClick={() => handleUserSelect(user)}
                                >
                                  Track
                                </Button>
                                <IconButton icon={<ViewIcon />} size="sm" colorScheme="yellow" onClick={() => window.open(`/personnel-preview/${user.personnel_id}`, "_blank")} />
                                <IconButton icon={<ExternalLinkIcon />} size="sm" colorScheme="teal" onClick={() => window.location.href = user.personnel_id ? `/enroll?personnel_id=${user.personnel_id}&type=editprogress` : `/enroll?not_enrolled=${user.username}&type=editprogress`} />
                                <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => initiateDelete(user.personnel_id)} />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}

            {/* Pagination Controls for Pending */}
            {pendingUsersAll.length > itemsPerPage && (
              <Flex justify="center" mt={4} gap={2}>
                <Button
                  size="sm"
                  onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                  isDisabled={pendingPage === 1}
                >
                  Previous
                </Button>
                <Text alignSelf="center" fontSize="sm">
                  Page {pendingPage} of {pendingTotalPages}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))}
                  isDisabled={pendingPage === pendingTotalPages}
                >
                  Next
                </Button>
              </Flex>
            )}

            {/* COMPLETED SECTION */}
            {completedUsers.length > 0 && (
              <Box>
                <Heading size="md" mb={1} color="green.600">Completed Personnel</Heading>
                <Text fontSize="sm" color="gray.500" mb={4} fontStyle="italic">
                  * Proceed to the Personnel page to sync users for portal access.
                </Text>
                {viewMode === "grid" ? (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
                    {completedUsers.map((user, index) => (
                      <Card
                        key={`completed-${user.id}-${index}`}
                        bg={cardBg}
                        shadow="sm"
                        rounded="lg"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="green.100"
                        _hover={{ shadow: "md", borderColor: "green.300" }}
                      >
                        <CardHeader pb={0} pt={4}>
                          <Flex gap={3} alignItems="center">
                            <Avatar
                              name={user.fullname}
                              size="sm"
                              bg="green.100"
                              color="green.600"
                              fontWeight="bold"
                            />
                            <Box overflow="hidden">
                              <Text fontWeight="bold" fontSize="md" noOfLines={1}>{user.fullname || "Unknown"}</Text>
                              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                {user.email_address || "No Email"}
                              </Text>
                            </Box>
                          </Flex>
                        </CardHeader>

                        <CardBody py={3}>
                          <Flex justify="space-between" align="center">
                            <Badge
                              colorScheme="green"
                              variant="solid"
                              rounded="full"
                              px={2}
                              fontSize="xx-small"
                            >
                              COMPLETED
                            </Badge>
                            <Icon as={MdCheckCircle} color="green.500" boxSize={5} />
                          </Flex>
                        </CardBody>

                        <Divider color="gray.100" />

                        <CardFooter justify="space-between" bg="gray.50" py={2} px={4}>
                          <Button
                            leftIcon={<Icon as={MdTrackChanges} />}
                            colorScheme="orange"
                            variant="solid"
                            size="xs"
                            onClick={() => handleUserSelect(user)}
                          >
                            Track
                          </Button>

                          <HStack spacing={0}>
                            <Tooltip label="Preview">
                              <IconButton
                                icon={<ViewIcon />}
                                variant="ghost" colorScheme="blue" size="xs"
                                onClick={() => window.open(`/personnel-preview/${user.personnel_id}`, "_blank")}
                              />
                            </Tooltip>
                            <Tooltip label="Update">
                              <IconButton
                                icon={<ExternalLinkIcon />}
                                variant="ghost" colorScheme="teal" size="xs"
                                onClick={() => {
                                  const pid = user.personnel_id;
                                  const url = pid ? `/enroll?personnel_id=${pid}&type=editprogress`
                                    : `/enroll?not_enrolled=${user.username}&type=editprogress`;
                                  window.location.href = url;
                                }}
                              />
                            </Tooltip>
                            {/* Completed users typically don't need update/delete here, but keeping for consistency if needed */}
                            <Tooltip label="Delete">
                              <IconButton
                                icon={<DeleteIcon />}
                                variant="ghost" colorScheme="red" size="xs"
                                onClick={() => initiateDelete(user.personnel_id)}
                              />
                            </Tooltip>
                            <Tooltip label="Proceed to Personnel Page">
                              <IconButton
                                icon={<ArrowForwardIcon />}
                                variant="ghost" colorScheme="blue" size="xs"
                                onClick={() => navigate(`/user?new_enroll_search=${encodeURIComponent(user.fullname)}`)}
                              />
                            </Tooltip>
                          </HStack>
                        </CardFooter>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  // LIST VIEW (Table) - Completed
                  <Box bg="white" shadow="md" rounded="lg" overflowX="auto">
                    <Table variant="striped" colorScheme="green">
                      <Thead>
                        <Tr>
                          <Th>#</Th>
                          <Th>Full Name</Th>
                          <Th>Email</Th>
                          <Th>Status</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {completedUsers.map((user, index) => (
                          <Tr key={`completed-${user.id}-${index}`}>
                            <Td>{index + 1}</Td>
                            <Td fontWeight="bold">{user.fullname || "N/A"}</Td>
                            <Td>{user.email_address || "No Email"}</Td>
                            <Td>
                              <Badge colorScheme="green" variant="solid" rounded="full" fontSize="xx-small">
                                COMPLETED
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  leftIcon={<Icon as={MdTrackChanges} />}
                                  colorScheme="orange"
                                  size="sm"
                                  onClick={() => handleUserSelect(user)}
                                >
                                  Track
                                </Button>
                                <IconButton icon={<ViewIcon />} size="sm" colorScheme="yellow" onClick={() => window.open(`/personnel-preview/${user.personnel_id}`, "_blank")} />
                                <IconButton icon={<ExternalLinkIcon />} size="sm" colorScheme="teal" onClick={() => window.location.href = user.personnel_id ? `/enroll?personnel_id=${user.personnel_id}&type=editprogress` : `/enroll?not_enrolled=${user.username}&type=editprogress`} />
                                <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => initiateDelete(user.personnel_id)} />
                                <Tooltip label="Proceed to Personnel Page">
                                  <IconButton icon={<ArrowForwardIcon />} size="sm" colorScheme="blue" onClick={() => navigate(`/user?new_enroll_search=${encodeURIComponent(user.fullname)}`)} />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            )}

            {/* Pagination Controls for Completed */}
            {completedUsersAll.length > itemsPerPage && (
              <Flex justify="center" mt={4} gap={2}>
                <Button
                  size="sm"
                  onClick={() => setCompletedPage(p => Math.max(1, p - 1))}
                  isDisabled={completedPage === 1}
                >
                  Previous
                </Button>
                <Text alignSelf="center" fontSize="sm">
                  Page {completedPage} of {completedTotalPages}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCompletedPage(p => Math.min(completedTotalPages, p + 1))}
                  isDisabled={completedPage === completedTotalPages}
                >
                  Next
                </Button>
              </Flex>
            )}

          </VStack>
        )}
      </Box> {/* End Main Box */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Personnel Record
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this personnel? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Sidebar Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color="white" mt={2} mr={2} zIndex={10} />

          <DrawerHeader bg="orange.500" color="white" py={6}>
            <Heading size="md">Tracking Timeline</Heading>
            <Text fontSize="sm" opacity={0.9} mt={1} fontWeight="normal">
              {selectedUser?.givenname} {selectedUser?.surname_husband}
            </Text>
          </DrawerHeader>

          <DrawerBody p={0}>
            <Box p={6}>
              <Flex justify="space-between" align="center" mb={6} bg="gray.50" p={3} rounded="lg">
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">Current Level</Text>
                <Badge colorScheme="orange" fontSize="md" px={3} py={1} rounded="md">
                  Step {progress}
                </Badge>
              </Flex>

              {/* Timeline */}
              <VStack align="stretch" spacing={0} position="relative">
                {stages.map((stage, index) => {
                  const isCompleted = index < progress;
                  const isCurrent = index === progress;
                  // const isFuture = index > progress;

                  return (
                    <Flex key={index} gap={4} pb={8} position="relative">
                      {/* Vertical Line */}
                      {index !== stages.length - 1 && (
                        <Box
                          position="absolute"
                          left="15px"
                          top="30px"
                          bottom="-10px"
                          width="2px"
                          bg={isCompleted ? "green.400" : "gray.200"}
                        />
                      )}

                      {/* Icon Indicator */}
                      <Circle
                        size="32px"
                        bg={isCompleted ? "green.100" : isCurrent ? "orange.100" : "gray.100"}
                        border="2px solid"
                        borderColor={isCompleted ? "green.400" : isCurrent ? "orange.400" : "gray.300"}
                        zIndex={1}
                      >
                        {isCompleted ? (
                          <Icon as={MdCheckCircle} color="green.500" boxSize={5} />
                        ) : isCurrent ? (
                          <Icon as={TimeIcon} color="orange.500" boxSize={4} />
                        ) : (
                          <Icon as={MdTimeline} color="gray.400" boxSize={4} />
                        )}
                      </Circle>

                      {/* Content */}
                      <Box
                        pt={1}
                        flex="1"
                        cursor="pointer"
                        onClick={() => navigate(`/progress/step${index + 1}`)}
                        _hover={{ bg: "gray.50", rounded: "md", px: 1 }}
                        transition="all 0.2s"
                      >
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Text
                              fontWeight={isCompleted || isCurrent ? "bold" : "medium"}
                              color={isCompleted ? "green.800" : isCurrent ? "orange.800" : "gray.500"}
                              fontSize="md"
                            >
                              {stage}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {isCompleted ? "Completed" : isCurrent ? "Current Step" : "Pending"}
                            </Text>
                          </Box>

                          {isAdmin && !isCurrent && (
                            <Button
                              size="xs"
                              colorScheme="orange"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateProgress(index);
                              }}
                              isLoading={isUpdating}
                              ml={2}
                            >
                              {isCompleted ? "Revert to here" : "Move to here"}
                            </Button>
                          )}
                        </Flex>
                      </Box>
                    </Flex>
                  );
                })}
              </VStack>

              <Divider my={6} />
              <Box textAlign="center">
                <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                  Overall Completion
                </Text>
                <Heading size="lg" color="orange.500">
                  {((progress / stages.length) * 100).toFixed(0)}%
                </Heading>
              </Box>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box >
  );
};

export default ProgressTracking;
