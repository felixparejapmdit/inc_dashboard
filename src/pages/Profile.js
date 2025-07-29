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
  InputGroup,
  InputRightElement,
  InputLeftElement,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { FiLock, FiFile } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  ViewIcon,
  EditIcon,
  ExternalLinkIcon,
  ViewOffIcon,
  LockIcon,
} from "@chakra-ui/icons";
import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed
import { usePermissionContext } from "../contexts/PermissionContext";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const Profile = () => {
  const { hasPermission } = usePermissionContext(); // Correct usage
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(true);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  // Edit Profile Modal State
  const {
    isOpen: isEditProfileOpen,
    onOpen: onEditProfileOpen,
    onClose: onEditProfileClose,
  } = useDisclosure();

  // Change Password Modal State
  const {
    isOpen: isChangePassOpen,
    onOpen: onChangePassOpen,
    onClose: onChangePassClose,
  } = useDisclosure();

  // New state for controlling modal loading
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toast = useToast();
  const profileRef = useRef(null);

  // Fetch the user data (from users table)
  useEffect(() => {
    // Get the username from local storage
    const username = localStorage.getItem("username");

    if (!username) {
      console.error("Username not found in local storage.");
      setLoading(false);
      return;
    }

    console.log("Fetching profile for username:", username);

    // Fetch the user data using the username query parameter
    fetch(
      `${process.env.REACT_APP_API_URL}/api/users/logged-in?username=${username}`,
       {
          headers: getAuthHeaders(),
        }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setEditUser(data); // Set the data to editUser for editing functionality
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  // Handle input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Handle avatar image change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      // Update state to store the file for upload
      setEditUser((prevUser) => ({
        ...prevUser,
        avatarFile: file, // Store the file for backend upload
      }));

      // Generate a preview of the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser((prevUser) => ({
          ...prevUser,
          avatar: reader.result, // Base64 string for preview
        }));
      };
      reader.readAsDataURL(file); // Read the file as Base64
    }
  };

  const handleSaveChanges = () => {
    if (!editUser.avatarFile) {
      toast({
        title: "No avatar selected.",
        description: "Please select an avatar to update.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    const formData = new FormData();
    formData.append("avatar", editUser.avatarFile); // Add the file to FormData

    fetch(`${process.env.REACT_APP_API_URL}/api/users_profile/${user.ID}`, {
      method: "PUT",
      body: formData, // Send the FormData with the avatar file
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to update avatar: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Update the avatar in the local state
        setUser((prevUser) => ({
          ...prevUser,
          avatar: data.avatar, // Update with the new avatar URL
        }));

        // Show success toast notification
        toast({
          title: "Avatar updated.",
          description: "Your avatar has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });

        // ✅ Close the Edit Profile modal after success
        onEditProfileClose();
      })
      .catch((error) => {
        console.error("Error updating avatar:", error);

        // Show error toast notification
        toast({
          title: "Error updating avatar.",
          description:
            error.message || "An error occurred while updating your avatar.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      });
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.match(/[\W]/)
    )
      return "Strong";
    return "Medium";
  };

  // Handle Password Input Change
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "The new password and confirm password do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/ldap/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            oldPassword: currentPassword,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });

        // Close modal and reset fields
        onChangePassClose();

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to change password.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = useColorModeValue(
    "linear(to-b, yellow.100, orange.200)", // Light yellow to warm orange
    "linear(to-b, yellow.300, orange.400)" // Darker version for dark mode
  );

  const boxShadow = useColorModeValue("lg", "dark-lg");
  const headingColor = useColorModeValue("teal.600", "teal.300");

  const handleViewUser = (personnelId) => {
    window.open(`/personnel-preview/${personnelId}`, "_blank");
  };

  return (
    <Box
      p={8}
      bg={useColorModeValue("gray.50", "gray.800")}
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {loading ? (
        <Spinner size="xl" color="orange.500" />
      ) : (
        <Box
          ref={profileRef}
          w={["90%", "400px"]}
          bgGradient={bgGradient}
          p={8}
          borderRadius="lg"
          boxShadow={boxShadow}
        >
          <VStack spacing={6} textAlign="center">
            {/* Display current or previewed avatar */}
            <Image
              boxSize="150px"
              borderRadius="full"
              src={
                user.avatar
                  ? `${process.env.REACT_APP_API_URL}${user.avatar}`
                  : "/default-avatar.png" // Provide the path to your default avatar image
              }
              alt="User Avatar"
            />

            <Heading as="h2" size="lg" color={headingColor}>
              {user.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {user.email ? user.email : "Email not available"}
              {/* Fallback if email is missing */}
            </Text>

            <Divider borderColor="teal.300" />

            {/* Icons Section */}
            <HStack spacing={4} mt={4} justifyContent="center">
              {/* View Profile */}
              {hasPermission("profile.preview") && (
                <Tooltip
                  label={
                    !user.personnel_id
                      ? "No personnel data available. Click the Info icon to proceed."
                      : ""
                  }
                >
                  <IconButton
                    icon={<ViewIcon />}
                    mr={2}
                    colorScheme="yellow"
                    onClick={() =>
                      window.open(
                        `/personnel-preview/${user.personnel_id}`,
                        "_blank"
                      )
                    }
                    isDisabled={!user.personnel_id}
                  />
                </Tooltip>
              )}
              {/* Edit Profile */}
              {hasPermission("profile.edit") && (
                <IconButton
                  icon={<FaEdit />}
                  colorScheme="orange"
                  size="md"
                  onClick={onEditProfileOpen}
                  aria-label="Edit Profile"
                />
              )}
              {/* Change Password */}
              {hasPermission("profile.changepassword") && (
                <IconButton
                  icon={<FiLock />}
                  colorScheme="red"
                  size="md"
                  onClick={onChangePassOpen}
                  aria-label="Change Password"
                />
              )}

              {/* Update Info */}
              {hasPermission("profile.info") && (
                <IconButton
                  icon={<ExternalLinkIcon />}
                  colorScheme="teal"
                  variant="solid"
                  size="md"
                  aria-label="Update Info"
                  onClick={() => {
                    const personnelId = user.personnel_id;
                    if (personnelId) {
                      window.location.href = `/enroll?personnel_id=${personnelId}&step=${user.enrollment_progress}&type=editprofile`;
                    } else {
                      window.location.href = `/enroll?not_enrolled=${user.username}&type=editprofile`;
                    }
                  }}
                />
              )}
            </HStack>
          </VStack>

          {/* Edit Profile Modal */}
          <Modal isOpen={isEditProfileOpen} onClose={onEditProfileClose}>
            <ModalOverlay />
            <ModalContent bg="yellow.50">
              <ModalHeader color="orange.600">Edit Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={6} align="center">
                  {/* User Avatar Preview */}
                  <Image
                    boxSize="150px"
                    borderRadius="full"
                    src={
                      editUser.avatarFile
                        ? editUser.avatar // Show Base64 preview if a new file is selected
                        : user.avatar
                        ? `${process.env.REACT_APP_API_URL}${user.avatar}` // Use avatar URL if available
                        : "/default-avatar.png" // Provide fallback default avatar
                    }
                    alt="User Avatar"
                  />

                  {/* Upload New Avatar */}
                  <FormControl>
                    <FormLabel>Avatar</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange} // Updates the avatar file in the state
                    />
                  </FormControl>

                  {/* Name Field (Read-Only) */}
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      name="name"
                      value={editUser.name}
                      onChange={handleInputChange}
                      isReadOnly // Keeps the name field disabled
                    />
                  </FormControl>

                  {/* Email Field (Read-Only) */}
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      value={editUser.email}
                      onChange={handleInputChange}
                      isReadOnly // Keeps the email field disabled
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="orange" mr={3} onClick={handleSaveChanges}>
                  Save Changes
                </Button>
                <Button
                  colorScheme="yellow"
                  mr={3}
                  onClick={onEditProfileClose}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal
            isOpen={isChangePassOpen}
            onClose={onChangePassClose}
            isCentered
            size="md"
          >
            <ModalOverlay />
            <ModalContent
              borderRadius="lg"
              boxShadow="xl"
              p={6}
              bg="yellow.100" // Light yellow background like login form
            >
              <ModalHeader
                fontSize="xl"
                fontWeight="bold"
                textAlign="center"
                color="gray.800"
              >
                Change Password
              </ModalHeader>
              <ModalCloseButton />

              <ModalBody>
                <VStack spacing={4}>
                  {/* Current Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.700">
                      Current Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <LockIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        bg="white"
                      />
                    </InputGroup>
                  </FormControl>

                  {/* New Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.700">
                      New Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <LockIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        bg="white"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={
                            showNewPassword ? <ViewOffIcon /> : <ViewIcon />
                          }
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* Confirm Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.700">
                      Confirm New Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <LockIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        bg="white"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={
                            showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                          }
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button
                  bg="orange.400"
                  color="white"
                  _hover={{ bg: "orange.500" }}
                  w="full"
                  size="lg"
                  onClick={handleChangePassword}
                  borderRadius="full"
                >
                  Update Password
                </Button>
                <Button
                  onClick={onChangePassClose}
                  colorScheme="yellow"
                  mr={3}
                  color="white"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
