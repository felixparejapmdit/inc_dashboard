// src/pages/progress/Photoshoot.js
import React, { useState, useRef, useEffect } from "react";
// import { useSearchParams } from "react-router-dom"; // Unused
import {
  VStack,
  Box,
  Image,
  Text,
  Button,
  IconButton,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Heading,
  useToast,
  Container,
  Card,
  CardBody,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  StepIcon,
  StepNumber,
  useSteps,
  Center,
  Stack,
  Badge,
  Flex,
  Icon,
  SimpleGrid,
  Tooltip,
} from "@chakra-ui/react";
import { BsUpload, BsCheckCircleFill } from "react-icons/bs";
import { MdPhotoCamera, MdDelete, MdCloudUpload, MdSave } from "react-icons/md";
import { fetchDataPhotoshoot, deleteData } from "../../utils/fetchData"; // Keeping original imports

const API_URL = process.env.REACT_APP_API_URL;

const Photoshoot = ({ personnel, onSaveImage }) => {
  // --- State Management ---
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [images, setImages] = useState({
    "2x2 Picture": null,
    "Half Body Picture": null,
    "Full Body Picture": null,
  });
  const [isDragOver, setIsDragOver] = useState(false);


  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();

  const personnelId = personnel?.personnel_id;

  // --- Stepper Configuration ---
  const steps = [
    { title: "2x2 Picture", description: "Headshot" },
    { title: "Half Body", description: "Upper body" },
    { title: "Full Body", description: "Full view" },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  // Map activeStep index to Step Label string expected by backend
  const getStepLabel = (index) => {
    // Exact mapping to backend "type" field
    const labels = ["2x2 Picture", "Half Body Picture", "Full Body Picture"];
    return labels[index];
  }

  // --- Effects ---
  useEffect(() => {
    if (!personnelId) return;

    fetchDataPhotoshoot(
      personnelId,
      (data) => {
        // console.log("Photoshoot Data:", data); // Debug log
        if (Array.isArray(data)) {
          const imagesByType = {};

          data.forEach((img) => {
            if (img.type && img.image_url) {
              // Ensure we handle potential legacy types if they differ, though current schema is "Picture" suffix
              imagesByType[img.type] = `${API_URL}${img.image_url}`;
            }
          });

          setImages({
            "2x2 Picture": imagesByType["2x2 Picture"] || null,
            "Half Body Picture": imagesByType["Half Body Picture"] || null,
            "Full Body Picture": imagesByType["Full Body Picture"] || null,
          });
        }
      },
      (err) => {
        console.error("Error fetching images:", err);
        toast({
          title: "Error loading images",
          description: "Could not fetch existing photos.",
          status: "error",
          duration: 3000,
        });
      },
      "Failed to fetch personnel images"
    );
  }, [personnelId, toast]);


  // --- Helper Functions ---

  // Convert Base64 to File
  const dataURLtoFile = (dataUrl, filename) => {
    try {
      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.includes(",")) {
        return null;
      }
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error converting data URL:", error);
      return null;
    }
  };

  const readFileAsBase64 = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target.result);
    reader.readAsDataURL(file);
  };

  // --- Handlers ---

  const handleNext = () => {
    const currentLabel = getStepLabel(activeStep);
    // User can proceed if valid image exists from DB OR they have a new unsaved image pending (though best practice is to save first)
    // Actually, original logic forced upload to exist before next.
    // Let's check if there is an image for this step either in `images` state or just uploaded `image` state (but `image` state is transient).
    // Original logic: "Move to next step only if image is uploaded" (meaning saved to DB? or just present?)
    // "Upload required" toast suggests it checks `images[currentLabel]`.

    if (!images[currentLabel] && !image) {
      toast({
        title: "Photo required",
        description: "Please upload and save a photo for this step before proceeding.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Identify if user has unsaved changes
    if (image) {
      toast({
        title: "Unsaved changes",
        description: "Please save your current image before moving to the next step.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      setImage(null); // Clear transient image
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      setImage(null);
    }
  };

  const handleSaveImage = async () => {
    if (!image) {
      toast({
        title: "No image selected",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const currentLabel = getStepLabel(activeStep);

    if (!currentLabel) {
      toast({ title: "Error", description: "Invalid step selected.", status: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("personnel_id", personnelId);
    formData.append("type", currentLabel);

    const fileData = dataURLtoFile(image, `${Date.now()}.png`);
    if (!fileData) {
      toast({ title: "Image processing failed", status: "error" });
      return;
    }
    formData.append("image", fileData);

    try {
      const response = await fetch(
        `${API_URL}/api/personnel_images`,
        { method: "POST", body: formData }
      );
      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `${currentLabel} saved successfully!`,
          status: "success",
          duration: 3000,
        });

        // Update local state - Add timestamp to force image refresh
        const newImageUrl = `${API_URL}${result.image.image_url}?t=${Date.now()}`;

        setImages((prev) => ({
          ...prev,
          [currentLabel]: newImageUrl,
        }));
        setImage(null); // Clear upload preview
      } else {
        throw new Error(result.message || "Failed to save.");
      }
    } catch (err) {
      toast({
        title: "Error saving",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // --- Drag & Drop ---
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      readFileAsBase64(file);
    } else {
      toast({ title: "Invalid file", description: "Please drop an image file.", status: "error" });
    }
  };

  // --- Camera ---
  const openCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      toast({ title: "Camera Error", description: "Cannot access camera.", status: "error" });
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (canvasRef.current && videoRef.current) {
      const vid = videoRef.current;
      const cvs = canvasRef.current;
      cvs.width = vid.videoWidth;
      cvs.height = vid.videoHeight;
      cvs.getContext("2d").drawImage(vid, 0, 0);
      setImage(cvs.toDataURL("image/png"));
      closeCamera();
    }
  };

  return (
    <Container maxW="container.lg" py={6}>
      <VStack spacing={8} w="full">

        {/* Header */}
        <Heading size="lg" textAlign="center" bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
          Photoshoot Session
        </Heading>

        {/* Stepper Navigation */}
        <Stepper index={activeStep} w="full" colorScheme="blue" size={["sm", "md", "lg"]} flexWrap="wrap">
          {steps.map((step, index) => (
            <Step key={index} onClick={() => setActiveStep(index)} style={{ cursor: "pointer" }}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0" display={{ base: "none", md: "block" }}>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {/* Main Content Card */}
        <Card w="full" variant="outline" boxShadow="md" borderRadius="xl">
          <CardBody>
            <Stack direction={{ base: "column", md: "row" }} spacing={8} align="center" justify="center">

              {/* Left Side: Current Saved Image */}
              <VStack spacing={3}>
                <Text fontWeight="semibold" color="gray.600">Current Saved Photo</Text>
                <Box
                  w="250px" h="300px"
                  border="1px solid" borderColor="gray.200"
                  borderRadius="lg"
                  overflow="hidden"
                  bg="gray.50"
                  position="relative"
                >
                  {images[getStepLabel(activeStep)] ? (
                    <Image
                      src={images[getStepLabel(activeStep)]}
                      w="full" h="full" objectFit="contain"
                    />
                  ) : (
                    <Center h="full" flexDirection="column" color="gray.400">
                      <MdPhotoCamera size={40} />
                      <Text fontSize="sm" mt={2}>No saved photo</Text>
                    </Center>
                  )}
                  {images[getStepLabel(activeStep)] && (
                    <Badge position="absolute" top={2} right={2} colorScheme="green">
                      Saved
                    </Badge>
                  )}
                </Box>
              </VStack>

              {/* Divider for Mobile */}
              <Box display={{ base: "block", md: "none" }} w="full" h="1px" bg="gray.200" />

              {/* Right Side: Upload/Capture Area */}
              <VStack spacing={4} w="full" maxW="400px">
                <Text fontWeight="semibold" color="blue.600">
                  {image ? "Previewing New Photo" : `Upload New ${steps[activeStep].title}`}
                </Text>

                {/* Drag & Drop Zone */}
                <Box
                  w="full" h="300px"
                  border="2px dashed"
                  borderColor={isDragOver ? "blue.500" : "gray.300"}
                  bg={isDragOver ? "blue.50" : "white"}
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ borderColor: "blue.400", bg: "gray.50" }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                  position="relative"
                  overflow="hidden"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      if (e.target.files[0]) readFileAsBase64(e.target.files[0]);
                    }}
                  />

                  {image ? (
                    <Image src={image} w="full" h="full" objectFit="contain" />
                  ) : (
                    <>
                      <Icon as={MdCloudUpload} w={10} h={10} color="gray.400" mb={3} />
                      <Text fontWeight="medium" color="gray.600">Click or Drag Image Here</Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>Supports PNG, JPG, WEBP</Text>
                    </>
                  )}
                </Box>

                {/* Action Buttons */}
                <SimpleGrid columns={2} spacing={3} w="full">
                  <Tooltip label="Open Camera" hasArrow>
                    <IconButton
                      icon={<MdPhotoCamera size={24} />}
                      onClick={openCamera}
                      colorScheme="purple"
                      variant="outline"
                      aria-label="Open Camera"
                      w="full"
                    />
                  </Tooltip>
                  {image ? (
                    <Button
                      leftIcon={<MdSave />}
                      colorScheme="blue"
                      onClick={handleSaveImage}
                      isLoading={false} // Add loading state if needed
                    >
                      Save Photo
                    </Button>
                  ) : (
                    <Tooltip label="Select Image File" hasArrow>
                      <IconButton
                        icon={<BsUpload size={20} />}
                        onClick={() => fileInputRef.current.click()}
                        variant="outline"
                        aria-label="Upload File"
                        w="full"
                      />
                    </Tooltip>
                  )}
                </SimpleGrid>
              </VStack>

            </Stack>
          </CardBody>
        </Card>

        {/* Global Navigation */}
        <Flex w="full" justify="space-between">
          <Button onClick={handlePrev} isDisabled={activeStep === 0} variant="ghost">
            Back
          </Button>
          <Button onClick={handleNext} isDisabled={activeStep === steps.length - 1} colorScheme="blue">
            Next Step
          </Button>
        </Flex>

      </VStack>

      {/* Camera Preview Modal */}
      <Modal isOpen={isCameraOpen} onClose={closeCamera} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Take a Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0} bg="black">
            <Box position="relative" w="full" pt="75%"> {/* 4:3 Aspect Ratio */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </ModalBody>
          <ModalFooter bg="gray.50">
            <Button colorScheme="red" mr={3} onClick={closeCamera}>Cancel</Button>
            <Button colorScheme="blue" leftIcon={<MdPhotoCamera />} onClick={captureImage}>
              Capture
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
  );
};

export default Photoshoot;
