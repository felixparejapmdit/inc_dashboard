import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Avatar,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", avatarUrl: "" });

  // Fetch the user data (who is logged in)
  useEffect(() => {
    fetch("/users.json")
      .then((response) => response.json())
      .then((data) => {
        const loggedInUser = data.find((user) => user.isLoggedIn); // Assuming your users.json contains an `isLoggedIn` flag
        setUser(loggedInUser);
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  return (
    <Box p={8} bg={useColorModeValue("gray.50", "gray.800")} minH="100vh">
      <VStack spacing={4}>
        <Avatar size="xl" name={user.name} src={user.avatarUrl} />
        <Heading as="h2">{user.name}</Heading>
        <Text>{user.email}</Text>
      </VStack>
    </Box>
  );
};

export default Profile;
