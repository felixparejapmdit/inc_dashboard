import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Avatar,
  VStack,
  useColorModeValue,
  Spinner,
  HStack,
  Divider,
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
  Image,
  Tooltip,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Icon,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { FiLock, FiFile } from "react-icons/fi";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  ViewIcon,
  EditIcon,
  ExternalLinkIcon,
  ViewOffIcon,
  LockIcon,
  AddIcon,
  PhoneIcon, // Import PhoneIcon for the new field
} from "@chakra-ui/icons";
import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed
import { usePermissionContext } from "../contexts/PermissionContext";

import { fetchData, postData, putData, putDataContact, deleteData } from "../utils/fetchData";

const Profile = () => {
  const { hasPermission } = usePermissionContext(); // Correct usage
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
   const [contacts, setContacts] = useState([]); // NEW STATE for contacts
  const [loading, setLoading] = useState(true);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    avatar: "",
    contactInfo: "", // NEW FIELD for editing contact
  });

  // Assuming this helper function is defined elsewhere in your Profile.js file
const renderAvatarSrc = (editUser, user, API_URL) => {
    return editUser.avatarFile
        ? editUser.avatar 
        : user.avatar
        ? `${API_URL}${user.avatar}`
        : "/default-avatar.png";
};

  // Edit Profile Modal State
  const {
    isOpen: isEditProfileOpen,
    onOpen: onEditProfileOpen,
    onClose: onEditProfileClose,
  } = useDisclosure();

  // Change Password Modal State
  const {
    isOpen: isChangePassOpen,
    onOpen: onChangePassOpen,
    onClose: onChangePassClose,
  } = useDisclosure();

  // Add state for the "Add Extension" modal
