import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Text,
  Flex,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Checkbox,
  Switch,
  Icon,
  Container,
  Heading,
  VStack,
  HStack,
  SimpleGrid,
  useColorModeValue,
  Avatar,
  Badge,
  Tooltip,
  Spinner,
  Center,
  FormControl,
  Skeleton,
  SkeletonCircle,
  SkeletonText
} from "@chakra-ui/react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Shield,
  ShieldCheck,
  UserCog,
  User,
  Star,
  FileBadge,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Unlock,
  RefreshCw
} from "lucide-react";

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";
import { usePermissionContext } from "../../contexts/PermissionContext";

const TableSkeleton = () => (
  <Tbody>
    {[1, 2, 3, 5, 6].map((i) => (
      <Tr key={i}>
        <Td><Skeleton height="20px" /></Td>
        <Td>
          <HStack spacing={4}>
            <SkeletonCircle size="10" />
            <Skeleton height="20px" width="150px" />
          </HStack>
        </Td>
        <Td><Skeleton height="20px" /></Td>
        <Td><Skeleton height="32px" width="100px" margin="auto" /></Td>
      </Tr>
    ))}
  </Tbody>
);

const MotionBox = motion.create(Box);

const GroupManagement = () => {
  // State from original file
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false); // 'add', 'edit', or null
  const [isUserGroupModalOpen, setIsUserGroupModalOpen] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [applicationTypes, setApplicationTypes] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [editingGroup, setEditingGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplicationTypesLoading, setIsApplicationTypesLoading] = useState(false);
  const [savingApplicationTypeId, setSavingApplicationTypeId] = useState(null);

  const toast = useToast();
  const { fetchPermissions: refreshGlobalPermissions } = usePermissionContext();

  // Colors & Theme
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerGradient = useColorModeValue(
    "linear(to-r, cyan.600, blue.600)",
    "linear(to-r, cyan.400, blue.400)"
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch logic preserved
  const fetchGroups = () => {
    setIsLoading(true);
    fetchData(
      "groups",
      (data) => {
        setGroups(data);
        setIsLoading(false);
      },
      (err) => {
        toast({ title: "Error loading groups", description: err, status: "error" });
        setIsLoading(false);
      },
      "Failed to load groups"
    );
  };

  const fetchPermissions = (groupId) => {
    fetchData(
      `groups/${groupId}/permissions`,
      (data) => {
        const groupedPermissions = data.map((category) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          permissions: category.permissions.map((permission) => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
            accessrights: permission.accessrights,
          })),
        }));
        setPermissions(groupedPermissions);
      },
      (err) => toast({ title: "Error loading permissions", description: err, status: "error" }),
      "Failed to load permissions"
    );
  };

  const fetchGroupApplicationTypes = (groupId) => {
    setIsApplicationTypesLoading(true);
    fetchData(
      `groups/${groupId}/application-types`,
      (data) => setApplicationTypes(Array.isArray(data) ? data : []),
      (err) => toast({ title: "Error loading app visibility", description: err, status: "error" }),
      "Failed to load application visibility",
      null,
      () => setIsApplicationTypesLoading(false)
    ).catch(() => {
      setApplicationTypes([]);
    });
  };

  const fetchGroupUsers = (groupId) => {
    fetchData(
      `groups/${groupId}/users`,
      (data) => setGroupUsers(data),
      (err) => toast({ title: "Error loading users", description: err, status: "error" }),
      "Failed to load group users"
    );
  };

  const clearSelectedGroup = () => {
    setSelectedGroup(null);
    setIsAddingOrEditing(null);
    setPermissions([]);
    setApplicationTypes([]);
    setSavingApplicationTypeId(null);
  };

  const loadGroupContext = (group) => {
    setSelectedGroup(group);
    setIsAddingOrEditing("edit");
    fetchGroupUsers(group.id);
    fetchPermissions(group.id);
    fetchGroupApplicationTypes(group.id);
  };

  // Handlers preserved
  const handleShowUsers = (group) => {
    loadGroupContext(group);
    setIsUserGroupModalOpen(true);
  };

  const handleSelectGroup = (group) => {
    const isSameGroup = selectedGroup?.id === group.id && isAddingOrEditing !== "add";
    if (isSameGroup) {
      clearSelectedGroup();
      return;
    }

    loadGroupContext(group);
  };

  const handlePermissionChange = async (groupId, permissionId, categoryId, accessrights, skipRefresh = false) => {
    try {
      await putData(
        `groups/${groupId}/permissions`,
        { permissionId, categoryId, accessrights },
        null,
        "Failed to update permission"
      );

      if (!skipRefresh) {
        toast({ title: "Permission saved", status: "success", duration: 2000 });
        const currentGroupId = localStorage.getItem("groupId");
        if (currentGroupId && String(currentGroupId) === String(groupId)) {
          refreshGlobalPermissions(currentGroupId);
        }
      }
    } catch (error) {
      toast({ title: "Error saving permission", description: error.message, status: "error" });
    }
  };

  const handleApplicationTypeVisibilityChange = async (applicationType, isVisible) => {
    if (!selectedGroup) return;

    const previousApplicationTypes = applicationTypes;
    const nextValue = isVisible ? 1 : 0;

    setSavingApplicationTypeId(applicationType.id);
    setApplicationTypes((prev) =>
      prev.map((type) =>
        type.id === applicationType.id ? { ...type, is_visible: nextValue } : type
      )
    );

    try {
      await putData(
        `groups/${selectedGroup.id}/application-types`,
        applicationType.id,
        { is_visible: nextValue },
        "Failed to save application visibility"
      );

      toast({
        title: isVisible ? "Application type shown" : "Application type hidden",
        description: `${applicationType.name} updated for ${selectedGroup.name}.`,
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      setApplicationTypes(previousApplicationTypes);
      toast({
        title: "Error saving app visibility",
        description: error.message,
        status: "error",
      });
    } finally {
      setSavingApplicationTypeId(null);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroup.name) {
      toast({ title: "Group name is required", status: "warning" });
      return;
    }
    try {
      await postData("groups", newGroup, "Failed to add group");
      fetchGroups();
      setNewGroup({ name: "", description: "" });
      clearSelectedGroup();
      toast({ title: "Group added", status: "success" });
    } catch (error) {
      toast({ title: "Error adding group", description: error.message, status: "error" });
    }
  };

  const handleGroupChange = async (userId, newGroupId) => {
    try {
      await putData("user-groups", userId, { group_id: newGroupId }, "Failed to update group");
      toast({ title: "Group updated", status: "success" });
      if (selectedGroup) fetchGroupUsers(selectedGroup.id);
    } catch (error) {
      toast({ title: "Error updating group", description: error.message, status: "error" });
    }
  };

  const handleUpdateGroup = async () => {
    try {
      await putData("groups", editingGroup.id, editingGroup, "Failed to update group");
      fetchGroups();
      setEditingGroup(null);
      clearSelectedGroup();
      toast({ title: "Group updated", status: "success" });
    } catch (error) {
      toast({ title: "Error updating group", description: error.message, status: "error" });
    }
  };

  const handleDeleteGroup = async (group) => {
    if (!window.confirm(`Are you sure you want to delete the group "${group.name}"?`)) return;
    try {
      await deleteData("groups", group.id, "Failed to delete group");
      fetchGroups();
      if (selectedGroup?.id === group.id) {
        clearSelectedGroup();
      }
      toast({ title: "Group deleted", status: "success" });
    } catch (error) {
      toast({ title: "Error deleting group", description: error.message, status: "error" });
    }
  };

  // Helper for icons map
  const getGroupIcon = (name) => {
    switch (name) {
      case "Admin": return ShieldCheck;
      case "Section Chief": return Users;
      case "Team Leader": return UserCog;
      case "User": return User;
      case "VIP": return Star;
      default: return FileBadge;
    }
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
              <Icon as={Layers} boxSize={8} color="cyan.500" />
              <Heading size="xl" bgGradient={headerGradient} bgClip="text" fontWeight="black" letterSpacing="tight">
                Groups
              </Heading>
            </HStack>
            <Text color="gray.500" fontWeight="medium">View and manage groups</Text>
          </VStack>

          <HStack spacing={3}>
            {!isAddingOrEditing && (
              <Button
                leftIcon={<Plus size={18} />}
                colorScheme="cyan"
                color="white"
                onClick={() => {
                  setNewGroup({ name: "", description: "" });
                  setEditingGroup(null);
                  setPermissions([]);
                  setApplicationTypes([]);
                  setSavingApplicationTypeId(null);
                  setSelectedGroup(null);
                  setIsAddingOrEditing("add");
                }}
                size="lg"
                borderRadius="xl"
                boxShadow="lg"
                _hover={{ transform: "translateY(-2px)", boxShadow: "xl" }}
              >
                Add Group
              </Button>
            )}
            <IconButton
              icon={<RefreshCw size={20} />}
              onClick={fetchGroups}
              isLoading={isLoading}
              variant="outline"
              size="lg"
              borderRadius="xl"
              aria-label="Refresh Data"
            />
          </HStack>
        </Flex>

        {/* Stats Grid (Design Addition) */}
        {!isLoading && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            {[
              { label: "All Groups", value: groups.length, icon: Layers, color: "cyan" },
              { label: "Admin Groups", value: groups.filter(g => g.name.toLowerCase().includes('admin')).length, icon: Shield, color: "purple" },
              { label: "System Groups", value: groups.length, icon: Briefcase, color: "blue" }
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
        )}

        {selectedGroup && isAddingOrEditing !== "add" && (
          <MotionBox
            position="sticky"
            top={{ base: 3, md: 4 }}
            zIndex={20}
            mb={6}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            bg={cardBg}
            borderRadius="2xl"
            shadow="lg"
            border="1px solid"
            borderColor="cyan.200"
            overflow="hidden"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
              gap={4}
              p={{ base: 4, md: 5 }}
              bgGradient="linear(to-r, cyan.50, blue.50)"
            >
              <HStack spacing={4}>
                <Avatar
                  icon={<Icon as={getGroupIcon(selectedGroup.name)} size={20} />}
                  bg="cyan.500"
                  color="white"
                  size="sm"
                  borderRadius="lg"
                />
                <Box>
                  <Text fontSize="xs" fontWeight="black" color="cyan.600" textTransform="uppercase" letterSpacing="widest">
                    Selected group
                  </Text>
                  <Heading size="md" color="gray.800">
                    {selectedGroup.name}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Manage permissions and application visibility below.
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={3} justify={{ base: "space-between", md: "end" }} flexWrap="wrap">
                <Badge colorScheme="cyan" borderRadius="full" px={3} py={1}>
                  {permissions.length} permission group{permissions.length === 1 ? "" : "s"}
                </Badge>
                <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                  {applicationTypes.filter((type) => Number(type.is_visible) === 1).length} app type
                  {applicationTypes.filter((type) => Number(type.is_visible) === 1).length === 1 ? "" : "s"} visible
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="cyan"
                  leftIcon={<X size={16} />}
                  onClick={clearSelectedGroup}
                  borderRadius="xl"
                >
                  Hide list
                </Button>
              </HStack>
            </Flex>
          </MotionBox>
        )}

        {/* Main Content Card */}
        <Box
          bg={cardBg}
          borderRadius="3xl"
          shadow="sm"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th p={6} width="50px">#</Th>
                  <Th p={6} minW="200px">Group Name</Th>
                  <Th p={6} display={{ base: "none", md: "table-cell" }}>Description</Th>
                  <Th p={6} textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              {isLoading ? (
                <TableSkeleton />
              ) : (
                <Tbody>
                  {/* Add Group Row */}
                  {isAddingOrEditing === "add" && (
                    <Tr bg="cyan.50">
                      <Td p={6}></Td>
                      <Td p={6}>
                        <FormControl>
                          <Input
                            autoFocus
                            bg="white"
                            placeholder="Group name"
                            value={newGroup.name}
                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                            borderRadius="lg"
                            borderColor="cyan.300"
                            focusBorderColor="cyan.500"
                          />
                        </FormControl>
                      </Td>
                      <Td p={6} display={{ base: "none", md: "table-cell" }}>
                        <FormControl>
                          <Input
                            bg="white"
                            placeholder="Description"
                            value={newGroup.description}
                            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                            borderRadius="lg"
                            borderColor="cyan.300"
                            focusBorderColor="cyan.500"
                          />
                        </FormControl>
                      </Td>
                      <Td p={6}>
                        <Flex justify="center" gap={2}>
                          <Button size="sm" colorScheme="cyan" color="white" onClick={handleAddGroup} leftIcon={<Save size={16} />}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setIsAddingOrEditing(null)} leftIcon={<X size={16} />}>
                            Cancel
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  )}

                  {groups.map((group, index) => {
                    const isSelected = selectedGroup?.id === group.id && isAddingOrEditing !== "add";
                    const isEditingThis = editingGroup?.id === group.id;
                    const IconComp = getGroupIcon(group.name);

                    return (
                      <React.Fragment key={group.id}>
                        <MotionBox
                          as="tr"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          _hover={{ bg: isSelected ? "cyan.50" : "gray.50" }}
                          bg={isSelected ? "cyan.50" : "transparent"}
                          cursor="pointer"
                          onClick={() => {
                            if (!isEditingThis) {
                              handleSelectGroup(group);
                            }
                          }}
                          borderLeft={isSelected ? "4px solid" : "4px solid transparent"}
                          borderColor="cyan.500"
                          transition="all 0.2s"
                        >
                          <Td p={6} fontWeight="medium" color="gray.500">{index + 1}</Td>
                          <Td p={6}>
                            {isEditingThis ? (
                              <Input
                                value={editingGroup.name}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                                borderRadius="lg"
                                bg="white"
                              />
                            ) : (
                              <HStack spacing={4}>
                                <Avatar
                                  icon={<Icon as={IconComp} size={20} />}
                                  bg={isSelected ? "cyan.500" : "gray.100"}
                                  color={isSelected ? "white" : "gray.500"}
                                  size="sm"
                                  borderRadius="lg"
                                />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold" color={isSelected ? "cyan.700" : "gray.800"}>
                                    {group.name}
                                  </Text>
                                  <Text fontSize="xs" color={isSelected ? "cyan.500" : "gray.500"}>
                                    Click to manage permissions and apps
                                  </Text>
                                </VStack>
                              </HStack>
                            )}
                          </Td>
                          <Td p={6} display={{ base: "none", md: "table-cell" }}>
                            {isEditingThis ? (
                              <Input
                                value={editingGroup.description}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                                borderRadius="lg"
                                bg="white"
                              />
                            ) : (
                              <Text color="gray.600" fontSize="sm" noOfLines={1}>
                                {group.description || "No description."}
                              </Text>
                            )}
                          </Td>
                          <Td p={6}>
                            <Flex justify="center" gap={2}>
                              {isEditingThis ? (
                                <>
                                  <IconButton icon={<Save size={16} />} colorScheme="green" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateGroup(); }} />
                                  <IconButton icon={<X size={16} />} size="sm" onClick={(e) => { e.stopPropagation(); setEditingGroup(null); clearSelectedGroup(); }} />
                                </>
                              ) : (
                                <>
                                  <Tooltip label="View members">
                                    <IconButton
                                      icon={<Users size={16} />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="purple"
                                      onClick={(e) => { e.stopPropagation(); handleShowUsers(group); }}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Edit">
                                    <IconButton
                                      icon={<Edit2 size={16} />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="cyan"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingGroup(group);
                                        loadGroupContext(group);
                                      }}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Delete">
                                    <IconButton
                                      icon={<Trash2 size={16} />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group); }}
                                    />
                                  </Tooltip>
                                </>
                              )}
                            </Flex>
                          </Td>
                        </MotionBox>

                        {/* Expandable Permissions Panel */}
                        {isSelected && (
                          <Tr bg="gray.50">
                            <Td colSpan={5} p={0}>
                              <AnimatePresence>
                                <MotionBox
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  overflow="hidden"
                                >
                                  <Box p={8} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
                                    <Flex justify="space-between" align="center" mb={6} bg="white" p={4} borderRadius="xl" shadow="sm">
                                      <HStack>
                                        <Icon as={Unlock} color="cyan.500" boxSize={6} />
                                        <Box>
                                          <Text fontSize="lg" fontWeight="bold" color="gray.800">
                                            Permissions: {group.name}
                                          </Text>
                                          <Text fontSize="xs" color="gray.500">
                                            Set access for this group
                                          </Text>
                                        </Box>
                                      </HStack>
                                    </Flex>

                                    <Stack spacing={4}>
                                      {permissions.map((category) => {
                                        const allGranted = category.permissions.every(p => p.accessrights === 1);
                                        return (
                                          <Box key={category.categoryId} bg="white" borderRadius="xl" shadow="sm" overflow="hidden" border="1px solid" borderColor="gray.100">
                                            <Flex bg="gray.50" p={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100">
                                              <HStack>
                                                  <Badge colorScheme={allGranted ? "green" : "gray"} variant="solid" borderRadius="md">
                                                  CATEGORY
                                                  </Badge>
                                                <Text fontWeight="bold" color="gray.700">{category.categoryName}</Text>
                                              </HStack>
                                              <Checkbox
                                                colorScheme="cyan"
                                                isChecked={allGranted}
                                                onChange={() => {
                                                  const newAccess = allGranted ? 0 : 1;
                                                  // Optimistic UI
                                                  setPermissions(prev => prev.map(cat =>
                                                    cat.categoryId === category.categoryId
                                                      ? { ...cat, permissions: cat.permissions.map(p => ({ ...p, accessrights: newAccess })) }
                                                      : cat
                                                  ));
                                                  // Batch Update
                                                  Promise.all(category.permissions.map(perm =>
                                                    handlePermissionChange(group.id, perm.id, category.categoryId, newAccess, true)
                                                  )).then(() => {
                                                    toast({ title: "Permissions saved", status: "success", duration: 2000 });
                                                    const currentGroupId = localStorage.getItem("groupId");
                                                    if (currentGroupId && String(currentGroupId) === String(group.id)) {
                                                      refreshGlobalPermissions(currentGroupId);
                                                    }
                                                  });
                                                }}
                                              >
                                                <Text fontSize="xs" fontWeight="bold" color="cyan.600">
                                                  {allGranted ? "Remove all" : "Give all"}
                                                </Text>
                                              </Checkbox>
                                            </Flex>
                                            <Table variant="simple" size="sm">
                                              <Tbody>
                                                {category.permissions.map((perm) => (
                                                  <Tr key={perm.id} _hover={{ bg: "gray.50" }}>
                                                    <Td pl={8} py={3} fontWeight="medium" color="gray.600" width="30%">{perm.name}</Td>
                                                    <Td py={3} color="gray.400" fontSize="xs">{perm.description || "No description."}</Td>
                                                    <Td py={3} isNumeric width="10%">
                                                      <Switch
                                                        colorScheme="cyan"
                                                        isChecked={perm.accessrights === 1}
                                                        onChange={(e) => {
                                                          const newValue = e.target.checked ? 1 : 0;
                                                          setPermissions(prev => prev.map(cat =>
                                                            cat.categoryId === category.categoryId
                                                              ? { ...cat, permissions: cat.permissions.map(p => p.id === perm.id ? { ...p, accessrights: newValue } : p) }
                                                              : cat
                                                          ));
                                                          handlePermissionChange(group.id, perm.id, category.categoryId, newValue);
                                                        }}
                                                      />
                                                    </Td>
                                                  </Tr>
                                                ))}
                                              </Tbody>
                                            </Table>
                                          </Box>
                                        );
                                      })}
                                    </Stack>
                                  </Box>
                                </MotionBox>
                              </AnimatePresence>
                            </Td>
                          </Tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </Tbody>
              )}
            </Table>
          </Box>
        </Box>

        {selectedGroup && isAddingOrEditing !== "add" && (
          <MotionBox
            mt={8}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            bg={cardBg}
            borderRadius="3xl"
            shadow="sm"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "start", md: "center" }}
              gap={4}
              p={6}
              bg="cyan.50"
              borderBottom="1px solid"
              borderColor="cyan.100"
            >
              <HStack spacing={4}>
                <Box p={3} bg="white" borderRadius="xl" shadow="sm">
                  <Icon as={CheckCircle2} boxSize={6} color="cyan.500" />
                </Box>
                <Box>
                  <Heading size="md" color="gray.800">
                    Application visibility: {selectedGroup.name}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Choose which application types this group can see.
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="cyan" borderRadius="full" px={3} py={1}>
                {applicationTypes.filter((type) => Number(type.is_visible) === 1).length} of{" "}
                {applicationTypes.length} visible
              </Badge>
            </Flex>

            <Box p={6}>
              {isApplicationTypesLoading ? (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {[1, 2, 3].map((item) => (
                    <Box key={item} p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                      <Skeleton height="22px" mb={3} />
                      <SkeletonText noOfLines={2} spacing={2} />
                    </Box>
                  ))}
                </SimpleGrid>
              ) : applicationTypes.length === 0 ? (
                <Center py={12} flexDir="column">
                  <Icon as={AlertCircle} color="gray.300" boxSize={10} mb={3} />
                  <Text color="gray.500">No application types found.</Text>
                </Center>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
                  {applicationTypes.map((applicationType) => {
                    const isVisible = Number(applicationType.is_visible) === 1;
                    const isSaving = savingApplicationTypeId === applicationType.id;

                    return (
                      <Box
                        key={applicationType.id}
                        p={4}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={isVisible ? "cyan.200" : borderColor}
                        bg={isVisible ? "cyan.50" : "white"}
                        transition="all 0.2s"
                      >
                        <Flex justify="space-between" align="start" gap={3}>
                          <Box>
                            <HStack align="center">
                              <Checkbox
                                colorScheme="cyan"
                                isChecked={isVisible}
                                isDisabled={savingApplicationTypeId !== null}
                                onChange={(event) =>
                                  handleApplicationTypeVisibilityChange(
                                    applicationType,
                                    event.target.checked
                                  )
                                }
                              >
                                <Text fontWeight="bold" color="gray.800">
                                  {applicationType.name}
                                </Text>
                              </Checkbox>
                              {isSaving && <Spinner size="sm" color="cyan.500" />}
                            </HStack>
                            <Text mt={2} fontSize="sm" color="gray.500">
                              {Number(applicationType.app_count) || 0} app
                              {Number(applicationType.app_count) === 1 ? "" : "s"} in this type
                            </Text>
                          </Box>
                          <Badge colorScheme={isVisible ? "green" : "gray"} borderRadius="full">
                            {isVisible ? "Visible" : "Hidden"}
                          </Badge>
                        </Flex>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              )}
            </Box>
          </MotionBox>
        )}
      </Container>

      {/* Users Modal */}
      <Modal
        isOpen={isUserGroupModalOpen}
        onClose={() => setIsUserGroupModalOpen(false)}
        isCentered
        size="xl"
      >
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent borderRadius="3xl" overflow="hidden">
          <ModalHeader bgGradient={headerGradient} color="white" borderTopRadius="3xl">
            Group Members: {selectedGroup?.name}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={6}>
            {groupUsers.length === 0 ? (
              <Center p={10} flexDir="column">
                <Icon as={AlertCircle} color="gray.300" boxSize={10} mb={3} />
                <Text color="gray.500">No members yet.</Text>
              </Center>
            ) : (
              <Box maxHeight="400px" overflowY="auto" borderRadius="xl" border="1px solid" borderColor="gray.100">
                <Table variant="simple" size="sm">
                  <Thead bg="gray.50" position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Username or email</Th>
                      <Th>Group</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {groupUsers.map((user) => {
                      const displayName = user.personnel ? `${user.personnel.surname_husband}, ${user.personnel.givenname}` : user.fullname || "N/A";
                      return (
                        <Tr key={user.id}>
                          <Td>
                            <HStack>
                              <Avatar size="xs" name={displayName} bg="blue.100" color="blue.600" />
                              <Text fontSize="sm" fontWeight="bold">{displayName}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="xs" fontWeight="bold">{user.username}</Text>
                              <Text fontSize="xs" color="gray.500">{user.email || "No email"}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Select
                              size="xs"
                              value={user.group_id || selectedGroup?.id || ""}
                              onChange={(e) => handleGroupChange(user.id, e.target.value)}
                              borderRadius="md"
                              focusBorderColor="cyan.500"
                            >
                              {groups.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </Select>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>
          <ModalFooter bg="gray.50" p={4}>
            <Button onClick={() => setIsUserGroupModalOpen(false)} borderRadius="xl">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GroupManagement;
