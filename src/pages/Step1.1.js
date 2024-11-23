import React, { useState, useRef } from "react";
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
} from "@chakra-ui/react";
import { BsUpload } from "react-icons/bs";
import { MdPhotoCamera } from "react-icons/md";

const Step8 = ({ personnelId, onSaveImage }) => {
  const [image, setImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [imageSize, setImageSize] = useState("2x2"); // Default to 2x2
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();

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

  const handleSaveImage = () => {
    if (image) {
      const payload = {
        personnel_id: personnelId,
        type: `${imageSize} Picture`,
        image_url: image,
        created_at: new Date().toISOString(),
      };
      onSaveImage(payload);
      toast({
        title: "Image saved successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
        transition="all 0.3s"
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
          mt={4}
        >
          Submit Now
        </Button>
      </HStack>

      {/* Modal for Camera */}
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

export default Step8;
