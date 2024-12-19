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
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { FiLock, FiFile } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isChangePassOpen,
    onOpen: onChangePassOpen,
    onClose: onChangePassClose,
  } = useDisclosure();
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
      `${process.env.REACT_APP_API_URL}/api/users/logged-in?username=${username}`
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
        });

        // Close the modal
        onClose();
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
        });
      });
  };

  // Change Password Logic
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "The new password and confirm password do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/users/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        userId: user.ID,
      }),
    })
      .then((response) => {
        if (response.ok) {
          toast({
            title: "Password updated",
            description: "Your password has been updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onChangePassClose();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast({
            title: "Error",
            description: "Incorrect current password or an error occurred.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error changing password:", error);
        toast({
          title: "Error changing password",
          description: "An error occurred while changing your password.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // Generate PDF for user profile
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(user.name, 10, 20);
    doc.setFontSize(14);
    doc.text(user.email, 10, 30);
    if (user.avatar) {
      doc.addImage(user.avatar, "JPEG", 150, 10, 40, 40);
    }
    doc.save(`${user.name}_Profile.pdf`);
  };

  const bgGradient = useColorModeValue(
    "linear(to-r, teal.100, green.100)",
    "linear(to-r, teal.700, green.700)"
  );
  const boxShadow = useColorModeValue("lg", "dark-lg");
  const headingColor = useColorModeValue("teal.600", "teal.300");

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
        <Spinner size="xl" color="teal.500" />
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
              {user.email ? user.email : "Email not available"}{" "}
              {/* Fallback if email is missing */}
            </Text>

            <Divider borderColor="teal.300" />

            <HStack spacing={4} mt={4} justifyContent="center">
              <IconButton
                icon={<FaEdit />}
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={onOpen}
                aria-label="Edit Profile"
              />
              <IconButton
                icon={<FiLock />}
                colorScheme="blue"
                variant="solid"
                size="md"
                display="none"
                onClick={onChangePassOpen}
                aria-label="Change Password"
              />
              <IconButton
                icon={<FiFile />}
                colorScheme="red"
                variant="solid"
                display="none"
                onClick={generatePDF}
                aria-label="Generate PDF"
              />
              {/* Add Redirect Button */}
              <Button
                colorScheme="green"
                variant="solid"
                size="md"
                onClick={() => {
                  const personnelId = user.personnel_id; // Adjust based on how personnel ID is stored in your `user` object
                  if (personnelId) {
                    window.location.href = `/enroll?personnel_id=${personnelId}`;
                  } else {
                    toast({
                      title: "Error",
                      description: "Personnel ID not found.",
                      status: "error",
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                Edit Personnel Information
              </Button>
            </HStack>
          </VStack>

          {/* Edit Profile Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={6} align="center">
                  <Image
                    boxSize="150px"
                    borderRadius="full"
                    src={
                      editUser.avatarFile
                        ? editUser.avatar // Show Base64 preview if a new file is selected
                        : `${process.env.REACT_APP_API_URL}${user.avatar}` // Otherwise, show the server URL
                    }
                    alt="User Avatar"
                  />
                  <FormControl>
                    <FormLabel>Avatar</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange} // Updates the avatar file in the state
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      name="name"
                      value={editUser.name}
                      onChange={handleInputChange}
                      disabled // Disable editing name
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      value={editUser.email}
                      onChange={handleInputChange}
                      disabled // Disable editing email
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" mr={3} onClick={handleSaveChanges}>
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Change Password Modal */}
          <Modal isOpen={isChangePassOpen} onClose={onChangePassClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Change Password</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={handleChangePassword}
                >
                  Update Password
                </Button>
                <Button variant="ghost" onClick={onChangePassClose}>
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
