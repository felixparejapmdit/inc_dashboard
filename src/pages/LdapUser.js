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

// Utility function to extract the value for a specific type
const getAttributeValue = (attributes, type) => {
  const attribute = attributes.find((attr) => attr.type === type);
  return attribute && attribute.values.length > 0 ? attribute.values[0] : "N/A";
};

const LdapUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/ldap/users") // Fetch from your API
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setUsers(data); // Set the fetched users
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
              <Th>#</Th> {/* Added for Row Number */}
              <Th>Given Name</Th>
              <Th>Surname</Th>
              <Th>Username</Th>
              <Th>Email</Th>
              <Th>UID Number</Th>
              <Th>Home Directory</Th>
              <Th>Object Classes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((userAttributes, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td> {/* Display Row Number */}
                <Td>{getAttributeValue(userAttributes, "givenName")}</Td>
                <Td>{getAttributeValue(userAttributes, "sn")}</Td>
                <Td>{getAttributeValue(userAttributes, "uid")}</Td>
                <Td>{getAttributeValue(userAttributes, "mail")}</Td>
                <Td>{getAttributeValue(userAttributes, "uidNumber")}</Td>
                <Td>{getAttributeValue(userAttributes, "homeDirectory")}</Td>
                <Td>{getAttributeValue(userAttributes, "objectClass")}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LdapUsers;
