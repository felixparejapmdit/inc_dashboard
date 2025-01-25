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
import { MdPhotoCamera,MdDelete  } from "react-icons/md";
import Select from "react-select";
const Photoshoot = ({ onSaveImage }) => {
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSize, setImageSize] = useState("2x2"); // Default to 2x2
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();
  const [imageList, setImageList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams(); // Retrieve query parameters
  const personnelId = searchParams.get("personnel_id"); // Get personnel_id from URL

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
const [imageToDelete, setImageToDelete] = useState(null);
const cancelRef = useRef();

  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/personnel_images/${personnelId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setImageList(data.data); // Maintain a list of uploaded images
        }
      })
      .catch((err) => console.error("Error fetching images:", err));
  }, [personnelId]);

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
  
  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
  
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
  
  // Button to trigger the delete alert
  const handleDeleteImage = (id) => {
    openDeleteAlert(id);
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
    if (image) {
      const formData = new FormData();
      formData.append("personnel_id", personnelId);
      formData.append("type", `${imageSize} Picture`);
      formData.append("image", dataURLtoFile(image, `${Date.now()}.png`));
  
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
            position: "bottom-left",
          });
          setImage(null); // Reset the image after saving

             // Fetch the updated list of images
        const updatedImagesResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/personnel_images/${personnelId}`
        );
        const updatedImagesData = await updatedImagesResponse.json();

        if (updatedImagesData.success) {
          setImageList(updatedImagesData.data); // Update the grid with the new images
        } else {
          toast({
            title: "Error fetching updated images",
            description: "Could not update the image grid. Please refresh manually.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }

        } else {
          const error = await response.json();
          throw new Error(error.message || "Failed to save the image.");
        }
      } catch (err) {
        toast({
          title: "Error saving image",
          description: err.message || "Something went wrong. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    } else {
      toast({
        title: "No image to save",
        description: "Please upload or capture an image before saving.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  
  // Helper function to convert base64 to File object
  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
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


  return (
    <VStack spacing={6} align="center" my={115}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 2: Upload Image(s)
      </Heading>

      <Select
  options={imageSizeOptions}
  value={imageSizeOptions.find((option) => option.value === imageSize)}
  onChange={handleImageSizeChange}
  isOptionDisabled={isOptionDisabled} // Disable options already uploaded
  placeholder="Select Image Size" // Add placeholder
  styles={{
    container: (base) => ({ ...base, width: 200, marginBottom: 16 }),
    control: (base) => ({
      ...base,
      borderColor: "gray.300",
      boxShadow: "none",
      "&:hover": { borderColor: "gray.400" },
    }),
    placeholder: (base) => ({ ...base, color: "gray.600" }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  }}
/>




      <Box
        p={5}
        border="2px dashed"
        borderColor="gray.400"
        borderRadius="md"
        w={getBoxSize().width}
        h={getBoxSize().height}
        position="relative"
        bg="yellow.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        _hover={{ bg: "yellow.200" }}
      >
        {image ? (
          <Image
            src={image}
            alt="Uploaded Picture"
            boxSize="100%"
            borderRadius="md"
            objectFit="cover"
          />
        ) : (
          <VStack>
            <Icon as={BsUpload} w={12} h={12} color="gray.500" />
            <Text fontSize="lg" fontWeight="bold">
              Drop your {imageSize} here or browse
            </Text>
            <Text fontSize="sm" color="gray.600">
              Supports PNG and JPEG
            </Text>
          </VStack>
        )}
        <Input
          type="file"
          accept="image/png, image/jpeg"
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          opacity={0}
          cursor="pointer"
          onChange={handleImageUpload}
        />
      </Box>

      <HStack spacing={4}>
        <IconButton
          icon={<MdPhotoCamera />}
          colorScheme="teal"
          onClick={openCamera}
          aria-label="Capture Image"
        />
        <Button
          onClick={handleSaveImage}
          colorScheme="yellow"
          fontWeight="bold"
          
  isDisabled={!image || isLoading}
  isLoading={isLoading}
        >
           {isLoading ? <Spinner size="sm" /> : "Submit Now"}
        </Button>
      </HStack>

      <Box
  display="flex"
  flexWrap="wrap"
  justifyContent="flex-start"
  gap={4}
  width="100%"
>
  {imageList.map((img) => (
    <Box
      key={img.id}
      borderRadius="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.300"
      p={4}
      shadow="lg"
      transition="transform 0.2s"
      _hover={{ transform: "scale(1.05)" }}
      bg="white"
      textAlign="center"
      width="250px"
    >
      {/* Image Size Display */}
      <Text fontSize="lg" fontWeight="bold" color="teal.700" mb={2}>
        {img.type}
      </Text>

      {/* Image Display */}
      <Image
        src={`${process.env.REACT_APP_API_URL}${img.image_url}`}
        width="200px"
        height="200px"
        objectFit="cover"
        alt={img.type}
        borderRadius="md"
        mb={4}
      />

      {/* Delete Button */}
      <Button
        size="md"
        colorScheme="red"
        onClick={() => handleDeleteImage(img.id)}
        leftIcon={<MdDelete />}
      >
        Delete
      </Button>
    </Box>
  ))}
</Box>





<AlertDialog
  isOpen={isDeleteAlertOpen}
  leastDestructiveRef={cancelRef}
  onClose={closeDeleteAlert}
>
  <AlertDialogOverlay>
    <AlertDialogContent>
      <AlertDialogHeader fontSize="lg" fontWeight="bold">
        Delete Image
      </AlertDialogHeader>

      <AlertDialogBody>
        Are you sure you want to delete this image? This action cannot be undone.
      </AlertDialogBody>

      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={closeDeleteAlert}>
          Cancel
        </Button>
        <Button
          colorScheme="red"
          onClick={confirmDeleteImage}
          ml={3}
        >
          Delete
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialogOverlay>
</AlertDialog>


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
