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
  useColorModeValue,
  Text,
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

  // Colors and styles
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const inputBg = useColorModeValue("white", "gray.700");
  const formLabelColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.700", "white");
  const buttonBg = useColorModeValue("blue.600", "blue.500");
  const buttonHoverBg = useColorModeValue("blue.700", "blue.600");

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient={bgGradient}
    >
      <Box
        bg="white"
        p={10}
        borderRadius="md"
        boxShadow="xl"
        width={["90%", "400px"]}
      >
        <Heading
          as="h2"
          mb={6}
          size="lg"
          textAlign="center"
          color={headingColor}
          textTransform="uppercase"
        >
          Dashboard Apps
        </Heading>

        <VStack as="form" onSubmit={handleSubmit} spacing={6}>
          <FormControl id="username" className="floating-label">
            <FormLabel color={formLabelColor}>Username</FormLabel>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              bg={inputBg}
              className="animated-input"
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>

          <FormControl id="password" className="floating-label">
            <FormLabel color={formLabelColor}>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg={inputBg}
              className="animated-input"
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>

          <Button
            type="submit"
            width="100%"
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            _active={{ bg: buttonHoverBg }}
            boxShadow="md"
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
