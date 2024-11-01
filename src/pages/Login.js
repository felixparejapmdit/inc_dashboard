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
  Switch,
} from "@chakra-ui/react";
import "./Login.css"; // Custom CSS for animated input effect

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useLdap, setUseLdap] = useState(false); // Toggle for LDAP login
  const navigate = useNavigate();

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

    if (useLdap) {
      // LDAP Authentication
      try {
        const res = await axios.get(
          `http://localhost:5000/ldap/user/${username}`
        );
        const user = res.data;
        const hashedPassword = md5HashPassword(password);

        if (user && user.userPassword === hashedPassword) {
          navigate("/dashboard");
        } else {
          setError("Invalid LDAP username or password");
        }
      } catch (err) {
        setError(err.response?.data?.message || "LDAP Login failed");
      }
    } else {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/users/login`,
          { username, password } // send plaintext password to the backend
        );

        if (response.data.success) {
          const userId = Number(response.data.user.ID); // Ensure ID is a number
          console.log("Logging in user with ID:", userId); // Debug log for user ID

          // Update isLoggedIn status in the database
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
            {
              ID: userId,
              isLoggedIn: true,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );

          console.log("Login status updated successfully"); // Success log
          navigate("/dashboard");
        } else {
          setError("Invalid username or password");
        }
      } catch (error) {
        setError("Error connecting to the server. Please try again.");
        console.error("Error during login:", error);
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

            <Flex alignItems="center" justifyContent="center">
              <Text mr={2}>Use LDAP Login</Text>
              <Switch
                colorScheme="teal"
                isChecked={useLdap}
                onChange={() => setUseLdap(!useLdap)}
              />
            </Flex>

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
