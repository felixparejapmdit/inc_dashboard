import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Fetch the users.json file
  useEffect(() => {
    fetch("/users.json") // Assuming users.json is in the public folder
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate credentials against the fetched JSON
    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      navigate("/dashboard"); // Navigate to dashboard if valid
    } else {
      setError("Invalid username or password");
    }
  };

  // Colors and styles for a formal look
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputHoverBg = useColorModeValue("gray.100", "gray.600");
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
          <FormControl id="username">
            <FormLabel color={formLabelColor}>Username</FormLabel>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>

          <FormControl id="password">
            <FormLabel color={formLabelColor}>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
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
