import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  Select,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";

const Step2 = () => {
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [govIDs, setGovIDs] = useState([]);

  const handleAddContact = () =>
    setContacts([...contacts, { contactType: "", contactInfo: "" }]);

  const handleAddAddress = () =>
    setAddresses([...addresses, { addressType: "", name: "" }]);

  const handleAddGovID = () =>
    setGovIDs([...govIDs, { govIDType: "", govIDNumber: "" }]);

  const handleContactChange = (idx, field, value) => {
    const updatedContacts = contacts.map((contact, i) =>
      i === idx ? { ...contact, [field]: value } : contact
    );
    setContacts(updatedContacts);
  };

  const handleAddressChange = (idx, field, value) => {
    const updatedAddresses = addresses.map((address, i) =>
      i === idx ? { ...address, [field]: value } : address
    );
    setAddresses(updatedAddresses);
  };

  const handleGovIDChange = (idx, field, value) => {
    const updatedGovIDs = govIDs.map((id, i) =>
      i === idx ? { ...id, [field]: value } : id
    );
    setGovIDs(updatedGovIDs);
  };

  return (
    <Box p={5}>
      <Heading mb={4}>Step 2: Contact Information</Heading>

      {/* Contacts Section */}
      <VStack align="start" spacing={4} mb={6}>
        <Text fontWeight="bold" fontSize="lg">
          Contacts:
        </Text>
        {contacts.map((contact, idx) => (
          <HStack key={idx} spacing={4} w="100%">
            <Select
              placeholder="Select Type"
              value={contact.contactType}
              onChange={(e) =>
                handleContactChange(idx, "contactType", e.target.value)
              }
            >
              <option>Facebook</option>
              <option>Instagram</option>
              <option>Cellphone</option>
              <option>Twitter</option>
              <option>Landline</option>
              {/* Add more options as needed */}
            </Select>
            <Input
              placeholder="Contact Info"
              value={contact.contactInfo}
              onChange={(e) =>
                handleContactChange(idx, "contactInfo", e.target.value)
              }
            />
          </HStack>
        ))}
        <Button onClick={handleAddContact} colorScheme="teal">
          Add Contact
        </Button>
      </VStack>

      {/* Addresses Section */}
      <VStack align="start" spacing={4} mb={6}>
        <Text fontWeight="bold" fontSize="lg">
          Addresses:
        </Text>
        {addresses.map((address, idx) => (
          <HStack key={idx} spacing={4} w="100%">
            <Select
              placeholder="Address Type"
              value={address.addressType}
              onChange={(e) =>
                handleAddressChange(idx, "addressType", e.target.value)
              }
            >
              <option>Home Address</option>
              <option>Provincial Address</option>
              <option>Work Address</option>
              {/* Add more options as needed */}
            </Select>
            <Input
              placeholder="Address"
              value={address.name}
              onChange={(e) => handleAddressChange(idx, "name", e.target.value)}
            />
          </HStack>
        ))}
        <Button onClick={handleAddAddress} colorScheme="teal">
          Add Address
        </Button>
      </VStack>

      {/* Government Issued IDs Section */}
      <VStack align="start" spacing={4}>
        <Text fontWeight="bold" fontSize="lg">
          Government Issued IDs:
        </Text>
        {govIDs.map((id, idx) => (
          <HStack key={idx} spacing={4} w="100%">
            <Select
              placeholder="Select ID Type"
              value={id.govIDType}
              onChange={(e) =>
                handleGovIDChange(idx, "govIDType", e.target.value)
              }
            >
              <option>Driver's License</option>
              <option>Passport</option>
              <option>SSS ID</option>
              <option>National ID</option>
              {/* Add more options as needed */}
            </Select>
            <Input
              placeholder="ID Number"
              value={id.govIDNumber}
              onChange={(e) =>
                handleGovIDChange(idx, "govIDNumber", e.target.value)
              }
            />
          </HStack>
        ))}
        <Button onClick={handleAddGovID} colorScheme="teal">
          Add Government ID
        </Button>
      </VStack>
    </Box>
  );
};

export default Step2;
