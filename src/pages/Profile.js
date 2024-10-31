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
    fetch(`${process.env.REACT_APP_API_URL}/api/users/logged-in`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
        setEditUser(data);
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
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser((prevUser) => ({
          ...prevUser,
          avatar: reader.result, // Convert image to base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const formData = new FormData();
    formData.append("name", editUser.name);
    formData.append("email", editUser.email);
    formData.append("username", editUser.username);

    // Include avatar if it has been updated (base64 string or file)
    if (editUser.avatarUrl && typeof editUser.avatarUrl !== "string") {
      formData.append("avatar", editUser.avatarUrl);
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.ID}`, {
      method: "PUT",
      body: formData,
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
        onClose();
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
            <Avatar size="2xl" name={user.name} src={user.avatar} />
            <Heading as="h2" size="lg" color={headingColor}>
              {user.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {user.email}
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
                onClick={onChangePassOpen}
                aria-label="Change Password"
              />
              <IconButton
                icon={<FiFile />}
                colorScheme="red"
                variant="solid"
                onClick={generatePDF}
                aria-label="Generate PDF"
              />
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
                  <Avatar
                    size="2xl"
                    name={editUser.name}
                    src={editUser.avatar}
                    mb={4}
                  />
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
