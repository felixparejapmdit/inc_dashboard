import React, { useState, useEffect } from "react";
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
  Icon,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { FiLock } from "react-icons/fi"; // Change Password Icon

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isChangePassOpen,
    onOpen: onChangePassOpen,
    onClose: onChangePassClose,
  } = useDisclosure(); // Change Password Modal
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toast = useToast();

  // Fetch the user data (who is logged in)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((response) => response.json())
      .then((data) => {
        const loggedInUser = data.find((user) => user.isLoggedIn);
        if (loggedInUser) {
          setUser(loggedInUser);
          setEditUser(loggedInUser); // Set initial edit state
        }
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

  // Handle form submission for editing profile
  const handleSaveChanges = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editUser), // Ensure avatarUrl is included here
    })
      .then((response) => response.json())
      .then(() => {
        setUser(editUser);
        toast({
          title: "Profile updated.",
          description: "Your profile has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose(); // Close modal after saving
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        toast({
          title: "Error updating profile.",
          description: "An error occurred while updating your profile.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser((prevUser) => ({
          ...prevUser,
          avatarUrl: reader.result, // Convert image to base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
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

    // Handle avatar image file change

    // Mocking password change API request
    fetch(`${process.env.REACT_APP_API_URL}/api/users/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        userId: user.id,
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

  // Colors and effects
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
          w={["90%", "400px"]}
          bgGradient={bgGradient}
          p={8}
          borderRadius="lg"
          boxShadow={boxShadow}
          transition="all 0.3s ease"
          _hover={{ transform: "scale(1.02)" }}
        >
          <VStack spacing={6} textAlign="center">
            <Avatar size="2xl" name={user.name} src={user.avatarUrl} />
            <Heading as="h2" size="lg" color={headingColor}>
              {user.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {user.email}
            </Text>

            <Divider borderColor="teal.300" />

            <HStack spacing={4} mt={4} justifyContent="center">
              <Button
                leftIcon={<FaEdit />}
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={onOpen}
              >
                Edit Profile
              </Button>
              <Button
                leftIcon={<FiLock />}
                colorScheme="blue"
                variant="solid"
                size="md"
                onClick={onChangePassOpen} // Open Change Password Modal
              >
                Change Password
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
                <VStack spacing={4} align="center">
                  {/* Display the current avatar image */}
                  {editUser.avatarUrl && (
                    <Avatar
                      size="2xl"
                      name={editUser.name}
                      src={editUser.avatarUrl} // Use the avatarUrl to show the current avatar
                      mb={4}
                    />
                  )}

                  <FormControl>
                    <FormLabel>Avatar</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      name="name"
                      value={editUser.name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      value={editUser.email}
                      onChange={handleInputChange}
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
