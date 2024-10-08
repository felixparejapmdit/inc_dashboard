import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Avatar,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

const LdapUser = () => {
  const { username } = useParams(); // Capture the username from the URL params
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to track loading state
  const [error, setError] = useState(null); // State to track errors

  useEffect(() => {
    // Fetch the user details from your backend
    fetch(`http://localhost:5000/ldap/user/${username}`)
      // Corrected dynamic URL
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false); // Stop loading when data is fetched
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false); // Stop loading even if there's an error
      });
  }, [username]); // Trigger fetch when username changes

  if (loading) {
    return (
      <VStack justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
        <Text>Loading user information...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack justify="center" align="center" minH="100vh">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </VStack>
    );
  }

  if (!user) {
    return (
      <VStack justify="center" align="center" minH="100vh">
        <Text>No user data found</Text>
      </VStack>
    );
  }

  return (
    <Box p={8}>
      <VStack spacing={4} align="center">
        <Avatar
          size="2xl"
          name={user.cn}
          src={user.avatarUrl || "/default-avatar.png"}
        />
        <Heading as="h2" size="lg">
          {user.cn || "Unknown User"}
        </Heading>
        <Text fontSize="lg">{user.mail || "No email available"}</Text>
        <Text fontSize="md">Username: {user.uid || "N/A"}</Text>
        <Text fontSize="md">Department: {user.department || "N/A"}</Text>
        <Text fontSize="md">Company: {user.company || "N/A"}</Text>
      </VStack>
    </Box>
  );
};

export default LdapUser;
