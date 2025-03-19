// src/pages/progress/Photoshoot.js
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  VStack,
  Box,
  Image,
  Text,
  Input,
  //Select,
  Button,
  Icon,
  useToast,
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
  Grid,
  GridItem,
  Tooltip,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { BsUpload } from "react-icons/bs";
import { MdPhotoCamera, MdDelete } from "react-icons/md";
import Select from "react-select";
const Photoshoot = ({ personnel, onSaveImage }) => {
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSize, setImageSize] = useState("2x2"); // Default to 2x2
  const [images, setImages] = useState({
    twoByTwo: null,
    halfBody: null,
    fullBody: null,
  });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();
  const [imageList, setImageList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const personnelId = personnel?.personnel_id; // Get ID from props

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const cancelRef = useRef();

  const [step, setStep] = useState(0); // Track the current step

  // Function to get step label
  const getStepLabel = (step) =>
    ["2x2 Picture", "Half Body Picture", "Full Body Picture"][step];

  // Move to next step only if image is uploaded
  const nextStep = () => {
    if (step < 2 && images[getStepLabel(step).toLowerCase().replace(/\s/g, "")])
      setStep(step + 1);
  };

  // Move to previous step
  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  useEffect(() => {
    if (!personnelId) return; // Prevent fetching if no personnelId

    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/personnel_images/${personnelId}`
        );
        const data = await response.json();

        if (data.success) {
          console.log("Fetched Images:", data.data); // Debugging: Check fetched images

          // Ensure images are stored in correct keys
          setImages({
            twoByTwo:
              data.data.find((img) => img.type === "2x2 Picture")?.image_url ||
              null,
            halfBody:
              data.data.find((img) => img.type === "Half Body Picture")
                ?.image_url || null,
            fullBody:
              data.data.find((img) => img.type === "Full Body Picture")
                ?.image_url || null,
          });
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [personnelId]); // Ensure this runs when personnelId changes

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size should be less than 5MB.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (file.type === "image/jpeg" || file.type === "image/png") {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Only JPEG and PNG formats are supported.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const openDeleteAlert = (id) => {
    setImageToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const closeDeleteAlert = () => {
    setImageToDelete(null);
    setIsDeleteAlertOpen(false);
  };

  // Button to trigger the delete alert
  const handleDeleteImage = async (id) => {
    if (!id) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/personnel_images/${imageToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setImageList(imageList.filter((img) => img.id !== imageToDelete));
        toast({
          title: "Image deleted successfully",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete the image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      closeDeleteAlert();
    }
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this browser.");
      }
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: error.message || "Unable to access the camera.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setImage(dataUrl);
      closeCamera();
    }
  };

  const handleSaveImage = async () => {
    if (!image) {
      toast({
        title: "No image to save",
        description: "Please upload or capture an image before saving.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("personnel_id", personnelId);
    formData.append("type", getStepLabel(step));
    const fileData = dataURLtoFile(image, `${Date.now()}.png`);
    if (!fileData) {
      toast({
        title: "Image conversion failed",
        description: "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    formData.append("image", fileData);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/personnel_images`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        toast({
          title: "Image saved successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Update the stored images and move to next step
        setImages((prev) => ({
          ...prev,
          [getStepLabel(step).toLowerCase().replace(/\s/g, "")]: image,
        }));
        setImage(null);
        if (step < 2) nextStep();
      } else {
        throw new Error("Failed to save the image.");
      }
    } catch (err) {
      toast({
        title: "Error saving image",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Helper function to convert base64 to File object
  const dataURLtoFile = (dataUrl, filename) => {
    try {
      if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.includes(",")) {
        console.error("Invalid data URL:", dataUrl);
        return null;
      }

      const arr = dataUrl.split(",");
      if (arr.length < 2) {
        console.error("Malformed data URL:", dataUrl);
        return null;
      }

      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        console.error("Invalid MIME type in data URL:", dataUrl);
        return null;
      }

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error("Error in dataURLtoFile:", error);
      return null;
    }
  };

  const getBoxSize = () => {
    switch (imageSize) {
      case "wholebody":
        return { width: "300px", height: "400px" };
      case "halfbody":
        return { width: "300px", height: "250px" };
      default:
        return { width: "150px", height: "150px" };
    }
  };

  const imageSizeOptions = [
    { value: "2x2", label: "2x2 Picture" },
    { value: "Whole Body", label: "Whole Body Picture" },
    { value: "Half Body", label: "Half Body Picture" },
  ];

  const handleImageSizeChange = (selectedOption) => {
    setImageSize(selectedOption.value);
  };

  const isOptionDisabled = (option) => {
    return imageList.some((img) => img.type === option.label);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];

    if (file) {
      readFileAsBase64(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      readFileAsBase64(file);
    }
  };

  const readFileAsBase64 = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result); // Store base64 image
    };
    reader.readAsDataURL(file);
  };

  return (
    <VStack spacing={6} align="center" my={8}>
      <Heading size="md">
        Step {step + 1}: {getStepLabel(step)}
      </Heading>
      {/* Capture or Upload Image */}
      <Box
        p={5}
        border="2px dashed gray"
        borderRadius="md"
        width="250px"
        height="250px"
        textAlign="center"
        onClick={() => fileInputRef.current.click()} // Click event to open file picker
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => e.preventDefault()}
        onDrop={handleDrop} // Drag & Drop event
        cursor="pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelect} // Handle file selection
        />

        {image ? (
          <Image
            src={image}
            alt="Uploaded or Captured"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        ) : (
          <Text textAlign="center" fontSize="sm" color="gray.500">
            Drag & Drop an image here <br /> or <strong>click to upload</strong>
          </Text>
        )}
      </Box>

      {/* Camera & Upload Buttons */}
      <HStack>
        <IconButton
          icon={<MdPhotoCamera />}
          colorScheme="blue"
          onClick={openCamera}
        />
        <IconButton
          icon={<BsUpload />}
          colorScheme="green"
          as="label"
          htmlFor="file-upload" // This links the button to the input
        />
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith("image/")) {
              toast({
                title: "Invalid file type",
                description: "Only image files are allowed.",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
              return;
            }

            // Convert file to base64
            const reader = new FileReader();
            reader.onload = (event) => {
              setImage(event.target.result); // Store base64 image
            };
            reader.readAsDataURL(file);
          }}
        />

        {image && (
          <Button colorScheme="teal" onClick={handleSaveImage}>
            Save & Next
          </Button>
        )}
      </HStack>
      {/* Navigation Buttons */}
      <HStack spacing={4} mt={4}>
        <Button onClick={prevStep} isDisabled={step === 0}>
          Previous
        </Button>
        <Button
          onClick={nextStep}
          isDisabled={
            step === 2 ||
            !images[getStepLabel(step).toLowerCase().replace(/\s/g, "")]
          }
        >
          Next
        </Button>
      </HStack>
      {/* Image Preview (Only the selected step) */}
      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={4}>
        {images[getStepLabel(step).toLowerCase().replace(/\s/g, "")] && (
          <Box
            border="1px solid"
            borderColor="gray.300"
            p={4}
            textAlign="center"
          >
            <Text fontWeight="bold">{getStepLabel(step)}</Text>
            <Image
              src={
                new URL(
                  images[
                    getStepLabel(step).toLowerCase().replace(/\s/g, "")
                  ]?.replace(/^\/+/, ""),
                  process.env.REACT_APP_API_URL
                ).href
              }
              width="150px"
              height="150px"
              objectFit="cover"
              onError={(e) => (e.target.src = "/fallback-image.png")} // Use fallback if image is broken
            />

            <IconButton
              icon={<MdDelete />}
              colorScheme="red"
              mt={2}
              onClick={() => handleDeleteImage(imageToDelete)}
            />
          </Box>
        )}
      </Box>
      {/* Camera Modal */}
      <Modal isOpen={isCameraOpen} onClose={closeCamera}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Capture Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <video ref={videoRef} autoPlay style={{ width: "100%" }} />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={captureImage} colorScheme="teal">
              Capture
            </Button>
            <Button variant="ghost" onClick={closeCamera}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Photoshoot;
