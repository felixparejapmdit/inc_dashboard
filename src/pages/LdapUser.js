import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  VStack,
  Alert,
  AlertIcon,
  Heading,
  Text,
} from "@chakra-ui/react";

const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  console.error("REACT_APP_API_URL is not defined in the environment.");
}

// Utility function to extract attribute values with improved handling
const getAttributeValue = (attributes, type) => {
  if (Array.isArray(attributes)) {
    const attribute = attributes.find(
      (attr) => attr.type === type || attr.name === type
    );
    if (attribute) {
      // Check both `vals` and `values` fields to handle LDAP attribute variations
      return attribute.vals
        ? attribute.vals[0]
        : attribute.values
        ? attribute.values[0]
        : "N/A";
    }
  } else if (typeof attributes === "object" && attributes[type]) {
    // Handle case where `attributes` is an object with direct key-value pairs
    return attributes[type];
  }
  return "N/A";
};

const LdapUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!API_URL) {
      setError("API URL is not defined.");
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/ldap/users`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched LDAP User Data:", data);
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <VStack justify="center" align="center" minH="100vh">
        <Spinner size="xl" />
        <Text>Loading users...</Text>
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

  return (
    <Box p={8}>
      <Heading as="h2" size="lg" mb={4}>
        LDAP Users
      </Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Given Name</Th>
              <Th>Surname</Th>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>UID Number</Th>
              <Th>GID Number</Th>
              <Th>Group Name</Th> {/* Added Group Name column */}
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{getAttributeValue(user, "givenName")}</Td>
                <Td>{getAttributeValue(user, "sn")}</Td>
                <Td>{getAttributeValue(user, "uid")}</Td>
                <Td>{getAttributeValue(user, "mail")}</Td>
                <Td>{getAttributeValue(user, "uidNumber")}</Td>
                <Td>{getAttributeValue(user, "gidNumber")}</Td>
                <Td>{user.groupName || "Unknown"}</Td>{" "}
                {/* Display Group Name */}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LdapUsers;