const {
    isOpen: isAddExtensionOpen,
    onOpen: onAddExtensionOpen,
    onClose: onAddExtensionClose,
} = useDisclosure();

  // New state for controlling modal loading
  const [isModalLoading, setIsModalLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toast = useToast();
  const profileRef = useRef(null);

// Function to fetch user contact data
const fetchUserContacts = async (personnelId) => {
  // Define the target contact type ID
  const TARGET_CONTACT_TYPE_ID = 5;

  if (!personnelId) return;

  try {
    // ... (API fetch logic remains unchanged) ...
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/personnel-contacts/pid/${personnelId}`,
      { headers: getAuthHeaders() }
    );
    
    if (!response.ok) {
        if (response.status === 404) {
            setContacts([]);
            return;
        }
        throw new Error("Failed to fetch contacts: " + response.statusText);
    }
    
    const allContacts = await response.json();
    
    // Filter the array to find only the contact(s) with contactype_id = 5
    const primaryContacts = allContacts.filter(
        contact => contact.contactype_id === TARGET_CONTACT_TYPE_ID
    );
    
    setContacts(primaryContacts); 
    
    // Set the primary contact info using the filtered array
    if (primaryContacts.length > 0) {
      setEditUser(prev => ({
        ...prev,
        contactInfo: primaryContacts[0].contact_info,
        // CRITICAL FIX: Store the extension in the editUser state
        extension: primaryContacts[0].extension, 
      }));
    } else {
        // Clear both contactInfo and extension if no primary contacts are returned
        setEditUser(prev => ({
            ...prev,
            contactInfo: '',
            extension: '', // CRITICAL FIX: Clear extension as well
        }));
    }
  } catch (error) {
    console.error("Error fetching user contacts:", error.message);
  }
};

  // Fetch the user data (from users table)
  useEffect(() => {
    // Get the username from local storage
    const username = localStorage.getItem("username");

    if (!username) {
      console.error("Username not found in local storage.");
      setLoading(false);
      return;
    }

    console.log("Fetching profile for username:", username);

    // Fetch the user data using the username query parameter
    fetch(
      `${process.env.REACT_APP_API_URL}/api/users/logged-in?username=${username}`,
       {
          headers: getAuthHeaders(),
        }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        return response.json();
      })
         .then((data) => {
        setUser(data);
        setEditUser(prev => ({ 
            ...data, 
            contactInfo: prev.contactInfo || '', // Preserve contactInfo if already fetched
        })); 
        setLoading(false);

        // --- NEW: Fetch Contacts after fetching user data ---
        if (data.personnel_id) {
            fetchUserContacts(data.personnel_id);
        }
        // ---------------------------------------------------
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      });
  }, []);

  // Handle input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Handle avatar image change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      // Update state to store the file for upload
      setEditUser((prevUser) => ({
        ...prevUser,
        avatarFile: file, // Store the file for backend upload
      }));

      // Generate a preview of the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser((prevUser) => ({
          ...prevUser,
          avatar: reader.result, // Base64 string for preview
        }));
      };
      reader.readAsDataURL(file); // Read the file as Base64
    }
  };

  // const handleSaveChanges = () => {
  //   if (!editUser.avatarFile) {
  //     toast({
  //       title: "No avatar selected.",
  //       description: "Please select an avatar to update.",
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //       position: "bottom-left", // Position the toast on the bottom-left
  //     });
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("avatar", editUser.avatarFile); // Add the file to FormData

  //   fetch(`${process.env.REACT_APP_API_URL}/api/users_profile/${user.ID}`, {
  //     method: "PUT",
  //     body: formData, // Send the FormData with the avatar file
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`Failed to update avatar: ${response.statusText}`);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       // Update the avatar in the local state
  //       setUser((prevUser) => ({
  //         ...prevUser,
  //         avatar: data.avatar, // Update with the new avatar URL
  //       }));

  //       // Show success toast notification
  //       toast({
  //         title: "Avatar updated.",
  //         description: "Your avatar has been updated successfully.",
  //         status: "success",
  //         duration: 3000,
  //         isClosable: true,
  //         position: "bottom-left", // Position the toast on the bottom-left
  //       });

  //       // ✅ Close the Edit Profile modal after success
  //       onEditProfileClose();
  //     })
  //     .catch((error) => {
  //       console.error("Error updating avatar:", error);

  //       // Show error toast notification
  //       toast({
  //         title: "Error updating avatar.",
  //         description:
  //           error.message || "An error occurred while updating your avatar.",
  //         status: "error",
  //         duration: 3000,
  //         isClosable: true,
  //         position: "bottom-left", // Position the toast on the bottom-left
  //       });
  //     });
  // };

  // const handleSaveChanges = async () => {
  //   if (!editUser.avatarFile) {
  //     // Logic for updating JUST the contact info (since other fields are read-only)
  //     if (user.personnel_id && contacts.length > 0 && editUser.contactInfo !== contacts[0].contact_info) {
  //       try {
  //         const primaryContactId = contacts[0].id;
  //         const updatedContactData = {
  //           personnel_id: user.personnel_id,
  //           contactype_id: contacts[0].contactype_id, // Keep original type
  //           contact_info: editUser.contactInfo,
  //           contact_location: contacts[0].contact_location,
  //           extension: contacts[0].extension,
  //         };
          
  //         await putData(`/api/personnel-contacts/${primaryContactId}`, updatedContactData);

  //         toast({ title: "Profile updated.", description: "Contact info updated successfully.", status: "success", duration: 3000, isClosable: true, position: "bottom-left" });
  //         fetchUserContacts(user.personnel_id); // Re-fetch contacts
  //         onEditProfileClose();
  //         return;
  //       } catch (error) {
  //          toast({ title: "Error", description: "Failed to update contact info.", status: "error", duration: 3000, isClosable: true, position: "bottom-left" });
  //          console.error("Contact update error:", error);
  //          return;
  //       }
  //     }
  //      toast({ title: "No changes", description: "No avatar selected and no change in contact info.", status: "info", duration: 3000, isClosable: true, position: "bottom-left" });
  //      return;
  //   }
    
  //   // Original avatar upload logic
  //   const formData = new FormData();
  //   formData.append("avatar", editUser.avatarFile); 

  //   fetch(`${process.env.REACT_APP_API_URL}/api/users_profile/${user.ID}`, {
  //     method: "PUT",
  //     body: formData, 
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`Failed to update avatar: ${response.statusText}`);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       setUser((prevUser) => ({
  //         ...prevUser,
  //         avatar: data.avatar, 
  //       }));
  //       toast({ title: "Avatar updated.", status: "success", duration: 3000, isClosable: true, position: "bottom-left" });
  //       onEditProfileClose(); 
  //     })
  //     .catch((error) => {
  //       console.error("Error updating avatar:", error);
  //       toast({ title: "Error updating avatar.", description: error.message || "An error occurred while updating your avatar.", status: "error", duration: 3000, isClosable: true, position: "bottom-left" });
  //     });
  // };

const handleSaveChanges1 = async () => {
    // 1. Check if an avatar file has been selected for upload
    if (!editUser.avatarFile) {
        
        // --- LOGIC FOR UPDATING EXTENSION ---
        if (
            user.personnel_id && 
            contacts.length > 0 && 
            editUser.extension !== contacts[0].extension
        ) {
            try {
                const primaryContactId = contacts[0].id;
                const updatedContactData = {
                    personnel_id: user.personnel_id,
                    contactype_id: contacts[0].contactype_id, 
                    contact_info: contacts[0].contact_info,
                    contact_location: contacts[0].contact_location,
                    extension: editUser.extension, 
                };
                
             // assuming putData prepends REACT_APP_API_URL without a trailing slash.
                await putDataContact(`personnel-contacts/${primaryContactId}`, updatedContactData); 
                
                toast({ 
                    title: "Profile updated.", 
                    description: "Extension updated successfully.", 
                    status: "success", 
                    duration: 3000, 
                    isClosable: true, 
                    position: "bottom-left" 
                });
                
                fetchUserContacts(user.personnel_id); // Re-fetch data to update UI
                onEditProfileClose();
                return; 
            } catch (error) {
                toast({ 
                    title: "Error", 
                    description: "Failed to update extension.", 
                    status: "error", 
                    duration: 3000, 
                    isClosable: true, 
                    position: "bottom-left" 
                });
                console.error("Extension update error:", error);
                return;
            }
        }
        
        // If no avatar selected and no change in extension was detected
        toast({ 
            title: "No changes", 
            description: "No avatar selected and no change in extension.", 
            status: "info", 
            duration: 3000, 
            isClosable: true, 
            position: "bottom-left" 
        });
        return; 
    }
    
    // --- ORIGINAL AVATAR UPLOAD LOGIC (Runs if editUser.avatarFile exists) ---
    const formData = new FormData();
    formData.append("avatar", editUser.avatarFile); 

    fetch(`${process.env.REACT_APP_API_URL}/api/users_profile/${user.ID}`, {
        method: "PUT",
        body: formData, 
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to update avatar: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setUser((prevUser) => ({
          ...prevUser,
          avatar: data.avatar, 
        }));
        toast({ title: "Avatar updated.", status: "success", duration: 3000, isClosable: true, position: "bottom-left" });
        onEditProfileClose(); 
      })
      .catch((error) => {
        console.error("Error updating avatar:", error);
        toast({ title: "Error updating avatar.", description: error.message || "An error occurred while updating your avatar.", status: "error", duration: 3000, isClosable: true, position: "bottom-left" });
      });
};


const handleSaveChanges2 = async () => {
    // Check if the primary contact record exists
    const primaryContact = contacts[0];
    const hasContact = user.personnel_id && contacts.length > 0;

    // --- LOGIC 1: UPDATING EXTENSION (Highest Priority if no avatar is selected) ---
    // If no avatar file is selected, check if the extension has changed.
    if (!editUser.avatarFile) {
        
        if (hasContact && editUser.extension !== primaryContact.extension) {
            try {
                const primaryContactId = primaryContact.id;
                
                const updatedContactData = {
                    // Send required fields, ensuring they are not null/undefined
                    personnel_id: user.personnel_id, 
                    contactype_id: primaryContact.contactype_id, 
                    contact_info: primaryContact.contact_info || "N/A", // DEFENSE: Send "N/A" if original is null
                    contact_location: primaryContact.contact_location,
                    extension: editUser.extension, 
                };
                
                // Use the dedicated putDataContact for JSON update
                await putDataContact(`personnel-contacts/${primaryContactId}`, updatedContactData);

                toast({
    title: "Profile updated.",
    description: "Extension updated successfully.",
    status: "success",
    duration: 3000,
    isClosable: true,
    position: "bottom-left"
});
                fetchUserContacts(user.personnel_id); // Re-fetch data
                onEditProfileClose();
                return;
            } catch (error) {
                // ... (error handling remains unchanged)
                console.error("Extension update error:", error?.response?.data || error); // Better error logging
                toast({ title: "Error", description: "Failed to update contact data. Check API/Payload.", status: "error", duration: 3000, isClosable: true, position: "bottom-left" });
                return;
            }
        }
        
        // If execution reaches here, it means no avatar was selected AND the extension wasn't changed.
        toast({ 
            title: "No changes", 
            description: "No avatar selected and no change in extension was detected.", 
            status: "info", 
            duration: 3000, 
            isClosable: true, 
            position: "bottom-left" 
        });
        return; 
    }
    
    // --- LOGIC 2: UPLOADING AVATAR (If editUser.avatarFile exists) ---
    const formData = new FormData();
    formData.append("avatar", editUser.avatarFile); 

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users_profile/${user.ID}`, {
            method: "PUT",
            body: formData, 
        });

        if (!response.ok) { 
            throw new Error(`Failed to update avatar: ${response.statusText}`); 
        }

        const data = await response.json();

        setUser((prevUser) => ({
            ...prevUser,
            avatar: data.avatar, 
        }));
        
        toast({ 
            title: "Avatar updated.", 
            description: "Your avatar has been updated successfully.", 
            status: "success", 
            duration: 3000, 
            isClosable: true, 
            position: "bottom-left" 
        });
        
        onEditProfileClose(); 

    } catch (error) {
        console.error("Error updating avatar:", error);
        toast({ 
            title: "Error updating avatar.", 
            description: error.message || "An error occurred while updating your avatar.", 
            status: "error", 
            duration: 3000, 
            isClosable: true, 
            position: "bottom-left" 
        });
    }
};

