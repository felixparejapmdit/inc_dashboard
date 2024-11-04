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

// Utility function to extract attribute values with more detailed logging
const getAttributeValue = (attributes, type) => {
  if (Array.isArray(attributes)) {
    console.log("Attributes Array:", attributes); // Log the entire array for inspection

    const attribute = attributes.find(
      (attr) => attr.type === type || attr.name === type
    );

    if (attribute) {
      console.log(`Found attribute for type ${type}:`, attribute);
      if (attribute.vals && attribute.vals.length > 0) {
        console.log(`Returning vals[0] for ${type}:`, attribute.vals[0]);
        return attribute.vals[0];
      } else if (attribute.values && attribute.values.length > 0) {
        console.log(`Returning values[0] for ${type}:`, attribute.values[0]);
        return attribute.values[0];
      }
    } else {
      console.log(`No attribute found for type ${type}`);
    }
  } else {
    console.log("Attributes is not an array:", attributes);
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
                {/* <Td>{user.givenName}</Td> */}
                <Td>{getAttributeValue(user, "sn")}</Td>
                <Td>{getAttributeValue(user, "uid")}</Td>
                <Td>{getAttributeValue(user, "mail")}</Td>
                <Td>{getAttributeValue(user, "uidNumber")}</Td>
                <Td>{getAttributeValue(user, "gidNumber")}</Td>
                <Td>{getAttributeValue(user, "groupName")}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default LdapUsers;
