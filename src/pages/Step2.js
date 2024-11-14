import React, { useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  IconButton,
  Button,
  Text,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon, AttachmentIcon } from "@chakra-ui/icons";

const Step2 = () => {
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [govIDs, setGovIDs] = useState([]);

  const handleAddContact = () =>
    setContacts([...contacts, { contactType: "", contactInfo: "" }]);

  const handleAddAddress = () =>
    setAddresses([...addresses, { addressType: "", name: "" }]);

  const handleAddGovID = () =>
    setGovIDs([...govIDs, { govIDType: "", govIDNumber: "", document: null }]);

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

  const handleDocumentUpload = (idx, file) => {
    const updatedGovIDs = govIDs.map((id, i) =>
      i === idx ? { ...id, document: file } : id
    );
    setGovIDs(updatedGovIDs);
  };

  const handleRemoveContact = (index) => {
    setContacts(contacts.filter((_, idx) => idx !== index));
  };

  const handleRemoveAddress = (index) => {
    setAddresses(addresses.filter((_, idx) => idx !== index));
  };

  const handleRemoveGovID = (index) => {
    setGovIDs(govIDs.filter((_, idx) => idx !== index));
  };

  return (
    <Box width="100%" bg="white" boxShadow="lg" p={8} rounded="md" mt={6} my={85}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 2: Contact Information
      </Heading>

      {/* Contacts Section */}
      <Text fontWeight="bold" fontSize="lg" mt={6} mb={2}>
        Contacts
      </Text>
      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Type</Th>
            <Th>Contact Info</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {contacts.map((contact, idx) => (
            <Tr key={idx}>
              <Td>
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
                </Select>
              </Td>
              <Td>
                <Input
                  placeholder="Contact Info"
                  value={contact.contactInfo}
                  onChange={(e) =>
                    handleContactChange(idx, "contactInfo", e.target.value)
                  }
                />
              </Td>
              <Td>
                <IconButton
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  mr={2}
                />
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  colorScheme="blue"
                  mr={2}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleRemoveContact(idx)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button onClick={handleAddContact} colorScheme="teal" mt={4}>
        Add Contact
      </Button>

      {/* Addresses Section */}
      <Text fontWeight="bold" fontSize="lg" mt={6} mb={2}>
        Addresses
      </Text>
      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Address Type</Th>
            <Th>Address</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {addresses.map((address, idx) => (
            <Tr key={idx}>
              <Td>
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
                </Select>
              </Td>
              <Td>
                <Input
                  placeholder="Address"
                  value={address.name}
                  onChange={(e) => handleAddressChange(idx, "name", e.target.value)}
                />
              </Td>
              <Td>
                <IconButton
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  mr={2}
                />
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  colorScheme="blue"
                  mr={2}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleRemoveAddress(idx)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button onClick={handleAddAddress} colorScheme="teal" mt={4}>
        Add Address
      </Button>

      {/* Government Issued IDs Section */}
      <Text fontWeight="bold" fontSize="lg" mt={6} mb={2}>
        Government Issued IDs
      </Text>
      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>ID Type</Th>
            <Th>ID Number</Th>
            <Th>Document</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {govIDs.map((id, idx) => (
            <Tr key={idx}>
              <Td>
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
                </Select>
              </Td>
              <Td>
                <Input
                  placeholder="ID Number"
                  value={id.govIDNumber}
                  onChange={(e) =>
                    handleGovIDChange(idx, "govIDNumber", e.target.value)
                  }
                />
              </Td>
              <Td>
                <Button
                  leftIcon={<AttachmentIcon />}
                  size="sm"
                  colorScheme="teal"
                  onClick={() => document.getElementById(`file-upload-${idx}`).click()}
                >
                  Upload
                </Button>
                <input
                  type="file"
                  id={`file-upload-${idx}`}
                  style={{ display: "none" }}
                  onChange={(e) => handleDocumentUpload(idx, e.target.files[0])}
                />
                {id.document && <Text mt={2}>{id.document.name}</Text>}
              </Td>
              <Td>
                <IconButton
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="green"
                  mr={2}
                />
                <IconButton
                  icon={<EditIcon />}
                  size="sm"
                  colorScheme="blue"
                  mr={2}
                />
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleRemoveGovID(idx)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Button onClick={handleAddGovID} colorScheme="teal" mt={4}>
        Add Government ID
      </Button>
    </Box>
  );
};

export default Step2;
