import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
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
    AlertTitle,
    AlertDescription,
    Switch,
    FormControl,
    FormLabel,
    Badge,
    Icon,
} from "@chakra-ui/react";
import { FaCamera, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { loadModels, detectFaceFromVideo } from "../utils/faceApi";
import { postData, fetchData, putData, deleteData } from "../utils/fetchData";

const FaceEnrollment = ({ personnelId, isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [existingEnrollment, setExistingEnrollment] = useState(null);

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

    // Check existing enrollment
    useEffect(() => {
        if (isOpen && personnelId) {
            checkEnrollmentStatus();
        }
    }, [isOpen, personnelId]);

    const checkEnrollmentStatus = async () => {
        try {
            const data = await fetchData(
                `face-recognition/status/${personnelId}`,
                null,
                null,
                "Failed to check enrollment status"
            );

            if (data && data.enrolled) {
                setExistingEnrollment(data);
                setIsEnabled(data.is_enabled);
            } else {
                setExistingEnrollment(null);
            }
        } catch (error) {
            console.error("Error checking enrollment:", error);
        }
    };

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
                description: "Please allow camera access to enroll your face",
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

    const captureFace = async () => {
        if (!videoRef.current) return;

        setIsLoading(true);

        try {
            const result = await detectFaceFromVideo(videoRef.current);

            if (!result.success) {
                toast({
                    title: "No Face Detected",
                    description: "Please position your face in the camera",
                    status: "warning",
                    duration: 3000,
                });
                setIsLoading(false);
                return;
            }

            // Send descriptor to backend
            const response = await postData(
                "face-recognition/enroll",
                {
                    personnel_id: personnelId,
                    face_descriptor: result.descriptor,
                },
                "Failed to enroll face"
            );

            if (response) {
                setEnrollmentStatus("success");
                toast({
                    title: "Face Enrolled Successfully!",
                    description: "You can now use face recognition to login",
                    status: "success",
                    duration: 5000,
                });

                stopCamera();
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (error) {
            setEnrollmentStatus("error");
            toast({
                title: "Enrollment Failed",
                description: error.message || "Failed to enroll face",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFaceRecognition = async () => {
        try {
            await putData(
                `face-recognition/toggle/${personnelId}`,
                { is_enabled: !isEnabled },
                "Failed to toggle face recognition"
            );

            setIsEnabled(!isEnabled);
            toast({
                title: `Face Recognition ${!isEnabled ? "Enabled" : "Disabled"}`,
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        }
    };

    const deleteFaceData = async () => {
        try {
            await deleteData(
                `face-recognition/delete/${personnelId}`,
                "Failed to delete face data"
            );

            setExistingEnrollment(null);
            toast({
                title: "Face Data Deleted",
                description: "Your face data has been removed",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Deletion Failed",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        }
    };

    const handleClose = () => {
        stopCamera();
        setEnrollmentStatus(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent>
                <ModalHeader>Face Recognition Enrollment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        {!modelsLoaded && (
                            <Alert status="info">
                                <AlertIcon />
                                <Box>
                                    <AlertTitle>Loading Models...</AlertTitle>
                                    <Progress size="xs" isIndeterminate mt={2} />
                                </Box>
                            </Alert>
                        )}

                        {existingEnrollment && (
                            <Alert status="success">
                                <AlertIcon />
                                <Box flex="1">
                                    <AlertTitle>Already Enrolled</AlertTitle>
                                    <AlertDescription>
                                        Enrolled on {new Date(existingEnrollment.enrolled_at).toLocaleDateString()}
                                    </AlertDescription>
                                </Box>
                                <Badge colorScheme={isEnabled ? "green" : "gray"} ml={2}>
                                    {isEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                            </Alert>
                        )}

                        {existingEnrollment && (
                            <FormControl display="flex" alignItems="center">
                                <FormLabel mb="0">
                                    Enable Face Recognition Login
                                </FormLabel>
                                <Switch
                                    isChecked={isEnabled}
                                    onChange={toggleFaceRecognition}
                                    colorScheme="green"
                                />
                            </FormControl>
                        )}

                        {!cameraActive && !existingEnrollment && (
                            <Alert status="info">
                                <AlertIcon />
                                <AlertDescription>
                                    Click "Start Camera" to begin enrollment. Make sure your face is well-lit and clearly visible.
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
                        </Box>

                        {enrollmentStatus === "success" && (
                            <Alert status="success">
                                <AlertIcon />
                                <AlertTitle>Enrollment Successful!</AlertTitle>
                            </Alert>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3} w="100%" justify="space-between">
                        <Box>
                            {existingEnrollment && (
                                <Button
                                    colorScheme="red"
                                    variant="ghost"
                                    size="sm"
                                    onClick={deleteFaceData}
                                >
                                    Delete Face Data
                                </Button>
                            )}
                        </Box>
                        <HStack>
                            <Button variant="ghost" onClick={handleClose}>
                                Close
                            </Button>
                            {!cameraActive && !existingEnrollment && (
                                <Button
                                    leftIcon={<FaCamera />}
                                    colorScheme="blue"
                                    onClick={startCamera}
                                    isDisabled={!modelsLoaded}
                                >
                                    Start Camera
                                </Button>
                            )}
                            {cameraActive && (
                                <>
                                    <Button onClick={stopCamera}>
                                        Stop Camera
                                    </Button>
                                    <Button
                                        leftIcon={<FaCheckCircle />}
                                        colorScheme="green"
                                        onClick={captureFace}
                                        isLoading={isLoading}
                                        isDisabled={!faceDetected}
                                    >
                                        Capture & Enroll
                                    </Button>
                                </>
                            )}
                            {existingEnrollment && !cameraActive && (
                                <Button
                                    leftIcon={<FaCamera />}
                                    colorScheme="orange"
                                    onClick={startCamera}
                                >
                                    Re-enroll Face
                                </Button>
                            )}
                        </HStack>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal >
    );
};

export default FaceEnrollment;
