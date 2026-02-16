import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    VStack,
    Text,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useToast,
    Progress,
    Alert,
    AlertIcon,
    AlertDescription,
    Badge,
    Icon,
    Spinner,
} from "@chakra-ui/react";
import { FaCamera, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { loadModels, detectFaceFromVideo } from "../utils/faceApi";
import { postData } from "../utils/fetchData";

const FaceRecognitionLogin = ({ isOpen, onClose, onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const toast = useToast();

    // Load models on component mount
    useEffect(() => {
        const initModels = async () => {
            const loaded = await loadModels();
            setModelsLoaded(loaded);
            if (!loaded) {
                toast({
                    title: "Model Loading Failed",
                    description: "Failed to load face recognition models",
                    status: "error",
                    duration: 5000,
                });
            }
        };
        initModels();
    }, [toast]);

    // Auto-start camera when modal opens
    useEffect(() => {
        if (isOpen && modelsLoaded) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isOpen, modelsLoaded]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 640,
                    height: 480,
                    facingMode: "user"
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                // Wait for video to be ready and play
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setCameraActive(true);

                    // Start face detection loop after video is playing
                    setTimeout(() => {
                        detectFaceLoop();
                    }, 500);
                };
            }
        } catch (error) {
            console.error("Camera error:", error);
            toast({
                title: "Camera Access Denied",
                description: "Please allow camera access for face recognition login",
                status: "error",
                duration: 5000,
            });
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setFaceDetected(false);
    };

    const detectFaceLoop = async () => {
        if (!videoRef.current || !cameraActive) return;

        const result = await detectFaceFromVideo(videoRef.current);
        setFaceDetected(result.success);

        if (cameraActive) {
            requestAnimationFrame(detectFaceLoop);
        }
    };

    const verifyFace = async () => {
        if (!videoRef.current) return;

        setVerifying(true);

        try {
            const result = await detectFaceFromVideo(videoRef.current);

            if (!result.success) {
                toast({
                    title: "No Face Detected",
                    description: "Please position your face in the camera",
                    status: "warning",
                    duration: 3000,
                });
                setVerifying(false);
                return;
            }

            // Send descriptor to backend for verification
            const response = await postData(
                "face-recognition/verify",
                {
                    face_descriptor: result.descriptor,
                },
                "Failed to verify face"
            );

            if (response && response.success) {
                toast({
                    title: "Face Verified!",
                    description: `Welcome back, ${response.data.personnel.givenname}!`,
                    status: "success",
                    duration: 3000,
                });

                stopCamera();

                // Call the login success callback with user data
                if (onLoginSuccess) {
                    onLoginSuccess(response.data);
                }

                onClose();
            } else {
                toast({
                    title: "Face Not Recognized",
                    description: "Please try again or use password login",
                    status: "error",
                    duration: 5000,
                });
            }
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error.message || "Failed to verify face. Please try password login.",
                status: "error",
                duration: 5000,
            });
        } finally {
            setVerifying(false);
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(8px)" />
            <ModalContent>
                <ModalHeader>Face Recognition Login</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {!modelsLoaded && (
                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    <Text fontWeight="bold">Loading Models...</Text>
                                    <Progress size="xs" isIndeterminate mt={2} />
                                </Box>
                            </Alert>
                        )}

                        {!cameraActive && modelsLoaded && (
                            <Alert status="info">
                                <AlertIcon />
                                <AlertDescription>
                                    Position your face in the camera for recognition
                                </AlertDescription>
                            </Alert>
                        )}

                        <Box position="relative" display={cameraActive ? "block" : "none"}>
                            <video
                                ref={videoRef}
                                width="640"
                                height="480"
                                autoPlay
                                playsInline
                                muted
                                style={{
                                    width: "100%",
                                    maxHeight: "400px",
                                    borderRadius: "8px",
                                    border: faceDetected ? "3px solid #48BB78" : "3px solid #FC8181",
                                    backgroundColor: "#000",
                                }}
                            />
                            <Badge
                                position="absolute"
                                top={2}
                                right={2}
                                colorScheme={faceDetected ? "green" : "red"}
                                fontSize="sm"
                            >
                                <Icon as={faceDetected ? FaCheckCircle : FaTimesCircle} mr={1} />
                                {faceDetected ? "Face Detected" : "No Face"}
                            </Badge>

                            {verifying && (
                                <Box
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    transform="translate(-50%, -50%)"
                                    bg="blackAlpha.700"
                                    p={6}
                                    borderRadius="lg"
                                >
                                    <VStack>
                                        <Spinner size="xl" color="white" />
                                        <Text color="white" fontWeight="bold">
                                            Verifying...
                                        </Text>
                                    </VStack>
                                </Box>
                            )}
                        </Box>

                        <Alert status="warning" variant="left-accent">
                            <AlertIcon />
                            <AlertDescription fontSize="sm">
                                Make sure your face is well-lit and clearly visible. If verification fails, you can use password login.
                            </AlertDescription>
                        </Alert>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" onClick={handleClose} mr={3}>
                        Cancel
                    </Button>
                    {cameraActive && (
                        <Button
                            leftIcon={<FaCheckCircle />}
                            colorScheme="green"
                            onClick={verifyFace}
                            isLoading={verifying}
                            isDisabled={!faceDetected || verifying}
                        >
                            Verify Face
                        </Button>
                    )}
                    {!cameraActive && modelsLoaded && (
                        <Button
                            leftIcon={<FaCamera />}
                            colorScheme="blue"
                            onClick={startCamera}
                        >
                            Start Camera
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default FaceRecognitionLogin;
