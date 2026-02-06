import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CryptoJS from "crypto-js";
import crypto from "crypto-browserify";
import { Buffer } from "buffer";

import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Flex,
  Text,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Divider,
  Link as ChakraLink,
  Icon,
  Card,
  CardBody,
  HStack,
  Badge,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";

import {
  FiUser,
  FiLock,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiUserPlus,
  FiCalendar,
  FiHash,
} from "react-icons/fi";
import { usePermissionContext } from "../contexts/PermissionContext";
import { fetchData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL || "https://localhost";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [retrievedReference, setRetrievedReference] = useState("");
  const [error, setError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const { fetchPermissions } = usePermissionContext();

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800");
  const bgGradient = useColorModeValue(
    "linear(to-br, orange.400, yellow.400)",
    "linear(to-br, gray.900, gray.800)"
  );

  // Hash password functions
  const hashPassword = (password, encryptionType, existingHash = null) => {
    switch (encryptionType.toLowerCase()) {
      case "md5": {
        if (existingHash) {
          const md5sum = CryptoJS.MD5(password);
          const computedHash = `{MD5}` + CryptoJS.enc.Base64.stringify(md5sum);
          return computedHash === existingHash;
        } else {
          const md5sum = CryptoJS.MD5(password);
          return `{MD5}` + CryptoJS.enc.Base64.stringify(md5sum);
        }
      }
      case "sha": {
        if (existingHash) {
          const sha1sum = CryptoJS.SHA1(password);
          const computedHash = `{SHA}` + CryptoJS.enc.Base64.stringify(sha1sum);
          return computedHash === existingHash;
        } else {
          const sha1sum = CryptoJS.SHA1(password);
          return `{SHA}` + CryptoJS.enc.Base64.stringify(sha1sum);
        }
      }
      case "ssha": {
        if (existingHash) {
          return validateSSHA(password, existingHash);
        } else {
          const salt = crypto.randomBytes(8);
          const sha1sum = crypto
            .createHash("sha1")
            .update(password)
            .update(salt)
            .digest();
          const combined = Buffer.concat([sha1sum, salt]).toString("base64");
          return `{SSHA}` + combined;
        }
      }
      case "clear": {
        return password === existingHash;
      }
      default: {
        throw new Error(`Unsupported encryption type: ${encryptionType}`);
      }
    }
  };

  const validateSSHA = (password, sshaHash) => {
    if (!sshaHash.startsWith("{SSHA}")) {
      return false;
    }

    const base64Hash = sshaHash.slice(6);

    try {
      const decoded = Buffer.from(base64Hash, "base64");
      const sha1Hash = decoded.slice(0, 20);
      const salt = decoded.slice(20);

      const recomputedHash = crypto
        .createHash("sha1")
        .update(password)
        .update(salt)
        .digest();

      return Buffer.compare(sha1Hash, recomputedHash) === 0;
    } catch (error) {
      console.error("Error decoding Base64 string:", error.message);
      return false;
    }
  };

  const handleRetrieveReference = async () => {
    if (!name.trim() || !dateOfBirth.trim()) {
      toast({
        title: "Error",
        description: "Please enter both your name and date of birth.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const nameParts = name.split(" ").filter(Boolean);
    if (nameParts.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least a given name and surname.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const givenname = nameParts[0];
    const surname_husband = nameParts.slice(1).join(" ");

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/getretrievereference`, {
        params: {
          givenname: givenname.trim(),
          surname_husband: surname_husband.trim(),
          date_of_birth: dateOfBirth.trim(),
        },
      });
      if (response.data?.reference_number) {
        setRetrievedReference(response.data.reference_number);
        toast({
          title: "Success",
          description: "Reference number retrieved successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Not Found",
          description: "No reference number found for the provided details.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error retrieving reference number:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to retrieve reference number. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackProgress = async () => {
    const trackingNumber = referenceNumber || retrievedReference;

    if (!trackingNumber) {
      toast({
        title: "Error",
        description: "Please enter or retrieve a valid Reference Number.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/getreference?reference_number=${trackingNumber}`
      );

      if (response.data && response.data.personnel_id) {
        const { personnel_id, enrollment_progress, personnel_progress } =
          response.data;

        navigate(
          `/enroll?personnel_id=${personnel_id}&step=${enrollment_progress}&personnel_progress=${personnel_progress}&type=track`
        );
      } else {
        toast({
          title: "Not Found",
          description: "Reference number not found. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error fetching personnel:", error);
      toast({
        title: "Error",
        description:
          "Unable to retrieve enrollment progress. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEnroll = () => {
    navigate("/enroll?type=new");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      // ✅ Call Backend Login (Handles both LDAP and Local)
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { username, password }
      );

      if (response.data.success) {
        const { token, user } = response.data;

        // ✅ Check if User has an Assigned Group
        if (!user.groupId) {
          setError("User has no assigned group. Contact the PMD-IT to proceed.");
          setIsLoading(false);
          return;
        }

        // ✅ Save Session Data
        localStorage.setItem("authToken", token);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userFullName", user.fullName || user.username);
        localStorage.setItem("groupId", user.groupId);
        localStorage.setItem("isLoggingIn", "true");

        // ✅ Fetch Numeric User ID if not provided as number (for LDAP fallback)
        let userId = user.id;
        if (typeof userId !== "number") {
          try {
            const userDetailRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/users_access/${user.username}`);
            if (userDetailRes.data && userDetailRes.data.id) {
              userId = userDetailRes.data.id;
            }
          } catch (err) {
            console.warn("Could not fetch numeric userId, using fallback:", userId);
          }
        }
        localStorage.setItem("userId", userId);

        // ✅ Fetch Permissions if group is valid
        if (user.groupId && user.groupId !== "LDAP_GROUP") {
          fetchPermissions(user.groupId);
        }

        // ✅ Update Login Status (Audit)
        try {
          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
            {
              ID: user.username,
              isLoggedIn: true,
            }
          );
        } catch (statusErr) {
          console.warn("Update login status failed:", statusErr.message);
        }

        navigate("/dashboard");
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error connecting to the server.";
      console.error("Login failed:", msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      maxH="100vh"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, #FFD559, #F3C847)"
      p={{ base: 3, sm: 4, md: 6 }}
      w="100vw"
      overflow="hidden"
      position="relative"
    >
      <Card
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px)"
        boxShadow="0 20px 60px rgba(0,0,0,0.15)"
        borderRadius={{ base: "xl", md: "2xl" }}
        width={{ base: "100%", sm: "400px", md: "420px" }}
        maxW="95vw"
        maxH={{ base: "95vh", md: "auto" }}
        overflow="auto"
        border="1px solid"
        borderColor="orange.200"
      >
        <CardBody p={{ base: 5, sm: 6, md: 7 }}>
          <VStack spacing={{ base: 4, md: 5 }} as="form" onSubmit={handleSubmit} w="100%">
            {/* Logo & Heading Section */}
            <VStack spacing={2} w="100%">
              <Box position="relative">
                <Image
                  src="/apps_logo.png"
                  alt="PMD Portal Logo"
                  boxSize={{ base: "65px", md: "80px" }}
                  borderRadius="full"
                  shadow="lg"
                  border="3px solid"
                  borderColor="orange.400"
                  transition="all 0.3s"
                  _hover={{ transform: "scale(1.05)", borderColor: "orange.500" }}
                />
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  bgGradient="linear(to-r, orange.500, yellow.500)"
                  color="white"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  fontSize="2xs"
                  fontWeight="bold"
                  boxShadow="sm"
                >
                  v2.0
                </Badge>
              </Box>
              <VStack spacing={0.5}>
                <Heading
                  as="h1"
                  size={{ base: "lg", md: "xl" }}
                  textAlign="center"
                  bgGradient="linear(to-r, #FF8500, #FFB700)"
                  bgClip="text"
                  fontWeight="extrabold"
                  letterSpacing="tight"
                >
                  PMD Portal
                </Heading>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" textAlign="center" fontWeight="medium">
                </Text>
              </VStack>
            </VStack>

            <Divider borderColor="orange.200" />

            {/* Username Input */}
            <FormControl isRequired>
              <InputGroup size="md">
                <InputLeftElement
                  pointerEvents="none"
                  children={<Icon as={FiUser} color="orange.500" />}
                />
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  bg="white"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "orange.300" }}
                  _focus={{
                    borderColor: "orange.400",
                    boxShadow: "0 0 0 1px #FF8500",
                  }}
                  isInvalid={!!error}
                />
              </InputGroup>
            </FormControl>

            {/* Password Input */}
            <FormControl isRequired>
              <InputGroup size="md">
                <InputLeftElement
                  pointerEvents="none"
                  children={<Icon as={FiLock} color="orange.500" />}
                />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="white"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "orange.300" }}
                  _focus={{
                    borderColor: "orange.400",
                    boxShadow: "0 0 0 1px #FF8500",
                  }}
                  isInvalid={!!error}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                    size="sm"
                    variant="ghost"
                    color="gray.600"
                    _hover={{ color: "orange.500", bg: "orange.50" }}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {error && (
              <Box
                w="100%"
                p={2.5}
                bg="red.50"
                borderRadius="lg"
                border="1px"
                borderColor="red.300"
              >
                <Text color="red.700" fontSize="sm" textAlign="center" fontWeight="medium">
                  {error}
                </Text>
              </Box>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              width="100%"
              size="md"
              isLoading={isLoading}
              loadingText="Logging in..."
              bgGradient="linear(to-r, #FF8500, #FFB700)"
              color="white"
              _hover={{
                bgGradient: "linear(to-r, #FFB700, #FF8500)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(255,133,0,0.4)",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              borderRadius="lg"
              fontWeight="bold"
              fontSize="md"
              h="48px"
              transition="all 0.3s ease-in-out"
              mt={2}
            >
              Log In
            </Button>

            <Divider borderColor="orange.200" />

            {/* Action Links */}
            {/* Action Links */}
            <HStack spacing={3} width="100%" pt={1}>
              <Button
                onClick={handleEnroll}
                variant="outline"
                colorScheme="orange"
                size="sm"
                flex={1}
                leftIcon={<Icon as={FiUserPlus} />}
                borderRadius="lg"
                borderWidth="2px"
                fontWeight="semibold"
                _hover={{
                  bg: "orange.50",
                  borderColor: "orange.500",
                  transform: "translateY(-1px)",
                }}
              >
                Enroll
              </Button>

              <Button
                onClick={onOpen}
                variant="ghost"
                colorScheme="teal"
                size="sm"
                flex={1}
                leftIcon={<Icon as={FiExternalLink} />}
                borderRadius="lg"
                fontWeight="semibold"
                _hover={{
                  bg: "teal.50",
                  color: "teal.700",
                  transform: "translateY(-1px)"
                }}
              >
                Track Status
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Modal for Reference Number (Track Progress) */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size={{ base: "sm", md: "md" }}>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
        <ModalContent
          mx={{ base: 3, md: 0 }}
          borderRadius="xl"
          overflow="hidden"
          maxH="90vh"
        >
          <ModalHeader
            bgGradient="linear(to-r, teal.500, blue.500)"
            color="white"
            fontSize={{ base: "md", md: "lg" }}
            py={4}
          >
            Track Enrollment Progress
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody p={{ base: 4, md: 5 }} overflowY="auto">
            <VStack spacing={3.5} w="100%">
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Enter your details to track your enrollment status
              </Text>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Full Name</FormLabel>
                <InputGroup size="md">
                  <InputLeftElement children={<Icon as={FiUser} color="gray.500" />} />
                  <Input
                    placeholder="First Middle Last"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    borderRadius="lg"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Date of Birth</FormLabel>
                <InputGroup size="md">
                  <InputLeftElement children={<Icon as={FiCalendar} color="gray.500" />} />
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    borderRadius="lg"
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold">Reference Number</FormLabel>
                <InputGroup size="md">
                  <InputLeftElement children={<Icon as={FiHash} color="gray.500" />} />
                  <Input
                    placeholder="Auto-filled after retrieval"
                    value={retrievedReference || referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    isReadOnly={!!retrievedReference}
                    borderRadius="lg"
                    bg={retrievedReference ? "green.50" : "white"}
                    borderColor={retrievedReference ? "green.300" : "gray.300"}
                    _focus={{ borderColor: "teal.400", boxShadow: "0 0 0 1px teal.400" }}
                  />
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter
            flexDirection={{ base: "column", sm: "row" }}
            gap={2}
            p={{ base: 4, md: 5 }}
          >
            <Button
              colorScheme="teal"
              onClick={handleRetrieveReference}
              isLoading={isLoading}
              loadingText="Retrieving..."
              flex={{ base: "1", sm: "auto" }}
              w={{ base: "100%", sm: "auto" }}
              size="sm"
            >
              Retrieve Reference
            </Button>

            <Button
              bgGradient="linear(to-r, #FF8500, #FFB700)"
              color="white"
              _hover={{ bgGradient: "linear(to-r, #FFB700, #FF8500)" }}
              onClick={handleTrackProgress}
              flex={{ base: "1", sm: "auto" }}
              w={{ base: "100%", sm: "auto" }}
              size="sm"
            >
              Proceed
            </Button>

            <Button
              variant="ghost"
              onClick={onClose}
              flex={{ base: "1", sm: "auto" }}
              w={{ base: "100%", sm: "auto" }}
              size="sm"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Login;
