import React, { useState, useEffect } from "react";
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
  useToast,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  CheckIcon,
  AttachmentIcon,
} from "@chakra-ui/icons";
import axios from "axios";
const Step2 = () => {
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [govIDs, setGovIDs] = useState([]);

  const [contactTypes, setContactTypes] = useState([]);
  const [governmentIDs, setGovernmentIDs] = useState([]);
  const toast = useToast();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const [contactTypeRes, governmentIDRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/contact-type-info`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/government-issued-ids`),
      ]);
      setContactTypes(contactTypeRes.data || []);
      setGovernmentIDs(governmentIDRes.data || []);
    } catch (error) {
      toast({
        title: "Error loading dropdown data",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveContact = async (idx) => {
    const contact = contacts[idx];
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/personnel-contacts`,
        {
          personnel_id: "2", // Replace with actual personnel ID
          contactype_id: contact.contactType,
          contact_info: contact.contactInfo,
        }
      );
      toast({
        title: "Contact saved successfully.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({
        title: "Error saving contact.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSaveAddress = async (idx) => {
    const address = addresses[idx];
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/personnel-addresses`,
        {
          personnel_id: "2", // Replace with actual personnel ID
          address_type: address.addressType,
          name: address.name,
        }
      );
      toast({
        title: "Address saved successfully.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving address:", error);
      toast({
        title: "Error saving address.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSaveGovID = async (idx) => {
    const govID = govIDs[idx];
    const payload = {
      personnel_id: 2, // Replace with actual personnel ID
      gov_id: govID.govIDType,
      document: govID.document
        ? {
            file_name: govID.document.file_name,
            file_path: govID.document.file_path,
            uploaded_by: 1, // Replace with uploader's ID
            description: "Uploaded government ID",
            status: "active",
            expiration_date: "2024-12-31", // Replace with actual expiration date
          }
        : null,
    };

    console.log("Payload being sent:", payload); // Log the payload

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/personnel-gov-ids`,
        payload
      );
      toast({
        title: "Government ID saved successfully.",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving government ID:", error);
      toast({
        title: "Error saving government ID.",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDocumentUpload = async (idx, file) => {
    try {
      if (!file) {
        throw new Error("No file selected for upload.");
      }

      // Create FormData to include the file and other required fields
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_id", govIDs[idx]?.govIDType || ""); // Ensure govIDType exists
      formData.append("personnel_id", "2"); // Replace with actual logic to fetch personnel ID
      formData.append("description", "Uploaded document");
      formData.append("status", "active");

      // API request to upload the file
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/personnel-documents/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Log response for debugging
      console.log("Document uploaded successfully:", response.data);

      // Display success toast
      toast({
        title: "Document uploaded successfully.",
        status: "success",
        duration: 3000,
      });

      // Update the `govIDs` array to include the uploaded document info
      const updatedGovIDs = govIDs.map((id, i) =>
        i === idx ? { ...id, document: response.data.document } : id
      );
      setGovIDs(updatedGovIDs);
    } catch (error) {
      // Log and display error message
      console.error("Error uploading document:", error.message);
      toast({
        title: "Error uploading document.",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
      });
    }
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
    <Box
      width="100%"
      bg="white"
      boxShadow="lg"
      p={8}
      rounded="md"
      mt={6}
      my={85}
    >
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Box>
          <Heading as="h2" size="lg" textAlign="center" mb={6}>
            Step 3: Contact Information
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
                      {contactTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
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
                      onClick={() => handleSaveContact(idx)}
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
                      onChange={(e) =>
                        handleAddressChange(idx, "name", e.target.value)
                      }
                    />
                  </Td>
                  <Td>
                    <IconButton
                      icon={<CheckIcon />}
                      size="sm"
                      colorScheme="green"
                      mr={2}
                      onClick={() => handleSaveAddress(idx)}
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
                      {governmentIDs.map((govID) => (
                        <option key={govID.id} value={govID.id}>
                          {govID.name}
                        </option>
                      ))}
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
                      onClick={() =>
                        document.getElementById(`file-upload-${idx}`).click()
                      }
                    >
                      Upload
                    </Button>
                    <input
                      type="file"
                      id={`file-upload-${idx}`}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          console.log(
                            `File selected for idx ${idx}:`,
                            file.name
                          );
                          handleDocumentUpload(idx, file);
                        } else {
                          console.warn(`No file selected for idx ${idx}`);
                        }
                      }}
                    />

                    {id.document && (
                      <Text mt={2}>
                        <a
                          href={`${process.env.REACT_APP_API_URL}/${id.document.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {id.document.file_name}
                        </a>
                      </Text>
                    )}
                  </Td>

                  <Td>
                    <IconButton
                      icon={<CheckIcon />}
                      size="sm"
                      colorScheme="green"
                      mr={2}
                      onClick={() => handleSaveGovID(idx)}
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
      )}
    </Box>
  );
};

export default Step2;
