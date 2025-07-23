import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CryptoJS from "crypto-js"; // For crypto-js (used for MD5)
//import crypto from "crypto"; // For Node.js crypto (used for SSHA)
import crypto from "crypto-browserify";
import bcrypt from "bcryptjs"; // Ensure bcrypt is installed
import sha from "sha.js"; // For SHA encryption
import { Buffer } from "buffer";

import * as XLSX from "xlsx";
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
  Spinner,
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
} from "@chakra-ui/react";
import "./Login.css"; // Custom CSS for animated input effect

import { FiUser, FiLock } from "react-icons/fi"; // Import icons
import { usePermissionContext } from "../contexts/PermissionContext";
import { getAuthHeaders } from "../utils/apiHeaders"; // adjust path as needed

const API_URL = process.env.REACT_APP_API_URL;
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const [isPlaying, setIsPlaying] = useState(false);

  const [file, setFile] = useState(null);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImportDistricts = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an XLSX file to import.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      try {
        const response = await axios.post(`${API_URL}/api/import-districts`, {
          districts: jsonData,
        });

        toast({
          title: "Success",
          description: response.data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Error",
          description: "Failed to import districts.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  };

  const handleImportLocal = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an XLSX file to import.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = async (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        toast({
          title: "Error",
          description: "No data found in the file.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const batchSize = 1000; // Send in batches of 1000 records
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        try {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/import-local-congregations`,
            { data: batch }
          );
          //console.log(`Imported ${i + batchSize} rows`);
        } catch (error) {
          console.error("Error importing batch:", error);
          toast({
            title: "Error",
            description:
              "Failed to import some data. Check console for errors.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }

      toast({
        title: "Success",
        description: "Local Congregations imported successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    };
  };

  const handleRetrieveReference = async () => {
    if (!name.trim() || !dateOfBirth.trim()) {
      toast({
        title: "Error",
        description: "Please enter both your name and date of birth.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    // Attempt to split the name into first, middle, and surname
    const nameParts = name.split(" ").filter(Boolean);
    if (nameParts.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least a given name and surname.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }

    // Assume the first part is the given name and the last part is the surname
    const givenname = nameParts[0]; // First name
    const surname_husband = nameParts.slice(1).join(" "); // Everything after first word = surname

    //console.log("Given Name:", givenname);
    //console.log("Surname:", surname_husband);

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
          position: "bottom-left", // Position the toast on the bottom-left
        });
      } else {
        toast({
          title: "Not Found",
          description: "No reference number found for the provided details.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom-left", // Position the toast on the bottom-left
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
        position: "bottom-left", // Position the toast on the bottom-left
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Track Enrollment Progress
  const handleTrackProgress = async () => {
    const trackingNumber = referenceNumber || retrievedReference; // Use referenceNumber if available, otherwise use retrievedReference

    if (!trackingNumber) {
      toast({
        title: "Error",
        description: "Please enter or retrieve a valid Reference Number.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom-left", // Position the toast on the bottom-left
      });
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/api/getreference?reference_number=${trackingNumber}`
      );

      //(response.data);

      if (response.data && response.data.personnel_id) {
        const { personnel_id, enrollment_progress, personnel_progress } =
          response.data;

        // Navigate to the EnrollmentForm with the appropriate step
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
          position: "bottom-left", // Position the toast on the bottom-left
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
        position: "bottom-left", // Position the toast on the bottom-left
      });
    }
  };

  const startMusic = () => {
    const audio = document.getElementById("background-audio");
    audio.muted = false; // Unmute the audio
    audio.play(); // Play the audio
    setIsPlaying(true); // Hide the overlay
  };

  const handleEnroll = () => {
    navigate("/enroll?type=new");
  };

  // Hash the password for LDAP MD5 format
  const md5HashPassword = (password) => {
    const md5sum = crypto.MD5(password);
    return `{MD5}` + crypto.enc.Base64.stringify(md5sum);
  };

  //const crypto = require("crypto");

  const hashPassword = (password, encryptionType, existingHash = null) => {
    switch (encryptionType.toLowerCase()) {
      case "bcrypt": {
        // Validate bcrypt
        if (existingHash) {
          return bcrypt.compareSync(password, existingHash); // Compare password with hash
        } else {
          const saltRounds = 10;
          const hashedPassword = bcrypt.hashSync(password, saltRounds);
          console.log("Generated bcrypt hash:", hashedPassword);
          return hashedPassword; // Return hash if generating
        }
      }
      case "md5": {
        if (existingHash) {
          const md5sum = CryptoJS.MD5(password);
          const computedHash = `{MD5}` + CryptoJS.enc.Base64.stringify(md5sum);
          return computedHash === existingHash; // Compare generated hash with existing hash
        } else {
          const md5sum = CryptoJS.MD5(password);
          return `{MD5}` + CryptoJS.enc.Base64.stringify(md5sum); // Return generated hash
        }
      }
      case "sha": {
        if (existingHash) {
          const sha1sum = CryptoJS.SHA1(password);
          const computedHash = `{SHA}` + CryptoJS.enc.Base64.stringify(sha1sum);
          return computedHash === existingHash; // Compare hashes
        } else {
          const sha1sum = CryptoJS.SHA1(password);
          return `{SHA}` + CryptoJS.enc.Base64.stringify(sha1sum); // Return generated hash
        }
      }
      case "sha256": {
        if (existingHash) {
          const sha256sum = CryptoJS.SHA256(password);
          const computedHash =
            `{SHA256}` + CryptoJS.enc.Base64.stringify(sha256sum);
          return computedHash === existingHash; // Compare hashes
        } else {
          const sha256sum = CryptoJS.SHA256(password);
          return `{SHA256}` + CryptoJS.enc.Base64.stringify(sha256sum); // Return generated hash
        }
      }
      case "sha512": {
        if (existingHash) {
          const sha512sum = CryptoJS.SHA512(password);
          const computedHash =
            `{SHA512}` + CryptoJS.enc.Base64.stringify(sha512sum);
          return computedHash === existingHash; // Compare hashes
        } else {
          const sha512sum = CryptoJS.SHA512(password);
          return `{SHA512}` + CryptoJS.enc.Base64.stringify(sha512sum); // Return generated hash
        }
      }
      case "ssha": {
        if (existingHash) {
          return validateSSHA(password, existingHash); // Use validateSSHA for validation
        } else {
          // Generate SSHA
          const salt = crypto.randomBytes(8); // Generate 8-byte random salt
          const sha1sum = crypto
            .createHash("sha1")
            .update(password)
            .update(salt)
            .digest();

          const combined = Buffer.concat([sha1sum, salt]).toString("base64");
          return `{SSHA}` + combined; // Return generated hash
        }
      }
      case "clear": {
        return password === existingHash; // Compare plain-text password
      }
      default: {
        throw new Error(`Unsupported encryption type: ${encryptionType}`);
      }
    }
  };

  const validateSSHA = (password, sshaHash) => {
    // Ensure the SSHA hash starts with the correct prefix
    if (!sshaHash.startsWith("{SSHA}")) {
      console.error("Invalid SSHA format: Missing '{SSHA}' prefix.");
      return false;
    }

    // Remove the "{SSHA}" prefix
    const base64Hash = sshaHash.slice(6); // Remove "{SSHA}"

    try {
      // Decode the Base64-encoded hash
      const decoded = Buffer.from(base64Hash, "base64");

      // The first 20 bytes are the SHA-1 hash, the rest is the salt
      const sha1Hash = decoded.slice(0, 20); // First 20 bytes
      const salt = decoded.slice(20); // Remaining bytes are the salt

      //console.log("Decoded Hash (Hex):", sha1Hash.toString("hex"));
      //console.log("Salt (Hex):", salt.toString("hex"));

      // Recompute the SHA-1 hash using the password and the extracted salt
      const recomputedHash = crypto
        .createHash("sha1")
        .update(password) // Add the password
        .update(salt) // Add the salt
        .digest();

      //console.log("Recomputed Hash (Hex):", recomputedHash.toString("hex"));

      // Compare the recomputed hash with the original hash
      return Buffer.compare(sha1Hash, recomputedHash) === 0;
    } catch (error) {
      console.error("Error decoding Base64 string:", error.message);
      return false;
    }
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }

    const ldapTimeout = 5000; // Set LDAP timeout to 5 seconds

    try {
      // ✅ Attempt Login with JWT Authentication API
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { username, password }
      );

      if (response.data.success) {
        const { token, user } = response.data;

        // Check if the group ID exists
        if (!user.groupId) {
          setError(
            "User does not belong to any group. Please contact the administrator to Assign."
          );
          setIsLoading(false);
          return;
        }

        // ✅ Store JWT token & user details in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userFullName", user.fullName);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("groupId", user.groupId);

        // ✅ Set Authorization Header for Future API Calls
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        navigate("/dashboard"); // Redirect to Dashboard
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Error connecting to the server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!username || !password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      // 🔐 Call unified login endpoint that handles LDAP & local
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { username, password }
      );

      if (response.data.success) {
        const { token, user } = response.data;

        // ✅ Store token for protected API calls
        localStorage.setItem("token", token);

        // ✅ Save essential user info
        localStorage.setItem("username", user.username);
        localStorage.setItem("userFullName", user.fullName || user.username);

        // Fetch userId via /users_access endpoint
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users_access/${user.username}`,
          {
            headers: getAuthHeaders(),
          }
        );
        const userId = userResponse.data.id;
        localStorage.setItem("userId", userId);

        // Fetch groupId via /groups/user endpoint
        const groupResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/groups/user/${userId}`,
          {
            headers: getAuthHeaders(),
          }
        );
        const groupId = groupResponse.data.groupId;

        if (!groupId) {
          setError(
            "User does not belong to any group. Please contact the administrator."
          );
          setIsLoading(false);
          return;
        }

        localStorage.setItem("groupId", groupId);

        // 🔄 Fetch and store permissions
        fetchPermissions(groupId);

        // ➡ Navigate to dashboard
        navigate("/dashboard");

        // ✅ Update login status in DB
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
          {
            ID: user.username, // or user.id depending on structure
            isLoggedIn: true,
          },
          {
            headers: getAuthHeaders(),
          }
        );
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect or authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

    const ldapTimeout = 5000;

    const ldapPromise = axios
      .get(`${process.env.REACT_APP_API_URL}/ldap/user/${username}`, {
        timeout: ldapTimeout,
      })
      .then(async (ldapResponse) => {
        const ldapUser = ldapResponse.data;

        const encryptionType = ldapUser.userPassword.match(/^\{(\w+)\}/)?.[1];
        if (!encryptionType) {
          setError("Unsupported or unknown encryption type.");
          setIsLoading(false);
          return;
        }

        const isPasswordValid = hashPassword(
          password,
          encryptionType,
          ldapUser.userPassword
        );

        if (isPasswordValid) {
          // ✅ Authenticate via local login to get JWT token
          const loginResponse = await axios.post(
            `${process.env.REACT_APP_API_URL}/api/users/login`,
            { username, password }
          );

          const token = loginResponse.data.token;
          localStorage.setItem("authToken", token);

          const userResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users_access/${username}`,
            { headers: getAuthHeaders() }
          );
          const userId = userResponse.data.id;

          const groupResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/groups/user/${userId}`,
            { headers: getAuthHeaders() }
          );
          const groupId = groupResponse.data.groupId;

          if (!groupId) {
            setError(
              "User does not belong to any group. Please contact the administrator to Assign."
            );
            setIsLoading(false);
            return;
          }

          const fullName = ldapUser.cn?.[0] || "User";
          localStorage.setItem("userFullName", fullName);
          localStorage.setItem("username", ldapUser.uid);
          localStorage.setItem("userId", userId);
          localStorage.setItem("groupId", groupId);

          fetchPermissions(groupId);
          navigate("/dashboard");

          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
            {
              ID: ldapUser.uid?.[0],
              isLoggedIn: true,
            },
            { headers: getAuthHeaders() }
          );
        } else {
          throw new Error("Invalid LDAP username or password");
        }
      });

    try {
      await ldapPromise;
    } catch (err) {
      console.error(
        "LDAP connection failed, falling back to local login:",
        err
      );

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/users/login`,
          { username, password }
        );

        if (response.data.success) {
          const token = response.data.token;
          const user = response.data.user;

          localStorage.setItem("authToken", token);

          const userResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users_access/${user.username}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const userId = userResponse.data.id;

          const groupResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/groups/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const groupId = groupResponse.data.groupId;

          if (!groupId) {
            setError(
              "User does not belong to any group. Please contact the administrator to Assign."
            );
            setIsLoading(false);
            return;
          }

          localStorage.setItem("userFullName", user.username);
          localStorage.setItem("username", user.username);
          localStorage.setItem("userId", userId);
          localStorage.setItem("groupId", groupId);

          fetchPermissions(groupId);
          navigate("/dashboard");

          await axios.put(
            `${process.env.REACT_APP_API_URL}/api/users/update-login-status`,
            {
              ID: user.ID,
              isLoggedIn: true,
            },
            { headers: getAuthHeaders() }
          );
        } else {
          setError("Invalid username or password");
        }
      } catch (error) {
        console.error("Error during local login:", error);
        setError("Error connecting to the server. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      alignItems="center"
      justifyContent="center"
      className="login-page" // Added a className for scoping styles
      bgGradient="linear(to-r, #FFD559, #F3C847)" // Gradient background
      p={4}
    >
      <Flex
        direction="column"
        bg="yellow.100"
        boxShadow="lg"
        borderRadius="md"
        p={8}
        width={["90%", "400px"]}
      >
        <Flex justifyContent="center" mb={4}>
          <Image src="/apps_logo.png" alt="Logo" boxSize="100px" />
        </Flex>
        <Heading as="h2" size="lg" textAlign="center" color="gray.850" mb={6}>
          PMD Portal1
        </Heading>
        {/* Form */}
        <VStack as="form" onSubmit={handleSubmit} spacing={4}>
          {/* Username Input */}
          <FormControl isRequired>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiUser color="gray.500" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="gray.50"
                borderRadius="full"
              />
            </InputGroup>
          </FormControl>

          {/* Password Input */}
          <FormControl isRequired>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiLock color="gray.500" />
              </InputLeftElement>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="gray.50"
                borderRadius="full"
              />
            </InputGroup>
          </FormControl>

          {error && <Text color="red.500">{error}</Text>}

          {/* Login Button */}
          <Button
            type="submit"
            width="100%"
            bgGradient="linear(to-r, #FFB700, #FF8500)"
            color="white"
            _hover={{ bgGradient: "linear(to-r, #FF8500, #FFB700)" }}
            borderRadius="full"
            boxShadow="md"
            transition="all 0.3s ease-in-out"
          >
            Log In
          </Button>

          <Flex direction="column" width="100%" alignItems="center">
            <Button variant="link" colorScheme="orange" onClick={handleEnroll}>
              Enroll
            </Button>
            <Text
              as="button"
              color="blue.500"
              onClick={onOpen}
              fontSize="sm"
              mt={2} // Add margin-top to create spacing between the button and text
              _hover={{ textDecoration: "underline" }}
            >
              Track your enrollment progress
            </Text>
            <VStack spacing={3} mt={4} display="none">
              <Input type="file" accept=".xlsx" onChange={handleFileUpload} />
              <Button colorScheme="blue" onClick={handleImportDistricts}>
                Import Districts
              </Button>
              <Button colorScheme="green" onClick={handleImportLocal}>
                Import Local Congregations
              </Button>
            </VStack>
          </Flex>
          {/* Modal for Reference Number */}
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Track Enrollment Progress</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {/* Input Name */}
                <FormControl mb={4}>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    placeholder="Enter your first name + surname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
                {/* Input Date of Birth */}
                <FormControl mb={4}>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </FormControl>
                {/* Input or Retrieved Reference Number */}
                <FormControl mb={4}>
                  <FormLabel>Reference Number</FormLabel>
                  <Input
                    placeholder="Enter or Retrieve Reference Number"
                    value={retrievedReference || referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                {/* Retrieve Reference Button */}
                <Button
                  colorScheme="blue"
                  onClick={handleRetrieveReference}
                  isLoading={isLoading}
                  loadingText="Retrieving"
                  mr={3}
                >
                  Retrieve Reference
                </Button>

                {/* Proceed Button */}
                <Button
                  colorScheme="yellow"
                  onClick={handleTrackProgress}
                  mr={3}
                >
                  Proceed
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Login;
