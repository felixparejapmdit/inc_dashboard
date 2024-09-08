<<<<<<< HEAD
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const Admin = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(null); // To store the uploaded image
  const [status, setStatus] = useState("");

  // Handle image upload and convert to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setIcon(reader.result); // Store the Base64 string of the image
    };
    reader.readAsDataURL(file);
  };

  const handleAddApp = (e) => {
    e.preventDefault();
    const newApp = { name, url, description, icon }; // Include the icon

    // Send new app to the backend
    fetch("http://localhost:5000/api/apps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newApp),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response from server:", data);
        setStatus(`App "${name}" added successfully.`);
        setName(""); // Reset the name field
        setUrl(""); // Reset the URL field
        setDescription(""); // Reset the description field
        setIcon(null); // Reset the icon
      })
      .catch((error) => {
        console.error("Error adding app:", error);
        setStatus("Error adding app. Please try again.");
      });
  };

  // Theme colors and styles for a formal look
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
    <Box bgGradient={bgGradient} minH="100vh" p={6}>
      <Heading as="h1" mb={6} color={headingColor} textAlign="center">
        Admin - Add New Application
      </Heading>
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        maxW="400px"
        mx="auto"
      >
        <VStack as="form" spacing={6} onSubmit={handleAddApp}>
          <FormControl id="app-name" isRequired>
            <FormLabel color={formLabelColor}>App Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <FormControl id="app-url" isRequired>
            <FormLabel color={formLabelColor}>App URL</FormLabel>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <FormControl id="app-description" isRequired>
            <FormLabel color={formLabelColor}>App Description</FormLabel>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <FormControl id="app-icon">
            <FormLabel color={formLabelColor}>App Icon</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <Button
            type="submit"
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            _active={{ bg: buttonHoverBg }}
            boxShadow="md"
            width="100%"
            py={6}
          >
            Add Application
          </Button>
          {status && (
            <Text
              color={status.includes("successfully") ? "green.500" : "red.500"}
            >
              {status}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Admin;
=======
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const Admin = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(null); // To store the uploaded image
  const [status, setStatus] = useState("");

  // Handle image upload and convert to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setIcon(reader.result); // Store the Base64 string of the image
    };
    reader.readAsDataURL(file);
  };

  const handleAddApp = (e) => {
    e.preventDefault();
    const newApp = { name, url, description, icon }; // Include the icon

    // Send new app to the backend
    fetch("http://localhost:5000/api/apps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newApp),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Response from server:", data);
        setStatus(`App "${name}" added successfully.`);
        setName(""); // Reset the name field
        setUrl(""); // Reset the URL field
        setDescription(""); // Reset the description field
        setIcon(null); // Reset the icon
      })
      .catch((error) => {
        console.error("Error adding app:", error);
        setStatus("Error adding app. Please try again.");
      });
  };

  // Theme colors and styles for a formal look
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
    <Box bgGradient={bgGradient} minH="100vh" p={6}>
      <Heading as="h1" mb={6} color={headingColor} textAlign="center">
        Admin - Add New Application
      </Heading>
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        maxW="400px"
        mx="auto"
      >
        <VStack as="form" spacing={6} onSubmit={handleAddApp}>
          <FormControl id="app-name" isRequired>
            <FormLabel color={formLabelColor}>App Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <FormControl id="app-url" isRequired>
            <FormLabel color={formLabelColor}>App URL</FormLabel>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <FormControl id="app-description" isRequired>
            <FormLabel color={formLabelColor}>App Description</FormLabel>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <FormControl id="app-icon">
            <FormLabel color={formLabelColor}>App Icon</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              bg={inputBg}
              _hover={{ bg: inputHoverBg }}
              focusBorderColor="blue.400"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>
          <Button
            type="submit"
            bg={buttonBg}
            color="white"
            _hover={{ bg: buttonHoverBg }}
            _active={{ bg: buttonHoverBg }}
            boxShadow="md"
            width="100%"
            py={6}
          >
            Add Application
          </Button>
          {status && (
            <Text
              color={status.includes("successfully") ? "green.500" : "red.500"}
            >
              {status}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default Admin;
>>>>>>> eca7ff6edd729f62aa7d1be16f8396a60cc124e5
