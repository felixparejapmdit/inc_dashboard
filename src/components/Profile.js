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
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    avatarUrl: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      body: JSON.stringify(editUser),
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
          p={6}
          borderRadius="lg"
          boxShadow={boxShadow}
          transition="all 0.3s ease"
          _hover={{ transform: "scale(1.02)" }}
        >
          <VStack spacing={4} textAlign="center">
            <Avatar size="2xl" name={user.name} src={user.avatarUrl} />
            <Heading as="h2" size="lg" color={headingColor}>
              {user.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {user.email}
            </Text>

            <Divider borderColor="teal.300" />

            <HStack spacing={4} mt={4}>
              <Button
                leftIcon={<FaEdit />}
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={onOpen}
              >
                Edit Profile
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
                <VStack spacing={4}>
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
                  <FormControl>
                    <FormLabel>Avatar URL</FormLabel>
                    <Input
                      name="avatarUrl"
                      value={editUser.avatarUrl}
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
        </Box>
      )}
    </Box>
  );
};

export default Profile;
