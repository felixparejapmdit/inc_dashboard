import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
  useColorModeValue,
  Divider,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Image,
} from "@chakra-ui/react";
import { FiEdit, FiFile } from "react-icons/fi"; // Import FiFile for default icon

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedApp, setSelectedApp] = useState(null);
  const [updatedApp, setUpdatedApp] = useState({
    name: "",
    description: "",
    url: "",
    icon: "",
  });

  // Fetch apps from the backend
  useEffect(() => {
    fetch("http://localhost:5000/api/apps")
      .then((response) => response.json())
      .then((data) => {
        setApps(data);
      })
      .catch((error) => {
        console.error("Error fetching apps:", error);
      });
  }, []);

  // Function to handle clicking on the edit icon
  const handleSettingsClick = (app) => {
    setSelectedApp(app); // Set the selected app data
    setUpdatedApp({
      name: app.name,
      description: app.description,
      url: app.url,
      icon: app.icon || "", // Handle case where icon might not exist
    });
    onOpen(); // Open the modal
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedApp((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setUpdatedApp((prev) => ({ ...prev, icon: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Function to save updated app details
  const handleSaveChanges = () => {
    const updatedAppList = apps.map((app) => {
      if (app.name === selectedApp.name) {
        return { ...app, ...updatedApp };
      }
      return app;
    });

    // Update state
    setApps(updatedAppList);

    // Send updated app to backend to update the apps.json
    fetch(`http://localhost:5000/api/apps/${selectedApp.name}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedApp),
    })
      .then((response) => response.json())
      .then(() => {
        onClose();
      })
      .catch((error) => {
        console.error("Error updating app:", error);
      });
  };

  // Define color schemes for a formal, professional look
  const colors = {
    cardBg: useColorModeValue("gray.100", "gray.800"),
    cardText: useColorModeValue("gray.700", "white"),
    cardHeader: useColorModeValue("gray.600", "gray.300"),
    cardBorder: useColorModeValue("gray.300", "gray.700"),
    headingColor: useColorModeValue("gray.700", "white"),
    buttonBg: useColorModeValue("blue.600", "blue.500"),
    buttonHoverBg: useColorModeValue("blue.700", "blue.600"),
  };

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" p={6}>
      <Heading
        as="h1"
        size="xl"
        mb={8}
        color={colors.headingColor}
        textAlign="center"
      >
        INC Application Dashboard
      </Heading>

      <SimpleGrid columns={[1, 2, 3]} spacing={8}>
        {apps.map((app, index) => (
          <AppCard
            key={index}
            app={app}
            colors={colors}
            onSettingsClick={handleSettingsClick}
          />
        ))}
      </SimpleGrid>

      {/* Modal for App Info */}
      {selectedApp && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit {selectedApp.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box>
                <Text mb={2}>App Name</Text>
                <Input
                  name="name"
                  value={updatedApp.name}
                  onChange={handleInputChange}
                  mb={4}
                  placeholder="App Name"
                />

                <Text mb={2}>Description</Text>
                <Input
                  name="description"
                  value={updatedApp.description}
                  onChange={handleInputChange}
                  mb={4}
                  placeholder="App Description"
                />

                <Text mb={2}>URL</Text>
                <Input
                  name="url"
                  value={updatedApp.url}
                  onChange={handleInputChange}
                  mb={4}
                  placeholder="App URL"
                />

                <Text mb={2}>App Icon</Text>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  mb={4}
                />
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSaveChanges}>
                Save Changes
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

const AppCard = ({ app, colors, onSettingsClick }) => (
  <VStack
    bg={colors.cardBg}
    borderRadius="lg"
    border={`1px solid ${colors.cardBorder}`}
    p={6}
    spacing={4}
    boxShadow="md"
    _hover={{ boxShadow: "lg", transform: "translateY(-5px)" }}
    transition="all 0.3s ease-in-out"
    align="flex-start"
    width="100%"
  >
    {/* Edit Icon */}
    <Box alignSelf="flex-end">
      <Icon
        as={FiEdit}
        boxSize={5}
        color={colors.cardHeader}
        cursor="pointer"
        onClick={() => onSettingsClick(app)}
      />
    </Box>

    {/* Main content */}
    <Box display="flex" alignItems="center">
      {app.icon ? (
        <Image
          src={app.icon}
          alt={`${app.name} Icon`}
          boxSize="40px"
          borderRadius="full"
          mr={4}
        />
      ) : (
        <Icon
          as={FiFile} // Default icon
          boxSize={8}
          color={colors.cardHeader}
          mr={4}
        />
      )}
      <Box>
        <Text fontSize="lg" fontWeight="bold" color={colors.cardHeader}>
          {app.name}
        </Text>
        <Text fontSize="sm" color={colors.cardText}>
          {app.description}
        </Text>
      </Box>
    </Box>

    {/* Divider */}
    <Divider />

    {/* Open App Button */}
    <Button
      as="a"
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      bg={colors.buttonBg}
      color="white"
      _hover={{ bg: colors.buttonHoverBg }}
      _active={{ bg: colors.buttonHoverBg }}
      mt={2}
      width="full"
    >
      Open {app.name}
    </Button>
  </VStack>
);
