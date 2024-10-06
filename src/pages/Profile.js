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
  Icon,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { FiLock } from "react-icons/fi"; // Change Password Icon
import { FiFile } from "react-icons/fi"; // Change Password Icon
import jsPDF from "jspdf"; // Import jsPDF for PDF generation
import html2canvas from "html2canvas"; // Import html2canvas

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    avatarUrl: "",
    educationalBackground: [],
    workInformation: [],
    familyDetails: { spouse: {}, children: [] },
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isChangePassOpen,
    onOpen: onChangePassOpen,
    onClose: onChangePassClose,
  } = useDisclosure(); // Change Password Modal
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const toast = useToast();
  const profileRef = useRef(null); // Create a ref for the profile section

  // Fetch the user data (who is logged in)
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((response) => response.json())
      .then((data) => {
        const loggedInUser = data.find((user) => user.isLoggedIn);
        if (loggedInUser) {
          setUser(loggedInUser);
          setEditUser(loggedInUser); // Set initial edit state
        }
        setLoading(false);
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

  // Handle form submission for editing profile
  const handleSaveChanges = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editUser), // Ensure avatarUrl is included here
    })
      .then((response) => response.json())
      .then(() => {
        setUser(editUser);
        toast({
          title: "Profile updated.",
          description: "Your profile has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose(); // Close modal after saving
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        toast({
          title: "Error updating profile.",
          description: "An error occurred while updating your profile.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUser((prevUser) => ({
          ...prevUser,
          avatarUrl: reader.result, // Convert image to base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper function to add educational background
  const addEducationField = () => {
    const newEducation = { degree: "", institution: "", yearGraduated: "" };
    setEditUser((prevUser) => ({
      ...prevUser,
      educationalBackground: [...prevUser.educationalBackground, newEducation],
    }));
  };

  // Handle changes in educational background
  const handleEducationChange = (index, field, value) => {
    const updatedEducation = editUser.educationalBackground.map(
      (education, i) =>
        i === index ? { ...education, [field]: value } : education
    );
    setEditUser((prevUser) => ({
      ...prevUser,
      educationalBackground: updatedEducation,
    }));
  };

  // Helper function to add work information
  const addWorkField = () => {
    const newWork = { position: "", company: "", yearsWorked: "" };
    setEditUser((prevUser) => ({
      ...prevUser,
      workInformation: [...prevUser.workInformation, newWork],
    }));
  };

  // Handle changes in work information
  const handleWorkChange = (index, field, value) => {
    const updatedWork = editUser.workInformation.map((work, i) =>
      i === index ? { ...work, [field]: value } : work
    );
    setEditUser((prevUser) => ({ ...prevUser, workInformation: updatedWork }));
  };

  // Helper function to add family details (children or spouse)
  const addFamilyField = (type) => {
    if (type === "spouse") {
      setEditUser((prevUser) => ({
        ...prevUser,
        familyDetails: {
          ...prevUser.familyDetails,
          spouse: { name: "", age: "" },
        },
      }));
    } else if (type === "child") {
      const newChild = { name: "", age: "" };
      setEditUser((prevUser) => ({
        ...prevUser,
        familyDetails: {
          ...prevUser.familyDetails,
          children: [...prevUser.familyDetails.children, newChild],
        },
      }));
    }
  };

  // Handle changes in family details
  const handleFamilyChange = (field, value, index = null) => {
    if (field === "spouseName" || field === "spouseAge") {
      setEditUser((prevUser) => ({
        ...prevUser,
        familyDetails: {
          ...prevUser.familyDetails,
          spouse: {
            ...prevUser.familyDetails.spouse,
            [field.replace("spouse", "").toLowerCase()]: value,
          },
        },
      }));
    } else if (field === "child") {
      const updatedChildren = editUser.familyDetails.children.map((child, i) =>
        i === index ? { ...child, ...value } : child
      );
      setEditUser((prevUser) => ({
        ...prevUser,
        familyDetails: { ...prevUser.familyDetails, children: updatedChildren },
      }));
    }
  };

  // Generate PDF for user profile
  const generatePDF = () => {
    const doc = new jsPDF();

    // Add the avatar image (base64 encoded image)
    const imgWidth = 40;
    const imgHeight = 40;

    if (editUser.avatarUrl) {
      doc.addImage(editUser.avatarUrl, "JPEG", 150, 10, imgWidth, imgHeight); // Add profile picture in the top-right corner
    }

    // Name and Title
    doc.setFontSize(20);
    doc.text(editUser.name, 10, 20); // Name at the top-left
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("Software Engineer", 10, 30); // Subtitle or title under the name

    // Experience Section
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("EXPERIENCE", 10, 50);
    doc.setFontSize(12);
    editUser.workInformation.forEach((work, index) => {
      const positionY = 60 + index * 20;
      doc.text(`${work.position}`, 10, positionY);
      doc.setTextColor(100);
      doc.text(
        `${work.company} • ${work.yearsWorked} year(s)`,
        10,
        positionY + 6
      );
      doc.setTextColor(0);
    });

    // Projects Section (if any)
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("PROJECTS", 100, 50); // Projects on the right side of the page
    doc.setFontSize(12);
    const projects = ["Next Cloud", "LMS", "PV Inventory"]; // Example projects
    projects.forEach((project, index) => {
      const positionY = 60 + index * 20;
      doc.text(`${project}`, 100, positionY); // Adjust to match the layout
    });

    // Education Section
    doc.setFontSize(16);
    doc.text("EDUCATION", 10, 100);
    doc.setFontSize(12);
    editUser.educationalBackground.forEach((education, index) => {
      const positionY = 110 + index * 20;
      doc.text(`${education.degree}`, 10, positionY);
      doc.setTextColor(100);
      doc.text(
        `${education.institution} • ${education.yearGraduated}`,
        10,
        positionY + 6
      );
      doc.setTextColor(0);
    });

    // Family Details Section
    doc.setFontSize(16);
    doc.text("FAMILY DETAILS", 10, 150);
    doc.setFontSize(12);
    const familyDetails = editUser.familyDetails;
    doc.text(`Spouse: ${familyDetails.spouse.name || "N/A"}`, 10, 160);
    doc.text(`Children:`, 10, 170);
    familyDetails.children.forEach((child, index) => {
      const childPositionY = 180 + index * 10;
      doc.text(
        `- ${child.name || "N/A"}, Age: ${child.age || "N/A"}`,
        10,
        childPositionY
      );
    });

    // Save the PDF
    doc.save(`${editUser.name}_Profile.pdf`);
  };

  // Change Password Logic
  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "The new password and confirm password do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Handle avatar image file change

    // Mocking password change API request
    fetch(`${process.env.REACT_APP_API_URL}/api/users/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        userId: user.id,
      }),
    })
      .then((response) => {
        if (response.ok) {
          toast({
            title: "Password updated",
            description: "Your password has been updated successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          onChangePassClose();
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast({
            title: "Error",
            description: "Incorrect current password or an error occurred.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error changing password:", error);
        toast({
          title: "Error changing password",
          description: "An error occurred while changing your password.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  // Colors and effects
  const bgGradient = useColorModeValue(
    "linear(to-r, teal.100, green.100)",
    "linear(to-r, teal.700, green.700)"
  );
  const boxShadow = useColorModeValue("lg", "dark-lg");
  const headingColor = useColorModeValue("teal.600", "teal.300");

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
        <Spinner size="xl" color="teal.500" />
      ) : (
        <Box
          ref={profileRef} // Attach ref to the profile box
          w={["90%", "400px"]}
          bgGradient={bgGradient}
          p={8}
          borderRadius="lg"
          boxShadow={boxShadow}
          transition="all 0.3s ease"
          _hover={{ transform: "scale(1.02)" }}
        >
          <VStack spacing={6} textAlign="center">
            <Avatar size="2xl" name={user.name} src={user.avatarUrl} />
            <Heading as="h2" size="lg" color={headingColor}>
              {user.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              {user.email}
            </Text>

            <Divider borderColor="teal.300" />

            <HStack spacing={4} mt={4} justifyContent="center">
              <IconButton
                icon={<FaEdit />}
                colorScheme="teal"
                variant="solid"
                size="md"
                onClick={onOpen}
                aria-label="Edit Profile" // Provide an aria-label for accessibility
              />
              <IconButton
                icon={<FiLock />}
                colorScheme="blue"
                variant="solid"
                size="md"
                onClick={onChangePassOpen} // Open Change Password Modal
                aria-label="Change Password"
              />
              {/* Generate PDF Button */}
              <IconButton
                icon={<FiFile />}
                colorScheme="red"
                variant="solid"
                onClick={generatePDF}
                aria-label="Generate PDF"
              />
            </HStack>
          </VStack>

          {/* Edit Profile Modal */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Edit Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={6} align="center">
                  {/* Avatar */}
                  {editUser.avatarUrl && (
                    <Avatar
                      size="2xl"
                      name={editUser.name}
                      src={editUser.avatarUrl}
                      mb={4}
                      border="2px solid teal"
                      boxShadow="lg"
                    />
                  )}

                  {/* Avatar Upload */}
                  <FormControl>
                    <FormLabel>Avatar</FormLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      p={2}
                    />
                  </FormControl>

                  {/* Name and Email */}
                  <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                      name="name"
                      value={editUser.name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      name="email"
                      value={editUser.email}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  {/* Education Section */}
                  <FormControl>
                    <FormLabel>Educational Background</FormLabel>
                    {editUser.educationalBackground?.map((education, index) => (
                      <Box key={index}>
                        <Input
                          placeholder="Degree"
                          value={education.degree}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "degree",
                              e.target.value
                            )
                          }
                          mb={2}
                        />
                        <Input
                          placeholder="Institution"
                          value={education.institution}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "institution",
                              e.target.value
                            )
                          }
                          mb={2}
                        />
                        <Input
                          placeholder="Year Graduated"
                          value={education.yearGraduated}
                          onChange={(e) =>
                            handleEducationChange(
                              index,
                              "yearGraduated",
                              e.target.value
                            )
                          }
                          mb={2}
                        />
                      </Box>
                    ))}
                    <Button onClick={addEducationField}>Add Education</Button>
                  </FormControl>

                  {/* Work Information Section */}
                  <FormControl>
                    <FormLabel>Work Information</FormLabel>
                    {editUser.workInformation?.map((work, index) => (
                      <Box key={index}>
                        <Input
                          placeholder="Position"
                          value={work.position}
                          onChange={(e) =>
                            handleWorkChange(index, "position", e.target.value)
                          }
                          mb={2}
                        />
                        <Input
                          placeholder="Company"
                          value={work.company}
                          onChange={(e) =>
                            handleWorkChange(index, "company", e.target.value)
                          }
                          mb={2}
                        />
                        <Input
                          placeholder="Years Worked"
                          value={work.yearsWorked}
                          onChange={(e) =>
                            handleWorkChange(
                              index,
                              "yearsWorked",
                              e.target.value
                            )
                          }
                          mb={2}
                        />
                      </Box>
                    ))}
                    <Button onClick={addWorkField}>Add Work Information</Button>
                  </FormControl>

                  {/* Family Details Section */}
                  <FormControl>
                    <FormLabel>Family Details</FormLabel>
                    <Input
                      placeholder="Spouse Name"
                      value={editUser.familyDetails.spouse.name || ""}
                      onChange={(e) =>
                        handleFamilyChange("spouseName", e.target.value)
                      }
                      mb={2}
                    />
                    <Input
                      placeholder="Spouse Age"
                      value={editUser.familyDetails.spouse.age || ""}
                      onChange={(e) =>
                        handleFamilyChange("spouseAge", e.target.value)
                      }
                      mb={2}
                    />
                    {editUser.familyDetails.children?.map((child, index) => (
                      <Box key={index}>
                        <Input
                          placeholder="Child Name"
                          value={child.name}
                          onChange={(e) =>
                            handleFamilyChange(
                              "child",
                              { name: e.target.value },
                              index
                            )
                          }
                          mb={2}
                        />
                        <Input
                          placeholder="Child Age"
                          value={child.age}
                          onChange={(e) =>
                            handleFamilyChange(
                              "child",
                              { age: e.target.value },
                              index
                            )
                          }
                          mb={2}
                        />
                      </Box>
                    ))}
                    <Button onClick={() => addFamilyField("child")}>
                      Add Child
                    </Button>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="teal" mr={3} onClick={handleSaveChanges}>
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {/* Change Password Modal */}
          <Modal isOpen={isChangePassOpen} onClose={onChangePassClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Change Password</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </FormControl>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={handleChangePassword}
                >
                  Update Password
                </Button>
                <Button variant="ghost" onClick={onChangePassClose}>
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