// NOTE: Assuming this function signature is used: handleSaveChanges(isCreation = false)

const handleSaveChanges = async (isCreation = false) => {
    const primaryContact = contacts[0];
    const hasExistingContact = user.personnel_id && contacts.length > 0;
    
    // Determine if the action is valid
    const isUpdateNeeded = hasExistingContact && editUser.extension !== primaryContact.extension;
    const isCreationNeeded = isCreation && user.personnel_id && editUser.extension;
    
    // --- LOGIC 1: UPDATING/CREATING EXTENSION ---
    // This block handles both PUT (update) and POST (create) requests.
    if (!editUser.avatarFile) {
        
        if (isUpdateNeeded || isCreationNeeded) {
            try {
                // Determine the API method and path
                const apiMethod = isCreationNeeded ? postData : putDataContact;
                const apiPath = isCreationNeeded 
                    ? `personnel-contacts` // POST: Requires the full base path
                    : `personnel-contacts/${primaryContact.id}`; // PUT: Requires ID path
                
                // Define the common payload for both actions
                const payload = {
                    personnel_id: user.personnel_id, 
                    contactype_id: 5, // Hardcoded for Primary Contact Type (from previous logic)
                    
                    // CRITICAL: For PUT, use the existing contact_info; for POST, use a safe default
                    contact_info: hasExistingContact 
                        ? primaryContact.contact_info || "Extension_Only"
                        : "Extension_Only",
                        
                    contact_location: hasExistingContact ? primaryContact.contact_location : "",
                    extension: editUser.extension, // The new/updated value
                };

                // Execute POST or PUT
                await apiMethod(apiPath, payload);
                
                // Success feedback
                toast({
                    title: "Success!",
                    description: `Extension has been successfully ${isCreationNeeded ? 'added' : 'updated'}.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom-left"
                });
                
                fetchUserContacts(user.personnel_id); // Re-fetch data to update UI/state
                onEditProfileClose();
                onAddExtensionClose(); // Close the appropriate modal
                return;
            } catch (error) {
                // Failure feedback
                console.error("Extension update/create error:", error?.response?.data || error); 
                toast({ 
                    title: "Error", 
                    description: `Failed to ${isCreationNeeded ? 'add' : 'update'} extension. Check API/Payload.`, 
                    status: "error", 
                    duration: 4000, 
                    isClosable: true, 
                    position: "bottom-left" 
                });
                return; 
            }
        }
        
        // If execution reaches here, it means no avatar was selected AND no changes were detected.
        toast({ 
            title: "No changes", 
            description: "No avatar selected and no change in extension was detected.", 
            status: "info", 
            duration: 3000, 
            isClosable: true, 
            position: "bottom-left" 
        });
        return; 
    }
    
    // --- LOGIC 2: UPLOADING AVATAR (If editUser.avatarFile exists) ---
    const formData = new FormData();
    formData.append("avatar", editUser.avatarFile); 

    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users_profile/${user.ID}`, {
            method: "PUT",
            body: formData, 
        });

        if (!response.ok) { 
            throw new Error(`Failed to update avatar: ${response.statusText}`); 
        }

        const data = await response.json();

        setUser((prevUser) => ({
            ...prevUser,
            avatar: data.avatar, 
        }));
        
        toast({ 
            title: "Avatar updated.", 
            description: "Your avatar has been updated successfully.", 
            status: "success", 
            duration: 3000, 
            isClosable: true, 
            position: "bottom-left" 
        });
        
        onEditProfileClose(); 

    } catch (error) {
        console.error("Error updating avatar:", error);
        toast({ 
            title: "Error updating avatar.", 
            description: error.message || "An error occurred while updating your avatar.", 
            status: "error", 
            duration: 3000, 
            isClosable: true, 
            position: "bottom-left" 
        });
    }
};

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.match(/[\W]/)
    )
      return "Strong";
    return "Medium";
  };

  // Handle Password Input Change
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "The new password and confirm password do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/ldap/change-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user.username,
            oldPassword: currentPassword,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });

        // Close modal and reset fields
        onChangePassClose();

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordStrength("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to change password.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } finally {
      setLoading(false);
    }
  };

  const bgGradient = useColorModeValue(
    "linear(to-b, yellow.100, orange.200)", // Light yellow to warm orange
    "linear(to-b, yellow.300, orange.400)" // Darker version for dark mode
  );

  const boxShadow = useColorModeValue("lg", "dark-lg");
  const headingColor = useColorModeValue("teal.600", "teal.300");

  const handleViewUser = (personnelId) => {
    window.open(`/personnel-preview/${personnelId}`, "_blank");
  };

  return (
    <Box
      p={8}
      bg={useColorModeValue("gray.50", "gray.800")}
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      {loading ? (
        <Spinner size="xl" color="orange.500" />
      ) : (
        <Box
          ref={profileRef}
          w={["90%", "400px"]}
          bgGradient={bgGradient}
          p={8}
          borderRadius="lg"
          boxShadow={boxShadow}
        >
          <VStack spacing={6} textAlign="center">
            {/* Display current or previewed avatar */}
            <Image
              boxSize="150px"
              borderRadius="full"
              src={
                user.avatar
                  ? `${process.env.REACT_APP_API_URL}${user.avatar}`
                  : "/default-avatar.png" // Provide the path to your default avatar image
              }
              alt="User Avatar"
            />

            <Heading as="h2" size="lg" color={headingColor}>
              {user.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {user.email ? user.email : "Email not available"}
              {/* Fallback if email is missing */}
            </Text>
{/* --- NEW: Display EXTENSION or ADD ICON --- */}
<HStack spacing={2} mt={-4} justifyContent="center" alignItems="center">
    <Icon as={PhoneIcon} color="teal.500" />
    
    {/* Conditional Display Logic */}
    {contacts.length > 0 && contacts[0].extension ? (
        // Case 1: Primary Contact Record EXISTS AND extension is NOT null/empty, display it
        <Text fontSize="lg" color="gray.600">
            Ext: {contacts[0].extension}
        </Text>
    ) : (
        // Case 2: Primary Contact Record is missing (contacts.length === 0) 
        // OR the extension is empty/null, show the Add/Edit button.
        <Button 
            size="sm" 
            variant="ghost" 
            colorScheme="teal" 
            leftIcon={<AddIcon />}
            // CRITICAL FIX: Determine which modal to open based on whether a record exists
            onClick={contacts.length > 0 ? onEditProfileOpen : onAddExtensionOpen}
            isDisabled={!user.personnel_id}
        >
            {contacts.length > 0 ? "Edit Extension" : "Add Extension"}
        </Button>
    )}
</HStack>
{/* ------------------------------------------ */}
            <Divider borderColor="teal.300" />

            {/* Icons Section */}
            <HStack spacing={4} mt={4} justifyContent="center">
              {/* View Profile */}
              {hasPermission("profile.preview") && (
                <Tooltip
                  label={
                    !user.personnel_id
                      ? "No personnel data available. Click the Info icon to proceed."
                      : ""
                  }
                >
                  <IconButton
                    icon={<ViewIcon />}
                    mr={2}
                    colorScheme="yellow"
                    onClick={() =>
                      window.open(
                        `/personnel-preview/${user.personnel_id}`,
                        "_blank"
                      )
                    }
                    isDisabled={!user.personnel_id}
                  />
                </Tooltip>
              )}
              {/* Edit Profile */}
              {hasPermission("profile.edit") && (
                <IconButton
                  icon={<FaEdit />}
                  colorScheme="orange"
                  size="md"
                  onClick={onEditProfileOpen}
                  aria-label="Edit Profile"
                />
              )}
              {/* Change Password */}
              {hasPermission("profile.changepassword") && (
                <IconButton
                  icon={<FiLock />}
                  colorScheme="red"
                  size="md"
                  onClick={onChangePassOpen}
                  aria-label="Change Password"
                />
              )}

              {/* Update Info */}
              {hasPermission("profile.info") && (
                <IconButton
                  icon={<ExternalLinkIcon />}
                  colorScheme="teal"
                  variant="solid"
                  size="md"
                  aria-label="Update Info"
                  onClick={() => {
                    const personnelId = user.personnel_id;
                    if (personnelId) {
                      window.location.href = `/enroll?personnel_id=${personnelId}&step=${user.enrollment_progress}&type=editprofile`;
                    } else {
                      window.location.href = `/enroll?not_enrolled=${user.username}&type=editprofile`;
                    }
                  }}
                />
              )}
            </HStack>
          </VStack>

<Modal isOpen={isAddExtensionOpen} onClose={onAddExtensionClose} isCentered>
    <ModalOverlay />
    <ModalContent bg="yellow.50" borderRadius="lg" boxShadow="xl" p={4}>
        <ModalHeader color="teal.600">Add Extension</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
            <VStack spacing={4}>
                <Text fontSize="sm" color="gray.600">
                    You do not have a primary contact record. Please add your extension.
                </Text>

                <FormControl isRequired>
                    <FormLabel>Extension Number</FormLabel>
                    <InputGroup>
                        <InputLeftElement pointerEvents='none'>
                            <PhoneIcon color='gray.500' />
                        </InputLeftElement>
                        <Input
                            name="extension" 
                            // The value should be bound to the state field being edited
                            value={editUser.extension || ''} 
                            onChange={handleInputChange} 
                            placeholder="e.g., 1234 or N/A"
                        />
                    </InputGroup>
                </FormControl>
            </VStack>
        </ModalBody>
        
        <ModalFooter>
            <Button 
                colorScheme="teal" 
                mr={3} 
                // CRITICAL: Call handleSaveChanges and pass 'true' for creation
                onClick={() => handleSaveChanges(true)} 
                // Disable if the field is empty
                isDisabled={!editUser.extension}
            >
                Add Extension
            </Button>
            <Button 
                onClick={onAddExtensionClose}
                colorScheme="yellow"
            >
                Cancel
            </Button>
        </ModalFooter>
    </ModalContent>
</Modal>

{/* Edit Profile Modal */}
<Modal isOpen={isEditProfileOpen} onClose={onEditProfileClose}>
  <ModalOverlay />
  <ModalContent bg="yellow.50">
    <ModalHeader color="orange.600">Edit Profile</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <VStack spacing={6} align="center">
        
        {/* User Avatar Preview */}
        <Image
          boxSize="150px"
          borderRadius="full"
          src={renderAvatarSrc(editUser, user, process.env.REACT_APP_API_URL)}
          alt="User Avatar"
        />

        {/* Upload New Avatar */}
        <FormControl>
          <FormLabel>Avatar</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange} // Updates the avatar file in the state
          />
        </FormControl>

        {/* Name Field (Read-Only) */}
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            value={editUser.name}
            onChange={handleInputChange}
            isReadOnly 
          />
        </FormControl>

        {/* Email Field (Read-Only) */}
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            value={editUser.email}
            onChange={handleInputChange}
            isReadOnly 
          />
        </FormControl>

        {/* --- NEW: Extension Field (Editable) --- */}
        <FormControl>
          <FormLabel>Extension Number</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <PhoneIcon color='gray.500' />
            </InputLeftElement>
            <Input
              // Binds to the 'extension' field in editUser state
              name="extension" 
              value={editUser.extension} 
              onChange={handleInputChange} 
              placeholder="Primary Extension"
              // Disable if user lacks permission OR if no contact record exists
              isDisabled={!hasPermission("profile.edit") || contacts.length === 0} 
            />
          </InputGroup>
          <Text fontSize="xs" color="gray.500" mt={1}>
            *Only the primary extension is editable here.
          </Text>
        </FormControl>
        {/* ------------------------------------- */}

      </VStack>
    </ModalBody>
    <ModalFooter>
      <Button 
        colorScheme="orange" 
        mr={3} 
        // We pass 'false' to indicate this is an update, not a creation
        onClick={() => handleSaveChanges(false)}
      >
        Save Changes
      </Button>
      <Button
        colorScheme="yellow"
        mr={3}
        onClick={onEditProfileClose}
      >
        Cancel
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

          <Modal
            isOpen={isChangePassOpen}
            onClose={onChangePassClose}
            isCentered
            size="md"
          >
            <ModalOverlay />
            <ModalContent
              borderRadius="lg"
              boxShadow="xl"
              p={6}
              bg="yellow.100" // Light yellow background like login form
            >
              <ModalHeader
                fontSize="xl"
                fontWeight="bold"
                textAlign="center"
                color="gray.800"
              >
                Change Password
              </ModalHeader>
              <ModalCloseButton />

              <ModalBody>
                <VStack spacing={4}>
                  {/* Current Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.700">
                      Current Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <LockIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        bg="white"
                      />
                    </InputGroup>
                  </FormControl>

                  {/* New Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.700">
                      New Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <LockIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        bg="white"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={
                            showNewPassword ? <ViewOffIcon /> : <ViewIcon />
                          }
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  {/* Confirm Password */}
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" color="gray.700">
                      Confirm New Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <LockIcon color="gray.500" />
                      </InputLeftElement>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        bg="white"
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          icon={
                            showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />
                          }
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button
                  bg="orange.400"
                  color="white"
                  _hover={{ bg: "orange.500" }}
                  w="full"
                  size="lg"
                  onClick={handleChangePassword}
                  borderRadius="full"
                >
                  Update Password
                </Button>
                <Button
                  onClick={onChangePassClose}
                  colorScheme="yellow"
                  mr={3}
                  color="white"
                >
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </Box>
  );
};

export default Profile;
