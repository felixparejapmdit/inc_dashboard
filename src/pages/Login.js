import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import crypto from "crypto-js";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Flex,
  Text,
  Image,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import "./Login.css"; // Custom CSS for animated input effect

import { usePermissionContext } from "../contexts/PermissionContext";

const API_URL = process.env.REACT_APP_API_URL;
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const { fetchPermissions } = usePermissionContext();

  const [isPlaying, setIsPlaying] = useState(false);

  // Track Enrollment Progress
  const handleTrackProgress = async () => {
    if (!referenceNumber) {
      toast({
        title: "Error",
        description: "Please enter a valid Reference Number.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/getreference?reference_number=${referenceNumber}`
      );

      if (response.data && response.data.personnel_id) {
        const { personnel_id, enrollment_progress } = response.data;

        // Navigate to the EnrollmentForm with the appropriate step
        navigate(
          `/enroll?personnel_id=${personnel_id}&step=${enrollment_progress}`
        );
      } else {
        toast({
          title: "Not Found",
          description: "Reference number not found. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching personnel:", error);
      toast({
        title: "Error",
        description:
          "Unable to retrieve enrollment progress. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const startMusic = () => {
    const audio = document.getElementById("background-audio");
    audio.muted = false; // Unmute the audio
    audio.play(); // Play the audio
    setIsPlaying(true); // Hide the overlay
  };

  const handleEnroll = () => {
    navigate("/enroll");
  };

  // Hash the password for LDAP MD5 format
  const md5HashPassword = (password) => {
    const md5sum = crypto.MD5(password);
    return `{MD5}` + crypto.enc.Base64.stringify(md5sum);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }

    const ldapTimeout = 5000; // Set LDAP timeout to 5 seconds

    // Attempt LDAP Authentication first
    const ldapPromise = axios
      .get(`${process.env.REACT_APP_API_URL}/ldap/user/${username}`, {
        timeout: ldapTimeout,
      })
      .then(async (ldapResponse) => {
        const ldapUser = ldapResponse.data;
        const hashedPassword = md5HashPassword(password);

        if (ldapUser && ldapUser.userPassword === hashedPassword) {
          // Fetch the user ID for the local login
          const userResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users_access/${username}`
          );
          const userId = userResponse.data.id;

          // Fetch the group ID using the user ID
          const groupResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/groups/user/${userId}`
          );
          const groupId = groupResponse.data.groupId;

          // Check if the group ID exists
          if (!groupId) {
            setError(
              "User does not belong to any group. Please contact the administrator to Assign."
            );
            setIsLoading(false);
            return;
          }

          // Store user data and navigate to dashboard
          const fullName = ldapUser.cn?.[0] || "User"; // Adjust to the LDAP format
          localStorage.setItem("userFullName", fullName);
          localStorage.setItem("username", ldapUser.uid); // or response.data.user.username for local login
          localStorage.setItem("userId", userId);
          // Store the group ID in localStorage
          localStorage.setItem("groupId", groupId);
          fetchPermissions(groupId);

          navigate("/dashboard");

          // Update isLoggedIn status in the database
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
            {
              ID: ldapUser.uid?.[0], // Ensure this matches the expected ID format
              isLoggedIn: true,
            }
          );
        } else {
          throw new Error("Invalid LDAP username or password");
        }
      });
    // Fall back to local login if LDAP fails
    try {
      await ldapPromise;
    } catch (err) {
      console.error(
        "LDAP connection failed, falling back to local login:",
        err
      );

      // Attempt local login if LDAP fails
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/users/login`,
          { username, password }
        );

        if (response.data.success) {
          // Set the username for local login as well
          //const userName = response.data.user.username || "User";

          const user = response.data.user;

          const userResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users_access/${user.username}`
          );
          const userId = userResponse.data.id;

          // Fetch the group ID using the user ID
          const groupResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/groups/user/${userId}`
          );
          const groupId = groupResponse.data.groupId;

          // Check if the group ID exists
          if (!groupId) {
            setError(
              "User does not belong to any group. Please contact the administrator to Assign."
            );
            setIsLoading(false);
            return;
          }

          localStorage.setItem("userFullName", user.username);
          localStorage.setItem("username", user.username); // or response.data.user.username for local login
          localStorage.setItem("userId", userId);

          // Store the group ID in localStorage
          localStorage.setItem("groupId", groupId);
          fetchPermissions(groupId);

          navigate("/dashboard");

          // Update isLoggedIn status in the database
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
            {
              ID: user.ID,
              isLoggedIn: true,
            }
          );
        } else {
          setError("Invalid username or password");
        }
      } catch (error) {
        console.error("Error during local login:", error);
        setError("Error connecting to the server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      className="login-page" // Added a className for scoping styles
      bg="#fcdc7c"
      p={4}
    >
      {/* Add Background Music */}
      <audio id="background-audio" autoPlay loop muted>
        <source src="/music/wedding-music.mp3" type="audio/mpeg" />
      </audio>
      {/* Start Music Overlay */}
      {isPlaying && (
        <div className="music-overlay fade-out" onClick={startMusic}>
          <div className="start-button">
            <span className="play-icon">▶</span>
          </div>
        </div>
      )}

      {/* Anniversary Ribbon */}
      <div className="effects-container">
        {/* Ribbon */}
        <div className="ribbon-container">
          <div className="ribbon">
            <span className="anniversary-text">
              Happy <strong>15th Wedding</strong> Anniversary po!
            </span>
          </div>
        </div>

        <div class="heart heart-1"></div>
        <div class="heart heart-2"></div>
        <div class="heart heart-3"></div>

        {/* Falling Confetti */}
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
      </div>
      <Flex
        direction="column"
        bg="yellow.100"
        boxShadow="lg"
        borderRadius="md"
        p={8}
        width={["90%", "400px"]}
      >
        <Flex justifyContent="center" mb={4}>
          <Image src="/apps_logo.png" alt="Logo" boxSize="80px" />
        </Flex>
        <Heading as="h2" size="lg" textAlign="center" color="gray.850" mb={6}>
          PMD Portal
        </Heading>
        <VStack as="form" onSubmit={handleSubmit} spacing={5}>
          <FormControl id="username" className="floating-label" isRequired>
            <Input
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              bg="gray.50"
              color="black"
              focusBorderColor="blue.400"
              borderRadius="md"
              className="animated-input"
            />
            <FormLabel>Username</FormLabel>
          </FormControl>

          <FormControl id="password" className="floating-label" isRequired>
            <Input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="gray.50"
              color="black"
              focusBorderColor="blue.400"
              borderRadius="md"
              className="animated-input"
            />
            <FormLabel>Password</FormLabel>
          </FormControl>

          {error && <Text color="red.500">{error}</Text>}

          <Button
            type="submit"
            width="100%"
            bgGradient="linear(to-r, #FFD559, #F3C847)"
            color="white"
            _hover={{ bgGradient: "linear(to-r, #F3C847, #FFD559)" }}
            isLoading={isLoading}
            spinner={<Spinner />}
          >
            Log In
          </Button>
          <Flex direction="column" width="100%" alignItems="center">
            <Button variant="link" colorScheme="orange" onClick={handleEnroll}>
              Enroll
            </Button>
            <Text
              as="button"
              color="blue.500"
              onClick={onOpen}
              fontSize="sm"
              mt={2} // Add margin-top to create spacing between the button and text
              _hover={{ textDecoration: "underline" }}
            >
              Track your enrollment progress
            </Text>
          </Flex>
          {/* Modal for Reference Number */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Track Enrollment Progress</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isRequired>
                  <FormLabel>Reference No. / Tracking No.</FormLabel>
                  <Input
                    placeholder="Enter Tracking No."
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="yellow"
                  onClick={handleTrackProgress}
                  mr={3}
                >
                  Proceed
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Login;
