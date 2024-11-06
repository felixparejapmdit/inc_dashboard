import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import crypto from "crypto-js";
import bcrypt from "bcryptjs";
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
} from "@chakra-ui/react";
import "./Login.css"; // Custom CSS for animated input effect

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

    // Attempt LDAP Authentication first
    try {
      // Attempt LDAP Authentication first
      const ldapResponse = await axios.get(
        `http://localhost:5000/ldap/user/${username}`
      );
      const ldapUser = ldapResponse.data;
      const hashedPassword = md5HashPassword(password);

      if (ldapUser && ldapUser.userPassword === hashedPassword) {
        // Store user data and navigate to dashboard
        const fullName = `${ldapUser.givenName || ""} ${
          ldapUser.sn || ""
        }`.trim();
        localStorage.setItem("userFullName", fullName);
        navigate("/dashboard");

        // Update isLoggedIn status in the database
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
          {
            ID: ldapUser.id,
            isLoggedIn: true,
          }
        );
      } else {
        setError("Invalid LDAP username or password");
      }
    } catch (err) {
      console.error(
        "LDAP connection failed, falling back to local login:",
        err
      );
      setError("LDAP server is unreachable. Attempting local login...");

      // Attempt local login if LDAP fails
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/users/login`,
          { username, password }
        );
        if (response.data.success) {
          // Set the full name for local login as well
          const fullName = response.data.user.fullName || "User";
          localStorage.setItem("userFullName", fullName);
          navigate("/dashboard");

          // Update isLoggedIn status in the database
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
            {
              ID: response.data.user.ID,
              isLoggedIn: true,
            }
          );
        } else {
          setError("Invalid username or password");
        }
      } catch (error) {
        setError("Error connecting to the server. Please try again.");
        console.error("Error during local login:", error);
      }
    }

    setIsLoading(false);
  };

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, #F5F5F5, #f0f4ff)"
      p={0}
    >
      <Flex
        width="100%"
        maxW="800px"
        height="500px"
        boxShadow="xl"
        borderRadius="md"
        overflow="hidden"
      >
        <Box
          bg="white"
          width={["100%", "50%", "50%"]}
          p={10}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box mb={4} display="flex" justifyContent="center">
            <Image src="/apps_logo.png" alt="Logo" boxSize="60px" />
          </Box>

          <Heading
            as="h2"
            mb={6}
            size="md"
            textAlign="center"
            color="#4a4a4a"
            textTransform="uppercase"
          >
            PMD Personnel Info
          </Heading>

          <VStack as="form" onSubmit={handleSubmit} spacing={6}>
            <FormControl id="username" className="floating-label">
              <Input
                type="text"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="white"
                color="black"
                className="animated-input"
                focusBorderColor="#a1a5a5"
                borderRadius="md"
                boxShadow="sm"
              />
              <FormLabel>Username</FormLabel>
            </FormControl>

            <FormControl id="password" className="floating-label">
              <Input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="white"
                color="black"
                className="animated-input"
                focusBorderColor="#a1a5a5"
                borderRadius="md"
                boxShadow="sm"
              />
              <FormLabel>Password</FormLabel>
            </FormControl>

            <Button
              type="submit"
              width="100%"
              bgGradient="linear(to-r, #1C1F33, #232946)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, #1B1E2D, #1F2539)" }}
              _active={{ bgGradient: "linear(to-r, #1B1E2D, #1F2539)" }}
              boxShadow="lg"
              py={6}
              isLoading={isLoading}
            >
              Log In
            </Button>
            <Flex alignItems="center" justifyContent="center">
              <Text fontSize="sm" color="gray.500" mr={2}>
                Don't have an account?
              </Text>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={handleEnroll}
                size="sm"
              >
                Enroll
              </Button>
            </Flex>

            {error && <Text color="red.500">{error}</Text>}
          </VStack>
        </Box>

        <Box
          width={["0", "50%", "50%"]}
          height="100%"
          display={["none", "block"]}
        >
          <Image
            src="/app-icons-image.jpg"
            alt="Applications"
            objectFit="cover"
            width="100%"
            height="100%"
            opacity={0.5}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;
