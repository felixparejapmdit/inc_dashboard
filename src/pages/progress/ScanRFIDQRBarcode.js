import { useState, useEffect, useRef } from "react";
import {
  Box,
  Text,
  Input,
  Button,
  Icon,
  VStack,
  HStack,
  useToast,
  InputGroup,
  InputLeftElement,
  IconButton,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { FaQrcode, FaBarcode, FaIdCard, FaCheckCircle } from "react-icons/fa";
import { MdCancel, MdCameraAlt } from "react-icons/md";
import jsQR from "jsqr";
import Quagga from "@ericblade/quagga2";

const ScanRFIDQRBarcode = ({ onScanComplete }) => {
  const [scanValue, setScanValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();

  // ✅ Detect scan input from a physical barcode/QR scanner (keyboard input)
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter" && scanValue.trim().length >= 5) {
        handleScan();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [scanValue]);

  // ✅ Handle manual input
  const handleInputChange = (e) => {
    setScanValue(e.target.value);
    setIsValid(null);
  };

  // ✅ Open camera and start scanning
  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ✅ Close camera and stop streaming
  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  };

  // ✅ Scan for QR codes using jsQR
  const scanQRCode = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanValue(code.data);
          handleScan();
          closeCamera();
        } else {
          requestAnimationFrame(scan);
        }
      }
    };

    requestAnimationFrame(scan);
  };

  // ✅ Scan barcodes using QuaggaJS
  useEffect(() => {
    if (isCameraOpen) {
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            constraints: { facingMode: "environment" },
            target: videoRef.current,
          },
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader"],
          },
        },
        (err) => {
          if (err) {
            console.error("Error initializing Quagga:", err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((result) => {
        setScanValue(result.codeResult.code);
        handleScan();
        closeCamera();
        Quagga.stop();
      });
    }
  }, [isCameraOpen]);

  // ✅ Simulate scanning effect & validation
  const handleScan = () => {
    if (!scanValue.trim()) {
      toast({
        title: "Scan Failed",
        description: "Please enter or scan a valid RFID, QR, or Barcode.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      if (scanValue.length >= 5) {
        setIsValid(true);
        toast({
          title: "Scan Successful",
          description: "Code accepted!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        if (onScanComplete) {
          onScanComplete(scanValue);
        }
      } else {
        setIsValid(false);
        toast({
          title: "Invalid Code",
          description: "Scanned code is too short.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }, 1000);
  };

  return (
    <VStack
      spacing={4}
      p={6}
      bg="white"
      boxShadow="lg"
      borderRadius="lg"
      w="100%"
      maxW="400px"
    >
      <Text fontSize="lg" fontWeight="bold" color="teal.500">
        Scan RFID / QR Code / Barcode
      </Text>

      {/* Input Field with Icons */}
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          {isValid === true ? (
            <Icon as={FaCheckCircle} color="green.400" />
          ) : isValid === false ? (
            <Icon as={MdCancel} color="red.400" />
          ) : (
            <Icon as={FaIdCard} color="gray.400" />
          )}
        </InputLeftElement>
        <Input
          placeholder="Tap to Scan or Enter Code..."
          size="lg"
          value={scanValue}
          onChange={handleInputChange}
          textAlign="center"
          fontSize="lg"
          borderColor={isValid === false ? "red.400" : "gray.300"}
          focusBorderColor={isValid === false ? "red.400" : "teal.400"}
          onClick={openCamera}
        />
      </InputGroup>

      {/* Camera Button */}
      <IconButton
        icon={<MdCameraAlt />}
        colorScheme="teal"
        onClick={openCamera}
        aria-label="Open Camera"
      />

      {/* Scan Button */}
      <Button
        colorScheme="teal"
        size="lg"
        w="100%"
        onClick={handleScan}
        isDisabled={isScanning || !scanValue.trim()}
      >
        {isScanning ? "Scanning..." : "Verify Scan"}
      </Button>

      {/* Camera Modal */}
      <Modal isOpen={isCameraOpen} onClose={closeCamera} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan QR Code / Barcode</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: "100%" }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ScanRFIDQRBarcode;
