// src/pages/progress/Photoshoot.js
import React, { useState, useEffect, useRef } from "react";
import {
  VStack,
  Box,
  Image,
  Text,
  Button,
  HStack,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import { MdPhotoCamera, MdDelete } from "react-icons/md";
import { BsUpload } from "react-icons/bs";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const Photoshoot = ({ personnel }) => {
  const toast = useToast();
  const [step, setStep] = useState(1); // Step 1 (2x2), Step 2 (Half Body), Step 3 (Full Body)
  const [images, setImages] = useState({
    twoByTwo: null,
    halfBody: null,
    fullBody: null,
  });

  const fileInputRef = useRef(null);
  const personnelId = personnel?.personnel_id;

  useEffect(() => {
    if (!personnelId) return;

    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/personnel_images/${personnelId}`
        );
        if (response.data.success) {
          const fetchedImages = response.data.data;
          setImages({
            twoByTwo:
              fetchedImages.find((img) => img.type === "2x2 Picture")
                ?.image_url || null,
            halfBody:
              fetchedImages.find((img) => img.type === "Half Body Picture")
                ?.image_url || null,
            fullBody:
              fetchedImages.find((img) => img.type === "Full Body Picture")
                ?.image_url || null,
          });
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [personnelId]);

  const stepLabels = ["2x2 Picture", "Half Body Picture", "Full Body Picture"];
  const stepKeys = ["twoByTwo", "halfBody", "fullBody"];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

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

    const formData = new FormData();
    formData.append("personnel_id", personnelId);
    formData.append("type", stepLabels[step - 1]);
    formData.append("image", file);

    try {
      const response = await axios.post(
        `${API_URL}/api/personnel_images`,
        formData
      );
      if (response.data.success) {
        toast({
          title: "Image uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setImages((prev) => ({
          ...prev,
          [stepKeys[step - 1]]: response.data.data.image_url,
        }));
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast({
        title: "Upload failed",
        description: "There was an issue uploading the image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteImage = async () => {
    const imageUrl = images[stepKeys[step - 1]];
    if (!imageUrl) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/personnel_images/${personnelId}?type=${
          stepLabels[step - 1]
        }`
      );
      if (response.data.success) {
        toast({
          title: "Image deleted successfully",
          status: "info",
          duration: 3000,
          isClosable: true,
        });

        setImages((prev) => ({
          ...prev,
          [stepKeys[step - 1]]: null,
        }));
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast({
        title: "Delete failed",
        description: "Unable to delete the image.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={6} align="center" my={4}>
      <Text fontWeight="bold" fontSize="xl">
        Step {step}: {stepLabels[step - 1]}
      </Text>

      {/* Image Preview */}
      <Box
        p={4}
        border="2px dashed gray"
        borderRadius="md"
        width="250px"
        height="250px"
        textAlign="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {images[stepKeys[step - 1]] ? (
          <Image
            src={`${API_URL}${images[stepKeys[step - 1]]}`}
            alt="Uploaded"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        ) : (
          <Text fontSize="sm" color="gray.500">
            No image uploaded
          </Text>
        )}
      </Box>

      {/* Upload Buttons */}
      <HStack>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageUpload}
        />
        <IconButton
          icon={<MdPhotoCamera />}
          colorScheme="blue"
          onClick={() => fileInputRef.current.click()}
        />
        <IconButton
          icon={<BsUpload />}
          colorScheme="green"
          onClick={() => fileInputRef.current.click()}
        />
        {images[stepKeys[step - 1]] && (
          <IconButton
            icon={<MdDelete />}
            colorScheme="red"
            onClick={handleDeleteImage}
          />
        )}
      </HStack>

      {/* Step Navigation */}
      <HStack spacing={4} mt={4}>
        <Button onClick={handlePrev} isDisabled={step === 1}>
          Previous
        </Button>
        <Button onClick={handleNext} isDisabled={step === 3}>
          Next
        </Button>
      </HStack>
    </VStack>
  );
};

export default Photoshoot;
