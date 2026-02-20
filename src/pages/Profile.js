import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Avatar,
  VStack,
  useColorModeValue,
  Spinner,
  HStack,
  Divider,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
  Image,
  Tooltip,
  SimpleGrid,
  Flex,
  Card,
  CardBody,
  Badge,
  Stack,
  Container,
} from "@chakra-ui/react";
import { FaEdit, FaCamera, FaUser, FaEnvelope, FaPhone, FaBuilding, FaEye, FaLock, FaExternalLinkAlt } from "react-icons/fa";
import { getAuthHeaders } from "../utils/apiHeaders";
import { usePermissionContext } from "../contexts/PermissionContext";
import { fetchData, putDataContact } from "../utils/fetchData";
import FaceEnrollment from "../components/FaceEnrollment";

const Profile = () => {
  const { hasPermission } = usePermissionContext();
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the 2x2 Picture
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    avatar: "",
    avatarFile: null,
    contactInfo: "",
    extension: "",
  });

  // Edit Profile Modal State
  const {
    isOpen: isEditProfileOpen,
    onOpen: onEditProfileOpen,
    onClose: onEditProfileClose,
  } = useDisclosure();

  // Avatar Zoom Modal State
  const {
    isOpen: isAvatarOpen,
    onOpen: onAvatarOpen,
    onClose: onAvatarClose,
  } = useDisclosure();

  // Change Password Modal State
  const {
    isOpen: isChangePassOpen,
    onOpen: onChangePassOpen,
    onClose: onChangePassClose,
  } = useDisclosure();

  // Face Enrollment Modal State
  const {
    isOpen: isFaceEnrollOpen,
    onOpen: onFaceEnrollOpen,
    onClose: onFaceEnrollClose,
  } = useDisclosure();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");


  const toast = useToast();
  const profileRef = useRef(null);

  // --- 1. Fetch User Contacts ---
  const fetchUserContacts = async (personnelId) => {
    const TARGET_CONTACT_TYPE_ID = 5;
    if (!personnelId) return;

    const API_URL = process.env.REACT_APP_API_URL;
    try {
      const response = await fetch(
        `${API_URL}/api/personnel-contacts/pid/${personnelId}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setContacts([]);
          return;
        }
        throw new Error("Failed to fetch contacts: " + response.statusText);
      }

      const allContacts = await response.json();
      const primaryContacts = allContacts.filter(
        contact => contact.contactype_id === TARGET_CONTACT_TYPE_ID
      );

      setContacts(primaryContacts);

      if (primaryContacts.length > 0) {
        setEditUser(prev => ({
          ...prev,
          contactInfo: primaryContacts[0].contact_info,
          extension: primaryContacts[0].extension,
        }));
      } else {
        setEditUser(prev => ({
          ...prev,
          contactInfo: '',
          extension: '',
        }));
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // --- 2. Fetch User Profile Image (2x2) ---
  const fetchProfileImage = async (personnelId) => {
    if (!personnelId) return;
    setImageLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/personnel_images/2x2/${personnelId}`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const json = await response.json();
        // Logic Update: Access data.image_url (response is { success: true, data: { ... } })
        if (json.success && json.data && json.data.image_url) {
          setProfileImage(`${process.env.REACT_APP_API_URL}${json.data.image_url}`);
        }
      }
    } catch (error) {
      console.error("Error fetching profile image:", error);
    } finally {
      setImageLoading(false);
    }
  }

  // --- 3. Initial Data Fetch ---
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      setLoading(false);
      return;
    }

    fetch(
      `${process.env.REACT_APP_API_URL}/api/users/logged-in?username=${username}`,
      { headers: getAuthHeaders() }
    )
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setEditUser(prev => ({
          ...prev,
          ...data,
        }));
        setLoading(false);

        if (data.personnel_id && data.personnel_id !== "null") {
          fetchUserContacts(data.personnel_id);
          fetchProfileImage(data.personnel_id);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewUser = () => {
    // Logic for previewing user public profile
    if (user.personnel_id && user.personnel_id !== "null") {
      window.open(`/personnel-preview/${user.personnel_id}`, "_blank");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file);

      setEditUser((prev) => ({
        ...prev,
        avatarFile: file,
        avatar: previewUrl, // Set explicit preview URL
      }));
    }
  };

  // --- Save Changes Logic ---
  const handleSaveChanges = async () => {
    const isCreation = false;
    const primaryContact = contacts[0];
    const hasExistingContact = user.personnel_id && contacts.length > 0;

    // 1. Handle Extension Update
    if (!editUser.avatarFile) {
      if ((hasExistingContact && editUser.extension !== primaryContact.extension) || (!hasExistingContact && editUser.extension)) {
        try {
          const payload = {
            personnel_id: user.personnel_id,
            contactype_id: 5,
            contact_info: hasExistingContact ? primaryContact.contact_info || "Extension_Only" : "Extension_Only",
            contact_location: hasExistingContact ? primaryContact.contact_location : "",
            extension: editUser.extension,
          };
          const url = hasExistingContact
            ? `personnel-contacts/${primaryContact.id}`
            : `personnel-contacts`;

          await putDataContact(url, payload);

          toast({ title: "Success", description: "Extension updated.", status: "success", duration: 3000, isClosable: true });
          fetchUserContacts(user.personnel_id);
          onEditProfileClose();
        } catch (e) {
          toast({ title: "Error", description: "Failed to update extension.", status: "error" });
        }
      } else {
        toast({ title: "No Changes", status: "info" });
      }
      return;
    }

    // 2. Handle Image Upload (Priority)
    const formData = new FormData();
    formData.append("personnel_id", user.personnel_id);
    formData.append("type", "2x2 Picture");
    formData.append("image", editUser.avatarFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/personnel_images`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        // Update local state with new image URL
        setProfileImage(`${process.env.REACT_APP_API_URL}${result.image.image_url}`);
        toast({ title: "Success", description: "Profile picture updated.", status: "success", duration: 3000, isClosable: true });
        onEditProfileClose();
        setEditUser(prev => ({ ...prev, avatarFile: null }));
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (e) {
      console.error("Upload error:", e);
      toast({ title: "Error", description: "Failed to update profile picture.", status: "error" });
    }
  };

  // --- Password Logic ---
  const checkPasswordStrength = (p) => p.length < 6 ? "Weak" : "Strong";
  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    setPasswordStrength(checkPasswordStrength(e.target.value));
  }
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", status: "error" }); return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/ldap/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, oldPassword: currentPassword, newPassword })
      });
      if (res.ok) {
        toast({ title: "Success", status: "success" });
        onChangePassClose();
      } else {
        toast({ title: "Error", status: "error" });
      }
    } catch (e) {
      toast({ title: "Network Error", status: "error" });
    }
  }


  // --- Render ---
  // Updated gradient to match sidebar yellow #FFD559
  const bgGradient = useColorModeValue("linear(to-r, #FFD559, #FFC400)", "linear(to-r, yellow.600, orange.700)");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} py={10} px={4}>
      <Container maxW="container.lg">
        {loading ? (
          <Flex justify="center" align="center" h="50vh"><Spinner size="xl" color="#FFD559" thickness="4px" /></Flex>
        ) : (
          <VStack spacing={6}>
            {/* Header Card */}
            <Card w="full" bg={cardBg} borderRadius="2xl" boxShadow="xl" overflow="hidden">
              {/* Cover Area */}
              <Box h="150px" bgGradient={bgGradient} position="relative" />

              <CardBody pt={0}>
                <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" mt="-75px" px={6}>
                  {/* Avatar Section */}
                  <Flex direction="column" align="center">
                    <Box
                      border="4px solid white"
                      borderRadius="full"
                      boxShadow="lg"
                      bg="white"
                      p={1} // Added padding for better framing
                      cursor="pointer"
                      transition="transform 0.3s ease"
                      _hover={{ transform: "scale(1.1)", boxShadow: "2xl" }}
                      onClick={onAvatarOpen}
                      position="relative"
                    >
                      {imageLoading ? (
                        <Flex
                          w="150px"
                          h="150px"
                          borderRadius="full"
                          align="center"
                          justify="center"
                          bg="gray.100"
                        >
                          <Spinner size="lg" color="#FFD559" thickness="4px" />
                        </Flex>
                      ) : (
                        <Avatar
                          size="2xl"
                          src={profileImage || "/default-avatar.png"}
                          name={user.name}
                        />
                      )}
                    </Box>
                    <Heading size="lg" mt={4} textAlign="center">{user.name || "User"}</Heading>
                    <Text color="gray.500" fontWeight="medium">{user.username}</Text>
                    {user.personnel_id && user.personnel_id !== "null" ? (
                      <Badge colorScheme="green" mt={2} borderRadius="full" px={3} py={1}>Active Personnel</Badge>
                    ) : (
                      <Badge colorScheme="orange" mt={2} borderRadius="full" px={3} py={1}>LDAP User (Not Enrolled)</Badge>
                    )}
                  </Flex>

                  {/* Actions */}
                  <HStack spacing={4} mt={{ base: 6, md: 0 }} alignSelf={{ base: "center", md: "flex-end" }} mb={4}>
                    {user.personnel_id && user.personnel_id !== "null" && (
                      <Tooltip label="View Profile" hasArrow>
                        <IconButton
                          icon={<FaEye />}
                          colorScheme="yellow"
                          onClick={handleViewUser}
                          borderRadius="lg"
                          aria-label="View Profile"
                          size="lg"
                        />
                      </Tooltip>
                    )}

                    <Tooltip label="Edit Details" hasArrow>
                      <IconButton
                        icon={<FaEdit />}
                        colorScheme="orange"
                        onClick={onEditProfileOpen}
                        borderRadius="lg"
                        aria-label="Edit Details"
                        size="lg"
                      />
                    </Tooltip>

                    <Tooltip label="Change Password" hasArrow>
                      <IconButton
                        icon={<FaLock />}
                        colorScheme="red"
                        onClick={onChangePassOpen}
                        borderRadius="lg"
                        aria-label="Change Password"
                        size="lg"
                      />
                    </Tooltip>

                    <Tooltip label={user.personnel_id && user.personnel_id !== "null" ? "Edit Personnel" : "Enroll Now / Register Personnel"} hasArrow>
                      <IconButton
                        icon={user.personnel_id && user.personnel_id !== "null" ? <FaExternalLinkAlt /> : <FaEdit />}
                        colorScheme={user.personnel_id && user.personnel_id !== "null" ? "teal" : "blue"}
                        onClick={() => {
                          if (user.personnel_id && user.personnel_id !== "null") {
                            window.location.href = `/enroll?personnel_id=${user.personnel_id}&type=editpersonnel`;
                          } else {
                            window.location.href = `/enroll?type=new`;
                          }
                        }}
                        borderRadius="lg"
                        aria-label={user.personnel_id && user.personnel_id !== "null" ? "Edit Personnel" : "Enroll Now"}
                        size="lg"
                      />
                    </Tooltip>

                    {/* HIDDEN: Face Recognition Button
                    <Tooltip label="Face Recognition" hasArrow>
                      <IconButton
                        icon={<FaCamera />}
                        colorScheme="purple"
                        onClick={onFaceEnrollOpen}
                        borderRadius="lg"
                        aria-label="Face Recognition"
                        size="lg"
                      />
                    </Tooltip>
                    */}
                  </HStack>
                </Flex>

                <Divider my={6} />

                {/* Details Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} px={6} pb={4}>
                  <Box>
                    <Heading size="sm" color="gray.500" textTransform="uppercase" mb={4}>Contact Information</Heading>
                    <Stack spacing={4}>
                      <Flex align="center">
                        <Box as={FaEnvelope} color="blue.500" mr={3} />
                        <Box>
                          <Text fontSize="sm" color="gray.500">Email Address</Text>
                          <Text fontWeight="medium">{user.email || "N/A"}</Text>
                        </Box>
                      </Flex>
                      <Flex align="center">
                        <Box as={FaPhone} color="green.500" mr={3} />
                        <Box>
                          <Text fontSize="sm" color="gray.500">Local Extension</Text>
                          <Text fontWeight="medium">{editUser.extension || contacts[0]?.extension || "N/A"}</Text>
                        </Box>
                      </Flex>
                    </Stack>
                  </Box>
                  {/* Removed Account Details Section */}
                </SimpleGrid>
              </CardBody>
            </Card>
          </VStack>
        )}
      </Container>


      {/* --- Edit Profile Modal --- */}
      <Modal isOpen={isEditProfileOpen} onClose={onEditProfileClose} size="lg">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              {/* Avatar Upload */}
              <FormControl>
                <FormLabel textAlign="center">Profile Picture (2x2)</FormLabel>
                <Flex justify="center" direction="column" align="center">
                  <Box position="relative" mb={4}>
                    <Avatar size="2xl" src={profileImage || editUser.avatar} />
                    <IconButton
                      icon={<FaCamera />}
                      borderRadius="full"
                      colorScheme="blue"
                      position="absolute"
                      bottom={0}
                      right={0}
                      aria-label="Upload Image"
                      onClick={() => document.getElementById("avatar-upload").click()}
                    />
                    <Input
                      id="avatar-upload"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </Box>
                  <Text fontSize="xs" color="gray.500">Click camera icon to change</Text>
                </Flex>
              </FormControl>

              <Divider />

              {/* Extension Edit */}
              <FormControl>
                <FormLabel>Local Extension Number</FormLabel>
                <Input
                  name="extension"
                  value={editUser.extension || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. 101"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditProfileClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSaveChanges}>Save Changes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- Change Password Modal --- */}
      <Modal isOpen={isChangePassOpen} onClose={onChangePassClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>New Password</FormLabel>
                <Input type="password" value={newPassword} onChange={handleNewPasswordChange} />
                <Text fontSize="xs" color={passwordStrength === "Strong" ? "green.500" : "red.500"}>Strength: {passwordStrength}</Text>
              </FormControl>
              <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleChangePassword}>Update Password</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* --- Avatar Zoom Modal --- */}
      <Modal isOpen={isAvatarOpen} onClose={onAvatarClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" size="lg" zIndex="tooltip" />
          <ModalBody p={0} display="flex" justifyContent="center" alignItems="center" onClick={onAvatarClose} cursor="pointer">
            <Image
              src={profileImage || "/default-avatar.png"}
              maxH="80vh"
              borderRadius="md"
              boxShadow="2xl"
              objectFit="contain"
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* --- Face Enrollment Modal --- */}
      <FaceEnrollment
        personnelId={user.personnel_id}
        isOpen={isFaceEnrollOpen}
        onClose={onFaceEnrollClose}
      />

    </Box>
  );
};

export default Profile;
