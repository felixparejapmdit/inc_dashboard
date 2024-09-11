import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch the users from the backend API
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Data fetched is not an array");
        }
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate credentials against the fetched users
    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      // Update the `isLoggedIn` field in the backend
      fetch(`${process.env.REACT_APP_API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...user, isLoggedIn: true }),
      })
        .then((res) => {
          if (res.ok) {
            navigate("/dashboard"); // Navigate to dashboard if login successful
          } else {
            setError("Error updating login status. Try again.");
          }
        })
        .catch((err) => {
          console.error("Error updating login status:", err);
          setError("Error logging in. Please try again.");
        });
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-r, #F5F5F5, #f0f4ff)"
    >
      <Box
        bg="white"
        p={10}
        borderRadius="md"
        boxShadow="xl"
        width={["90%", "400px"]}
        position="relative"
      >
        {/* Replace Logo Placeholder with Image */}
        <Box mb={4} display="flex" justifyContent="center">
          <Image src="/apps_logo.jpg" alt="Logo" boxSize="60px" />
        </Box>

        <Heading
          as="h2"
          mb={6}
          size="lg"
          textAlign="center"
          color="#4a4a4a"
          textTransform="uppercase"
        >
          Dashboard Apps!
        </Heading>
        {/* <Text mb={6} textAlign="center" color="#8a8a8a">
          User Login
        </Text> */}

        <VStack as="form" onSubmit={handleSubmit} spacing={6}>
          <FormControl id="username" className="floating-label">
            <Input
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              bg="white"
              className="animated-input"
              focusBorderColor="#7D00FF"
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
              className="animated-input"
              focusBorderColor="#7D00FF"
              borderRadius="md"
              boxShadow="sm"
            />
            <FormLabel>Password</FormLabel>
          </FormControl>

          <Button
            type="submit"
            width="100%"
            bgGradient="linear(to-r, #1C1F33, #232946)" // Formal dark blue gradient
            color="white"
            _hover={{ bgGradient: "linear(to-r, #1B1E2D, #1F2539)" }} // Slightly darker hover gradient
            _active={{ bgGradient: "linear(to-r, #1B1E2D, #1F2539)" }} // Active state matches hover
            boxShadow="lg"
            py={6}
          >
            Log In
          </Button>

          {error && <Text color="red.500">{error}</Text>}
        </VStack>
      </Box>
    </Flex>
  );
};

export default Login;
