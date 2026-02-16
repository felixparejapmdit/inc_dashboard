import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    VStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useToast,
    Text,
} from "@chakra-ui/react";

const FaceEnrollmentTest = ({ isOpen, onClose }) => {
    const [cameraActive, setCameraActive] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const toast = useToast();

    const startCamera = async () => {
        console.log("Starting camera...");
        setError(null);

        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                },
                audio: false
            });

            console.log("Camera stream obtained:", stream);

            if (videoRef.current) {
                console.log("Setting video source...");
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                // Wait for video to load
                videoRef.current.onloadedmetadata = () => {
                    console.log("Video metadata loaded");
                    videoRef.current.play()
                        .then(() => {
                            console.log("Video playing successfully");
                            setCameraActive(true);
                            toast({
                                title: "Camera Started",
                                status: "success",
                                duration: 2000,
                            });
                        })
                        .catch(err => {
                            console.error("Error playing video:", err);
                            setError("Failed to play video: " + err.message);
                        });
                };

                videoRef.current.onerror = (err) => {
                    console.error("Video element error:", err);
                    setError("Video element error");
                };
            } else {
                console.error("Video ref is null");
                setError("Video element not found");
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError(err.message);
            toast({
                title: "Camera Access Denied",
                description: err.message,
                status: "error",
                duration: 5000,
            });
        }
    };

    const stopCamera = () => {
        console.log("Stopping camera...");
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
                console.log("Stopping track:", track.kind);
                track.stop();
            });
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent>
                <ModalHeader>Camera Test</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {error && (
                            <Box p={3} bg="red.100" borderRadius="md">
                                <Text color="red.700" fontWeight="bold">Error:</Text>
                                <Text color="red.600" fontSize="sm">{error}</Text>
                            </Box>
                        )}

                        <Box
                            position="relative"
                            bg="gray.900"
                            borderRadius="md"
                            minH="300px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    maxHeight: "400px",
                                    borderRadius: "8px",
                                    display: "block",
                                    backgroundColor: "#000",
                                }}
                            />
                            {!cameraActive && (
                                <Text
                                    position="absolute"
                                    color="white"
                                    fontSize="lg"
                                >
                                    Camera not started
                                </Text>
                            )}
                        </Box>

                        <Box p={3} bg="blue.50" borderRadius="md">
                            <Text fontSize="sm" color="blue.700">
                                <strong>Status:</strong> {cameraActive ? "Camera Active ✅" : "Camera Inactive ❌"}
                            </Text>
                            <Text fontSize="sm" color="blue.700" mt={1}>
                                <strong>Video Element:</strong> {videoRef.current ? "Found ✅" : "Not Found ❌"}
                            </Text>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" onClick={handleClose} mr={3}>
                        Close
                    </Button>
                    {!cameraActive ? (
                        <Button colorScheme="blue" onClick={startCamera}>
                            Start Camera
                        </Button>
                    ) : (
                        <Button colorScheme="red" onClick={stopCamera}>
                            Stop Camera
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default FaceEnrollmentTest;
