import { useState, useEffect, useRef } from "react";
import {
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { FaCheckCircle, FaIdCard } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const ScanRFIDQRBarcode = ({ onScanComplete }) => {
  const [scanValue, setScanValue] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [lastScanned, setLastScanned] = useState("");
  const toast = useToast();
  const inputRef = useRef(null);
  const buffer = useRef("");
  const timeout = useRef(null);

  // ✅ Focus the input when checkbox is clicked
  const handleCheckboxClick = () => {
    inputRef.current?.focus();
    setScanValue(""); // clear before scan
    setIsValid(null);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      setScanValue((prev) => {
        const newValue = prev + e.key;

        // Clear and validate if ENTER is pressed
        if (e.key === "Enter") {
          if (newValue.length >= 5) {
            setIsValid(true);
            if (onScanComplete) onScanComplete(newValue);
          } else {
            setIsValid(false);
          }
          return ""; // Clear after reading
        }

        return newValue;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // ✅ Scanner input buffer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (timeout.current) clearTimeout(timeout.current);

      if (e.key === "Enter") {
        const value = buffer.current;
        buffer.current = "";
        processScan(value);
        return;
      }

      buffer.current += e.key;

      timeout.current = setTimeout(() => {
        const value = buffer.current;
        buffer.current = "";
        processScan(value);
      }, 300); // wait 300ms before processing
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const processScan = (value) => {
    const trimmed = value.trim();

    if (!trimmed || trimmed.length < 5) {
      setIsValid(false);
      setScanValue(trimmed);
      toast({
        title: "Invalid Scan",
        description: "Code is too short.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    if (trimmed === lastScanned) {
      setScanValue("");
      setIsValid(null);
      setLastScanned("");
      toast({
        title: "Duplicate Scan",
        description: "Same ID tapped again. Input cleared.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setScanValue(trimmed);
    setLastScanned(trimmed);
    setIsValid(true);

    toast({
      title: "Scan Successful",
      description: "Code accepted.",
      status: "success",
      duration: 2500,
      isClosable: true,
    });

    if (onScanComplete) {
      onScanComplete(trimmed);
    }
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
      <Text fontSize="lg" fontWeight="bold" color="teal.500" mt={4}>
        Scan RFID / QR Code / Barcode
      </Text>

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
          ref={inputRef}
          placeholder="Tap ID to scan"
          size="lg"
          value={scanValue}
          cursor="not-allowed"
          readOnly // prevents typing
          tabIndex={-1} // ⛔ prevents focus via keyboard or tab
          onFocus={(e) => e.target.blur()} // ⛔ prevents clicking inside
          textAlign="center"
          fontSize="lg"
          borderColor={isValid === false ? "red.400" : "gray.300"}
          focusBorderColor={isValid === false ? "red.400" : "teal.400"}
        />
      </InputGroup>
    </VStack>
  );
};

export default ScanRFIDQRBarcode;
