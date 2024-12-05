import React, { useState, useRef, useEffect } from "react";
import {
  VStack,
  Box,
  Image,
  Text,
  Input,
  Select,
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
} from "@chakra-ui/react";
import { BsUpload } from "react-icons/bs";
import { MdPhotoCamera } from "react-icons/md";

const Step2 = ({ personnelId, onSaveImage }) => {
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSize, setImageSize] = useState("2x2"); // Default to 2x2
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();
  const [imageList, setImageList] = useState([]);

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
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
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
      const payload = {
        personnel_id: 9,
        type: `${imageSize} Picture`,
        image_url: image,
        created_at: new Date().toISOString(),
      };

      try {
        // Assuming you have an API endpoint for saving images
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/personnel_images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          toast({
            title: "Image saved successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          setImage(null); // Reset the image after saving
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
        });
      }
    } else {
      toast({
        title: "No image to save",
        description: "Please upload or capture an image before saving.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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

  return (
    <VStack spacing={6} align="center" my={115}>
      <Heading as="h2" size="lg" textAlign="center" mb={6}>
        Step 2: Upload Image(s)
      </Heading>

      <Select
        value={imageSize}
        onChange={(e) => setImageSize(e.target.value)}
        placeholder="Select Image Size"
        w="200px"
        mb={4}
      >
        <option value="2x2">2x2 Picture</option>
        <option value="wholebody">Whole Body</option>
        <option value="halfbody">Half Body</option>
      </Select>

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
          isDisabled={!image}
        >
          Submit Now
        </Button>
      </HStack>

      <VStack spacing={6} align="center" mt={6}>
        <Heading as="h3" size="md">
          Saved Images
        </Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
          {imageList.map((img) => (
            <GridItem key={img.id}>
              <Box
                borderRadius="md"
                overflow="hidden"
                border="1px solid"
                borderColor="gray.200"
              >
                <Image
                  src={img.image_url}
                  alt={img.type}
                  boxSize="150px"
                  objectFit="cover"
                />
                <Text fontSize="sm" textAlign="center" mt={2}>
                  {img.type}
                </Text>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </VStack>

      <Modal isOpen={isCameraOpen} onClose={closeCamera}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Capture Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" justifyContent="center">
            <video ref={videoRef} autoPlay width="100%" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={captureImage}>
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

export default Step2;
