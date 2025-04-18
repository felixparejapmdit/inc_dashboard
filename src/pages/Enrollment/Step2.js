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
  Flex,
} from "@chakra-ui/react";
import {
  EditIcon,
  DeleteIcon,
  CheckIcon,
  AttachmentIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import axios from "axios";
const Step2 = () => {
  const [contacts, setContacts] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [govIDs, setGovIDs] = useState([]);

  const [contactTypes, setContactTypes] = useState([]);

  const [phoneLocations, setPhoneLocations] = useState([]);
  const [phoneDirectories, setPhoneDirectories] = useState([]);

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
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    const fetchDropdownData = async () => {
      try {
        const [
          contactTypeRes,
          governmentIDRes,
          phoneLocationsRes,
          phoneDirectoriesRes,
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/contact-type-info`),
          axios.get(
            `${process.env.REACT_APP_API_URL}/api/government-issued-ids`
          ),
          axios.get(`${process.env.REACT_APP_API_URL}/api/phonelocations`), // 📍 Contact Location
          axios.get(`${process.env.REACT_APP_API_URL}/api/phone-directory`), // ☎️ Phone Nam
        ]);
        setContactTypes(contactTypeRes.data || []);
        setGovernmentIDs(governmentIDRes.data || []);
        setPhoneLocations(phoneLocationsRes.data || []);
        setPhoneDirectories(phoneDirectoriesRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast({
          title: "Error loading dropdown data",
          description: "Failed to fetch dropdown options.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
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
        setGovIDs(Array.isArray(govIDsRes.data) ? govIDsRes.data : []);
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

  const handleAddGovID = () => {
    setGovIDs([
      ...govIDs,
      { gov_id: "", gov_issued_id: "", isEditing: true }, // New row is editable by default
    ]);
  };

  // const handleContactChange = (idx, field, value) => {
  //   const updatedContacts = contacts.map((contact, i) =>
  //     i === idx ? { ...contact, [field]: value } : contact
  //   );
  //   setContacts(updatedContacts);
  // };

  const handleContactChange = (idx, field, value) => {
    const updatedContacts = contacts.map((contact, i) => {
      if (i === idx) {
        let newValue = value;

        // Find the selected contact type
        const contactType = contactTypes.find(
          (type) => type.id == contact.contactype_id
        );

        // If the contact type is Telegram, enforce username format
        if (contactType?.name.toLowerCase() === "telegram") {
          if (!newValue.startsWith("@")) {
            newValue = "@" + newValue.replace(/^@/, ""); // Ensure @ is present
          }
        }

        return { ...contact, [field]: newValue };
      }
      return contact;
    });

    setContacts(updatedContacts);
  };

  const handleCancelEdit = (idx) => {
    setContacts((prevContacts) => {
      const contact = prevContacts[idx];

      // If contact is new (not saved yet), remove it from the list
      if (!contact.id) {
        return prevContacts.filter((_, i) => i !== idx);
      }

      // Otherwise, just cancel edit mode
      return prevContacts.map((c, i) =>
        i === idx ? { ...c, isEditing: false } : c
      );
    });
  };

  const handleAddressChange = (idx, field, value) => {
    const updatedAddresses = addresses.map((address, i) =>
      i === idx ? { ...address, [field]: value } : address
    );
    setAddresses(updatedAddresses);
  };

  const handleSaveOrUpdateContact = async (idx) => {
    const contact = contacts[idx];
    const payload = {
      personnel_id: personnelId,
      contactype_id: contact.contactype_id,
      contact_info: contact.contact_info || "-",
      contact_location: contact.contact_location || null,
      extension: contact.extension || null,
    };

    try {
      if (contact.id) {
        // **Force update even if the data is unchanged**
        console.log(
          "Updating contact with ID:",
          contact.id,
          "Payload:",
          payload
        );

        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/personnel-contacts/${contact.id}`,
          payload
        );

        toast({
          title: "Contact updated successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      } else {
        // Save new record
        console.log("Saving new contact with payload:", payload);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/personnel-contacts`,
          payload
        );
        // Assign the new ID to the record
        contact.id = response.data.id;

        toast({
          title: "Contact saved successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      }

      // Disable editing after save
      toggleEditContact(idx);
    } catch (error) {
      console.error("Error saving/updating contact:", error);

      toast({
        title: "Error saving/updating contact.",
        description:
          error.response?.data?.error || "Failed to save or update contact.",
        status: "error",
        duration: 3000,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const handleAddContact = () =>
    setContacts([
      ...contacts,
      { contactype_id: "", contact_info: "", isEditing: true },
    ]);

  const toggleEditContact = (idx) => {
    const updatedContacts = [...contacts];
    updatedContacts[idx].isEditing = !updatedContacts[idx].isEditing;
    setContacts(updatedContacts);
  };

  const handleRemoveContact = async (idx) => {
    const contact = contacts[idx];
    if (contact.id) {
      const confirmed = window.confirm(
        "Are you sure you want to delete this contact?"
      );
      if (!confirmed) return;

      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/personnel-contacts/${contact.id}`
        );
        toast({
          title: "Contact deleted successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      } catch (error) {
        console.error("Error deleting contact:", error);
        toast({
          title: "Error deleting contact.",
          description:
            error.response?.data?.error || "Failed to delete contact.",
          status: "error",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      }
    }
    // Remove contact from the state
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  const handleSaveOrUpdateAddress = async (idx) => {
    const address = addresses[idx];
    const payload = {
      personnel_id: personnelId,
      address_type: address.address_type,
      name: address.name,
    };

    try {
      if (address.id) {
        // Update existing record
        console.log(
          "Updating record with ID:",
          address.id,
          "Payload:",
          payload
        );
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/personnel-addresses/${address.id}`,
          payload
        );

        toast({
          title: "Address updated successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      } else {
        // Save new record
        console.log("Saving new record with payload:", payload);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/personnel-addresses`,
          payload
        );

        // Assign the new ID to the record
        address.id = response.data.id;

        toast({
          title: "Address saved successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      }

      // Disable editing after save
      toggleEditAddress(idx);
    } catch (error) {
      console.error("Error saving/updating address:", error);

      toast({
        title: "Error saving/updating address.",
        description:
          error.response?.data?.error || "Failed to save or update address.",
        status: "error",
        duration: 3000,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const handleAddAddress = () => {
    setAddresses([
      ...addresses,
      { address_type: "", name: "", isEditing: true }, // New row starts in editing mode
    ]);
  };

  const toggleEditAddress = (idx) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[idx].isEditing = !updatedAddresses[idx].isEditing;
    setAddresses(updatedAddresses);
  };

  const handleCancelEditAddress = (idx) => {
    setAddresses((prevAddresses) => {
      const address = prevAddresses[idx];

      // If the address is new (not saved yet), remove it from the list
      if (!address.id) {
        return prevAddresses.filter((_, i) => i !== idx);
      }

      // Otherwise, just cancel edit mode
      return prevAddresses.map((addr, i) =>
        i === idx ? { ...addr, isEditing: false } : addr
      );
    });
  };

  const handleRemoveAddress = (idx) => {
    const address = addresses[idx];
    if (address.id) {
      // Confirm before deleting existing record
      if (window.confirm("Are you sure you want to delete this address?")) {
        axios
          .delete(
            `${process.env.REACT_APP_API_URL}/api/personnel-addresses/${address.id}`
          )
          .then(() => {
            toast({
              title: "Address deleted successfully.",
              status: "success",
              duration: 3000,
              position: "bottom-left", // Position the toast on the bottom-left
            });

            // Remove from state
            const updatedAddresses = addresses.filter((_, i) => i !== idx);
            setAddresses(updatedAddresses);
          })
          .catch((error) => {
            console.error("Error deleting address:", error);
            toast({
              title: "Error deleting address.",
              description:
                error.response?.data?.error || "Failed to delete address.",
              status: "error",
              duration: 3000,
              position: "bottom-left", // Position the toast on the bottom-left
            });
          });
      }
    } else {
      // Remove unsaved row
      const updatedAddresses = addresses.filter((_, i) => i !== idx);
      setAddresses(updatedAddresses);
    }
  };

  const handleSaveOrUpdateGovID = async (idx) => {
    const govID = govIDs[idx];
    const payload = {
      personnel_id: personnelId,
      gov_id: govID.gov_id,
      gov_issued_id: govID.gov_issued_id,
    };

    try {
      if (govID.id) {
        // **Force update even if the data is unchanged**
        console.log("Updating record with ID:", govID.id, "Payload:", payload);

        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/personnel-gov-ids/${govID.id}`,
          payload
        );

        toast({
          title: "Government ID updated successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      } else {
        // Save new record
        console.log("Saving new record with payload:", payload);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/personnel-gov-ids`,
          payload
        );
        // Assign the new ID to the record
        govID.id = response.data.id;

        toast({
          title: "Government ID saved successfully.",
          status: "success",
          duration: 3000,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      }

      // Disable editing after save
      toggleEditGovID(idx);
    } catch (error) {
      console.error("Error saving/updating government ID:", error);

      toast({
        title: "Error saving/updating government ID...",
        description:
          error.response?.data?.error ||
          "Failed to save or update government ID.",
        status: "error",
        duration: 3000,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const confirmDeleteGovID = (idx) => {
    if (window.confirm("Are you sure you want to delete this government ID?")) {
      handleRemoveGovID(idx);
    }
  };

  const toggleEditGovID = (idx) => {
    const updatedGovIDs = [...govIDs];
    updatedGovIDs[idx].isEditing = !updatedGovIDs[idx].isEditing;

    // Reset fields to reflect saved data if disabling edit mode
    if (!updatedGovIDs[idx].isEditing) {
      updatedGovIDs[idx].disabled = true; // Lock the row
    }

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

      const maxSize = 2 * 1024 * 1024; // 2MB limit
      if (file.size > maxSize) {
        toast({
          title: "File size too large",
          description: "The file must be 2MB or smaller.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_id", govIDs[idx]?.govIDType || "");
      formData.append("personnel_id", personnelId); // Ensure personnel ID is used
      formData.append("description", "Uploaded document");
      formData.append("status", "active");

      console.log("Uploading document:", file.name, "Size:", file.size);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/personnel-documents/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Upload response:", response.data);

      toast({
        title: "Document uploaded successfully.",
        status: "success",
        duration: 3000,
        position: "bottom-left",
        isClosable: true,
      });

      const updatedGovIDs = govIDs.map((id, i) =>
        i === idx ? { ...id, document: response.data.document.file_name } : id
      );
      setGovIDs(updatedGovIDs);
    } catch (error) {
      console.error("Error uploading document:", error);

      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Server error occurred.",
        status: "error",
        duration: 3000,
        position: "bottom-left",
        isClosable: true,
      });
    }
  };

  const handleRemoveGovID = async (index) => {
    const govID = govIDs[index];

    if (!govID.id) {
      setGovIDs((prevGovIDs) => prevGovIDs.filter((_, idx) => idx !== index));
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this government-issued ID?"
    );
    if (!confirmed) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/personnel-gov-ids/${govID.id}`,
        { params: { personnel_id: personnelId } } // Send personnel_id as a parameter
      );

      setGovIDs((prevGovIDs) => prevGovIDs.filter((_, idx) => idx !== index));

      toast({
        title: "Government-issued ID deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    } catch (error) {
      console.error("Error deleting government-issued ID:", error);
      toast({
        title: "Error deleting government-issued ID",
        description:
          error.response?.data?.message ||
          "Failed to delete the government-issued ID.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
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
                <Th>Contact Location</Th>
                <Th>Extension</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {contacts.length > 0 ? (
                contacts.map((contact, idx) => {
                  const selectedType = contactTypes.find(
                    (type) => type.id == contact.contactype_id
                  );

                  const isTelephone =
                    selectedType?.name.toLowerCase() === "telephone";

                  // Filter phone names by selected location
                  const filteredPhones = phoneDirectories.filter(
                    (phone) => phone.location === contact.contact_location
                  );

                  return (
                    <Tr key={idx}>
                      <Td>
                        <Select
                          placeholder="Select Type"
                          value={contact.contactype_id}
                          isDisabled={!contact.isEditing}
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
                          placeholder={
                            selectedType?.name.toLowerCase() === "telephone"
                              ? "-"
                              : selectedType?.name.toLowerCase() === "telegram"
                              ? "Enter Telegram username (@username)"
                              : "Enter Contact Info"
                          }
                          value={contact.contact_info || "-"}
                          isReadOnly={
                            !contact.isEditing ||
                            selectedType?.name.toLowerCase() === "telephone"
                          }
                          onChange={(e) =>
                            handleContactChange(
                              idx,
                              "contact_info",
                              e.target.value
                            )
                          }
                        />
                      </Td>

                      {/* Contact Location (Visible only for Telephone) */}
                      <Td>
                        {isTelephone ? (
                          <Select
                            placeholder="Select Location"
                            value={contact.contact_location || ""}
                            isDisabled={!contact.isEditing}
                            onChange={(e) =>
                              handleContactChange(
                                idx,
                                "contact_location",
                                e.target.value
                              )
                            }
                          >
                            {phoneLocations.map((loc) => (
                              <option key={loc.id} value={loc.name}>
                                {loc.name}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          "—"
                        )}
                      </Td>

                      {/* Phone Name (based on selected location) */}
                      <Td>
                        {isTelephone ? (
                          <Select
                            placeholder="Select Phone"
                            value={contact.extension || ""}
                            isDisabled={!contact.isEditing}
                            onChange={(e) =>
                              handleContactChange(
                                idx,
                                "extension",
                                e.target.value
                              )
                            }
                          >
                            {filteredPhones.map((ph) => (
                              <option key={ph.id} value={ph.extension}>
                                {ph.extension}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          "—"
                        )}
                      </Td>

                      <Td>
                        <Flex>
                          <IconButton
                            icon={
                              contact.isEditing ? <CheckIcon /> : <EditIcon />
                            }
                            size="sm"
                            colorScheme={contact.isEditing ? "green" : "blue"}
                            mr={2}
                            onClick={() =>
                              contact.isEditing
                                ? handleSaveOrUpdateContact(idx)
                                : toggleEditContact(idx)
                            }
                          />
                          {contact.isEditing ? (
                            <IconButton
                              icon={<CloseIcon />}
                              size="sm"
                              colorScheme="gray"
                              onClick={() => handleCancelEdit(idx)}
                            />
                          ) : (
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleRemoveContact(idx)}
                            />
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan="5" textAlign="center">
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
                        isDisabled={!address.isEditing} // Disable unless editing
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
                        <option>INC Housing</option>
                      </Select>
                    </Td>
                    <Td>
                      <Input
                        placeholder="Street, Zone, Barangay, Town/City, Province, Country"
                        value={address.name}
                        isDisabled={!address.isEditing} // Disable unless editing
                        onChange={(e) =>
                          handleAddressChange(idx, "name", e.target.value)
                        }
                      />
                    </Td>
                    <Td>
                      <Flex>
                        {/* Save/Edit Button */}
                        <IconButton
                          icon={
                            address.isEditing ? <CheckIcon /> : <EditIcon />
                          }
                          size="sm"
                          colorScheme={address.isEditing ? "green" : "blue"}
                          mr={2}
                          onClick={() =>
                            address.isEditing
                              ? handleSaveOrUpdateAddress(idx)
                              : toggleEditAddress(idx)
                          }
                        />

                        {/* Cancel Button (Shown when Editing) */}
                        {address.isEditing ? (
                          <IconButton
                            icon={<CloseIcon />}
                            size="sm"
                            colorScheme="gray"
                            onClick={() => handleCancelEditAddress(idx)}
                          />
                        ) : (
                          /* Delete Button (Shown when NOT Editing) */
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleRemoveAddress(idx)}
                          />
                        )}
                      </Flex>
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
          <Text display="none" fontWeight="bold" fontSize="lg" mt={6} mb={2}>
            Government Issued IDs
          </Text>
          <Table display="none" variant="striped" colorScheme="teal">
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
                        isDisabled={!id.isEditing} // Disable if not in editing mode
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
                        isDisabled={!id.isEditing} // Disable if not in editing mode
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
                        rightIcon={<AttachmentIcon />}
                        size="sm"
                        colorScheme="teal"
                        isDisabled={!id.isEditing} // Disable if not in editing mode
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
                      <Flex>
                        {/* Save and Edit Button */}
                        <IconButton
                          icon={id.isEditing ? <CheckIcon /> : <EditIcon />}
                          size="sm"
                          colorScheme={id.isEditing ? "green" : "blue"}
                          onClick={() =>
                            id.isEditing
                              ? handleSaveOrUpdateGovID(idx)
                              : toggleEditGovID(idx)
                          }
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => confirmDeleteGovID(idx)}
                        />
                      </Flex>
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
          <Button
            display="none"
            onClick={handleAddGovID}
            colorScheme="teal"
            mt={4}
          >
            Add Government ID
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Step2;
