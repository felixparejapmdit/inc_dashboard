import React, { useEffect, useState } from "react";
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
  useDisclosure,
  SimpleGrid,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Textarea,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { CheckIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { MdTrackChanges, MdTimeline, MdCheckCircle, MdPersonRemove } from "react-icons/md";
import { TimeIcon } from "@chakra-ui/icons";
import { fetchData, postData, putData } from "../../utils/fetchData";
import { filterPersonnelData } from "../../utils/filterUtils";
import { usePermissionContext } from "../../contexts/PermissionContext";
import TransferReassignModal from "../../components/TransferReassignModal";

const stages = [
  "Department / Section Head Handover",
  "Security & Property Clearance (ID Return)",
  "IT / Systems Access Revocation",
  "Personnel Office Final Clearance",
];

const StatusChangeTracking = () => {
  const [personnels, setPersonnels] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isInitiateOpen, onOpen: onInitiateOpen, onClose: onInitiateClose } = useDisclosure();
  const { isOpen: isFinalizeOpen, onOpen: onFinalizeOpen, onClose: onFinalizeClose } = useDisclosure();
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();

  const [personnelForAction, setPersonnelForAction] = useState(null);
  const [reason, setReason] = useState("");

  const { hasPermission } = usePermissionContext();
  const userGroup = localStorage.getItem("groupName");
  const isAdmin = userGroup === "Admin" || hasPermission("*");

  const cardBg = useColorModeValue("white", "gray.700");
  const mainBg = useColorModeValue("gray.50", "gray.900");

  const loadPersonnels = () => {
    fetchData(
      "personnels/active",
      (data) => {
        data = filterPersonnelData(data);
        setPersonnels(
          data.map((p) => ({
            ...p,
            fullname: `${p.givenname || ""} ${p.surname_husband || ""}`.trim(),
          })),
        );
      },
      (err) => console.error(err),
      "Failed to fetch personnel",
    );
  };

  useEffect(() => {
    loadPersonnels();
  }, []);

  const activeUsers = personnels.filter(
    (p) => !p.personnel_status || p.personnel_status === "active",
  );
  const pendingRemovalUsers = personnels.filter((p) => p.personnel_status === "pending_removal");

  const filterBySearch = (list) =>
    list.filter((p) => {
      const q = search.toLowerCase();
      return (p.fullname || "").toLowerCase().includes(q) || (p.email_address || "").toLowerCase().includes(q);
    });

  const filteredActive = filterBySearch(activeUsers);
  const filteredPendingRemoval = filterBySearch(pendingRemovalUsers);

  const openInitiateDialog = (personnel) => {
    setPersonnelForAction(personnel);
    setReason("");
    onInitiateOpen();
  };

  const handleInitiateRemoval = async () => {
    if (!personnelForAction) return;
    try {
      await postData(`personnels/${personnelForAction.personnel_id}/initiate-removal`, { reason });
      toast({ title: "Removal Initiated", status: "success", duration: 3000, isClosable: true });
      onInitiateClose();
      loadPersonnels();
    } catch (err) {
      toast({
        title: "Failed to Initiate Removal",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const openTransferModal = (personnel) => {
    setPersonnelForAction(personnel);
    onTransferOpen();
  };

  const handleTrack = (personnel) => {
    setSelectedUser(personnel);
    const raw = personnel.status_change_progress;
    setProgress(raw !== undefined && raw !== null ? Number(raw) : 0);
    onOpen();
  };

  const handleUpdateProgress = async (newProgressStep) => {
    if (!selectedUser || !selectedUser.personnel_id) return;

    const confirmUpdate = window.confirm(
      `Are you sure you want to update the clearance stage to: "${stages[newProgressStep]}"?`,
    );
    if (!confirmUpdate) return;

    setIsUpdating(true);
    try {
      await putData("personnels/update-removal-progress", {
        personnel_id: selectedUser.personnel_id,
        status_change_progress: newProgressStep,
      });

      setProgress(newProgressStep);
      setPersonnels((prev) =>
        prev.map((p) =>
          p.personnel_id === selectedUser.personnel_id
            ? { ...p, status_change_progress: String(newProgressStep) }
            : p,
        ),
      );

      toast({ title: "Clearance Updated", status: "success", duration: 3000, isClosable: true });
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not update clearance stage.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openFinalizeDialog = () => {
    setReason("");
    onFinalizeOpen();
  };

  const handleFinalizeRemoval = async () => {
    if (!selectedUser) return;
    try {
      await postData(`personnels/${selectedUser.personnel_id}/finalize-removal`, { reason });
      toast({ title: "Record Closed", description: "Personnel record has been closed.", status: "success", duration: 3000, isClosable: true });
      onFinalizeClose();
      onClose();
      loadPersonnels();
    } catch (err) {
      toast({
        title: "Failed to Close Record",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={mainBg} minH="100vh" py={6} px={{ base: 4, md: 6 }}>
      <Box maxW="full" mx="auto">
        <VStack spacing={6} align="stretch" mb={8}>
          <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap={4}>
            <VStack align="start" spacing={0}>
              <Heading size="lg" bgGradient="linear(to-r, red.500, orange.500)" bgClip="text" fontWeight="extrabold">
                Personnel Status Change
              </Heading>
              <Text color="gray.500" fontSize="sm">Removal clearance and transfer/reassignment tracking</Text>
            </VStack>

            <Input
              placeholder="Search personnel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="white"
              variant="outline"
              borderColor="gray.300"
              focusBorderColor="red.400"
              width={{ base: "full", md: "300px" }}
              borderRadius="md"
            />
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <Stat px={4} py={3} bg="white" shadow="sm" rounded="lg" borderLeft="4px solid" borderColor="blue.400">
              <StatLabel color="gray.500" fontSize="xs" fontWeight="bold">ACTIVE PERSONNEL</StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold">{filteredActive.length}</StatNumber>
            </Stat>
            <Stat px={4} py={3} bg="white" shadow="sm" rounded="lg" borderLeft="4px solid" borderColor="orange.400">
              <StatLabel color="gray.500" fontSize="xs" fontWeight="bold">PENDING CLEARANCE</StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold">{filteredPendingRemoval.length}</StatNumber>
            </Stat>
          </SimpleGrid>
        </VStack>

        {filteredPendingRemoval.length > 0 && (
          <Box mb={8}>
            <Heading size="md" mb={4} color="orange.600">Pending Clearance</Heading>
            <Box bg="white" shadow="md" rounded="lg" overflowX="auto">
              <Table variant="striped" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>Full Name</Th>
                    <Th>Email</Th>
                    <Th>Stage</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredPendingRemoval.map((user) => (
                    <Tr key={user.personnel_id}>
                      <Td fontWeight="bold">{user.fullname}</Td>
                      <Td>{user.email_address || "No Email"}</Td>
                      <Td>
                        <Badge colorScheme="orange" variant="subtle" rounded="full" fontSize="xx-small">
                          {stages[Number(user.status_change_progress) || 0]}
                        </Badge>
                      </Td>
                      <Td>
                        <Button leftIcon={<Icon as={MdTrackChanges} />} colorScheme="orange" size="sm" onClick={() => handleTrack(user)}>
                          Track
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}

        <Box>
          <Heading size="md" mb={4} color="gray.700">Active Personnel</Heading>
          <Box bg="white" shadow="md" rounded="lg" overflowX="auto">
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Full Name</Th>
                  <Th>Email</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredActive.map((user) => (
                  <Tr key={user.personnel_id}>
                    <Td fontWeight="bold">{user.fullname}</Td>
                    <Td>{user.email_address || "No Email"}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          leftIcon={<Icon as={MdPersonRemove} />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          onClick={() => openInitiateDialog(user)}
                        >
                          Initiate Removal
                        </Button>
                        <Button
                          leftIcon={<ExternalLinkIcon />}
                          colorScheme="teal"
                          variant="outline"
                          size="sm"
                          onClick={() => openTransferModal(user)}
                        >
                          Transfer / Reassign
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>

      {/* Initiate Removal Confirmation */}
      <AlertDialog isOpen={isInitiateOpen} onClose={onInitiateClose} isCentered leastDestructiveRef={undefined}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Initiate Removal</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3}>
                Start a removal clearance case for <strong>{personnelForAction?.fullname}</strong>. This begins the
                clearance chain; the record is only closed once Personnel Office finalizes it.
              </Text>
              <FormControl>
                <FormLabel fontSize="sm">Reason</FormLabel>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Resignation effective 2026-07-31" />
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onInitiateClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleInitiateRemoval} ml={3}>
                Initiate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Finalize Removal Confirmation */}
      <AlertDialog isOpen={isFinalizeOpen} onClose={onFinalizeClose} isCentered leastDestructiveRef={undefined}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Close Record</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={3}>
                This will permanently close <strong>{selectedUser?.fullname}</strong>'s personnel record. Confirm the
                ID has been physically returned to the Personnel Office before proceeding. This cannot be undone from here.
              </Text>
              <FormControl>
                <FormLabel fontSize="sm">Clearance Note</FormLabel>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. ID returned, all clearances confirmed" />
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onFinalizeClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleFinalizeRemoval} ml={3}>
                Close Record
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Transfer / Reassignment Modal */}
      <TransferReassignModal
        isOpen={isTransferOpen}
        onClose={onTransferClose}
        personnel={personnelForAction}
        onSuccess={loadPersonnels}
      />

      {/* Clearance Timeline Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color="white" mt={2} mr={2} zIndex={10} />
          <DrawerHeader bg="orange.500" color="white" py={6}>
            <Heading size="md">Removal Clearance</Heading>
            <Text fontSize="sm" opacity={0.9} mt={1} fontWeight="normal">
              {selectedUser?.fullname}
            </Text>
          </DrawerHeader>

          <DrawerBody p={0}>
            <Box p={6}>
              <Flex justify="space-between" align="center" mb={6} bg="gray.50" p={3} rounded="lg">
                <Text fontSize="sm" fontWeight="semibold" color="gray.600">Current Stage</Text>
                <Badge colorScheme="orange" fontSize="md" px={3} py={1} rounded="md">
                  Stage {progress}
                </Badge>
              </Flex>

              <VStack align="stretch" spacing={0} position="relative">
                {stages.map((stage, index) => {
                  const isCompleted = index < progress;
                  const isCurrent = index === progress;

                  return (
                    <Flex key={index} gap={4} pb={8} position="relative">
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

                      <Box pt={1} flex="1">
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
                              {isCompleted ? "Completed" : isCurrent ? "Current Stage" : "Pending"}
                            </Text>
                          </Box>

                          {isAdmin && !isCurrent && (
                            <Button
                              size="xs"
                              colorScheme="orange"
                              variant="outline"
                              onClick={() => handleUpdateProgress(index)}
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

              {progress >= stages.length ? (
                <Button colorScheme="red" width="full" size="lg" leftIcon={<CheckIcon />} onClick={openFinalizeDialog}>
                  Close Record
                </Button>
              ) : (
                <Box textAlign="center">
                  <Text fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="wide">
                    Overall Completion
                  </Text>
                  <Heading size="lg" color="orange.500">
                    {((progress / stages.length) * 100).toFixed(0)}%
                  </Heading>
                </Box>
              )}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default StatusChangeTracking;
