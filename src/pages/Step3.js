import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
const Step3 = () => {
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [govIDs, setGovIDs] = useState([]);

  const [contactTypes, setContactTypes] = useState([]);
  const [governmentIDs, setGovernmentIDs] = useState([]);
  const toast = useToast();

  const [searchParams] = useSearchParams(); // Retrieve query parameters
  const personnelId = searchParams.get("personnel_id"); // Get personnel_id from URL

  const [loading, setLoading] = useState(true);

  // Fetch dropdown data and main table data
  useEffect(() => {
    if (!personnelId) {
      toast({
        title: "Missing Personnel ID",
        description: "Personnel ID is required to fetch data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const fetchDropdownData = async () => {
      try {
        const [contactTypeRes, governmentIDRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/contact-type-info`),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/government-issued-ids`
          ),
        ]);
        setContactTypes(contactTypeRes.data || []);
        setGovernmentIDs(governmentIDRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast({
          title: "Error loading dropdown data",
          description: "Failed to fetch dropdown options.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const fetchTableData = async () => {
      try {
        const [contactsRes, addressesRes, govIDsRes] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/get-personnel-contacts`,
            {
              params: { personnel_id: personnelId },
            }
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/personnel-addresses`,
            {
              params: { personnel_id: personnelId },
            }
          ),
          axios.get(`${process.env.REACT_APP_API_URL}/api/personnel-gov-ids`, {
            params: { personnel_id: personnelId },
          }),
        ]);

        // Update state based on fetched data or set empty if no data
        setContacts(Array.isArray(contactsRes.data) ? contactsRes.data : []);
        setAddresses(Array.isArray(addressesRes.data) ? addressesRes.data : []);
        // Initialize govIDs with disabled based on whether they have an existing ID
        const initializedGovIDs = (
          Array.isArray(govIDsRes.data) ? govIDsRes.data : []
        ).map((govID) => ({
          ...govID,
          disabled: false, // Existing IDs are editable on load
        }));

        setGovIDs(initializedGovIDs);
      } catch (error) {
        // Log error to the console but do not show toast
        console.error("Error fetching table data:", error);

        // Clear fields in case of error
        setContacts([]);
        setAddresses([]);
        setGovIDs([]);
      } finally {
        setLoading(false); // Ensure loading state is reset
      }
    };

    setLoading(true);
    fetchDropdownData();
    fetchTableData();
  }, [personnelId, toast]);

  // useEffect(() => {
  //   fetchDropdownData();
  // }, []);

  // const fetchDropdownData = async () => {
  //   setLoading(true);
  //   try {
  //     const [contactTypeRes, governmentIDRes] = await Promise.all([
  //       axios.get(`${process.env.REACT_APP_API_URL}/api/contact-type-info`),
  //       axios.get(`${process.env.REACT_APP_API_URL}/api/government-issued-ids`),
  //     ]);
  //     setContactTypes(contactTypeRes.data || []);
  //     setGovernmentIDs(governmentIDRes.data || []);
  //   } catch (error) {
  //     toast({
  //       title: "Error loading dropdown data",
  //       description: error.message,
  //       status: "error",
  //       duration: 3000,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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

  const handleSaveContact = async (idx) => {
    const contact = contacts[idx];
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/personnel-contacts`,
        {
          personnel_id: personnelId, // Replace with actual personnel ID
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
          personnel_id: personnelId, // Replace with actual personnel ID
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
      personnel_id: personnelId, // Correct personnel ID
      gov_id: govID.gov_id, // Ensure this matches the selected ID type
      gov_issued_id: govID.gov_issued_id, // Ensure this matches the input for the government-issued ID
    };

    console.log("Payload being sent:", payload); // Debugging to ensure correct data structure

    try {
      if (govID.id) {
        // Update existing government-issued ID
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/personnel-gov-ids/${govID.id}`,
          payload
        );

        // Success notification for update
        toast({
          title: "Government ID updated successfully.",
          status: "success",
          duration: 3000,
        });
      } else {
        // Create new government-issued ID
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/personnel-gov-ids`,
          payload
        );

        // Add returned ID to the row data
        const updatedGovIDs = [...govIDs];
        updatedGovIDs[idx] = { ...govID, id: response.data.id, disabled: true };
        setGovIDs(updatedGovIDs);

        // Success notification for creation
        toast({
          title: "Government ID saved successfully.",
          status: "success",
          duration: 3000,
        });
      }

      // Mark the row as disabled
      const updatedGovIDs = [...govIDs];
      updatedGovIDs[idx].disabled = true;
      setGovIDs(updatedGovIDs);
    } catch (error) {
      console.error("Error saving/updating government ID:", error);

      // Error notification
      toast({
        title: "Error saving/updating government ID.",
        description:
          error.response?.data?.error || "Failed to save/update government ID.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditGovID = (idx) => {
    const updatedGovIDs = [...govIDs];
    updatedGovIDs[idx].disabled = false; // Enable the row for editing
    setGovIDs(updatedGovIDs);
  };

  const handleGovIDChange = (idx, field, value) => {
    const updatedGovIDs = [...govIDs];
    updatedGovIDs[idx][field] = value;
    setGovIDs(updatedGovIDs);
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
              {contacts.length > 0 ? (
                contacts.map((contact, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Select
                        placeholder="Select Type"
                        value={contact.contactype_id}
                        onChange={(e) =>
                          handleContactChange(
                            idx,
                            "contactype_id",
                            e.target.value
                          )
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
                        value={contact.contact_info}
                        onChange={(e) =>
                          handleContactChange(
                            idx,
                            "contact_info",
                            e.target.value
                          )
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
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleRemoveContact(idx)}
                      />
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="3" textAlign="center">
                    No contacts available. Click "Add Contact" to create one.
                  </Td>
                </Tr>
              )}
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
              {addresses.length > 0 ? (
                addresses.map((address, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Select
                        placeholder="Address Type"
                        value={address.address_type}
                        onChange={(e) =>
                          handleAddressChange(
                            idx,
                            "address_type",
                            e.target.value
                          )
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
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleRemoveAddress(idx)}
                      />
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="3" textAlign="center">
                    No addresses available. Click "Add Address" to create one.
                  </Td>
                </Tr>
              )}
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
              {govIDs.length > 0 ? (
                govIDs.map((id, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Select
                        placeholder="Select ID Type"
                        value={id.gov_id}
                        isDisabled={id.disabled} // Disable if the row is marked as saved
                        onChange={(e) =>
                          handleGovIDChange(idx, "gov_id", e.target.value)
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
                        value={id.gov_issued_id}
                        isDisabled={id.disabled} // Disable if the row is marked as saved
                        onChange={(e) =>
                          handleGovIDChange(
                            idx,
                            "gov_issued_id",
                            e.target.value
                          )
                        }
                      />
                    </Td>
                    <Td>
                      <Button
                        leftIcon={<AttachmentIcon />}
                        size="sm"
                        colorScheme="teal"
                        isDisabled={id.disabled} // Disable if the row is marked as saved
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
                            handleDocumentUpload(idx, file);
                          }
                        }}
                      />
                    </Td>
                    <Td>
                      {id.disabled ? (
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleEditGovID(idx)}
                        />
                      ) : (
                        <IconButton
                          icon={<CheckIcon />}
                          size="sm"
                          colorScheme="green"
                          mr={2}
                          onClick={() => handleSaveGovID(idx)}
                        />
                      )}
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleRemoveGovID(idx)}
                      />
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="4" textAlign="center">
                    No government-issued IDs available. Click "Add Government
                    ID" to create one.
                  </Td>
                </Tr>
              )}
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

export default Step3;
