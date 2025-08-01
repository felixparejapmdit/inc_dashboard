import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Flex,
  FormControl,
  Select,
  Checkbox,
  FormLabel,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import axios from "axios";
//import Barcode from "react-qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { FaDownload, FaShareAlt } from "react-icons/fa"; // Font Awesome download icon
import { usePermissionContext } from "../../contexts/PermissionContext";

import { getAuthHeaders } from "../../utils/apiHeaders"; // adjust path as needed

import {
  fetchData,
  postData,
  putData,
  deleteData,
} from "../../utils/fetchData";

const FileManagement = (qrcode) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { hasPermission } = usePermissionContext(); // Correct usage
  const [currentUserId, setCurrentUserId] = useState(null);

  const qrCodeRef = useRef(null);
  const [selectedQrUrl, setSelectedQrUrl] = useState(null);
  const [selectedGeneratedCode, setSelectedGeneratedCode] = useState("");

  const [newFile, setNewFile] = useState({
    filename: "",
    url: "",
    generated_code: "",
    qrcode: "",
    user_id: null, // Start as null
  });

  const downloadQRCode = (url, generatedCode = "") => {
    const tempWrapper = document.createElement("div");
    document.body.appendChild(tempWrapper);

    const tempQRCode = (
      <QRCodeCanvas value={url} size={200} includeMargin={false} level="H" />
    );

    import("react-dom").then((ReactDOM) => {
      ReactDOM.render(tempQRCode, tempWrapper);

      setTimeout(() => {
        const qrCanvas = tempWrapper.querySelector("canvas");

        if (qrCanvas) {
          const originalWidth = qrCanvas.width;
          const originalHeight = qrCanvas.height;
          const scale = 1.5;
          const scaledWidth = originalWidth * scale;
          const scaledHeight = originalHeight * scale;
          const padding = 10; // Reduced padding to minimize space

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set the target width for the label (same as the QR code width)
          const targetWidth = scaledWidth;

          // Calculate font size to exactly fit the label within the targetWidth
          let fontSize = 118; // Start with a large font size
          let textWidth = 0;

          // Decrease font size until the text width matches the target width
          do {
            ctx.font = `bold ${fontSize}px Calibri`;
            textWidth = ctx.measureText(generatedCode).width;
            fontSize--;
          } while (textWidth > targetWidth && fontSize > 0); // Ensure label fits within the width of the QR code

          // Measure final label height (approximate)
          const textHeight = fontSize + 10;

          canvas.width = scaledWidth + padding * 2;
          canvas.height = scaledHeight + padding + textHeight + padding;

          // Draw white background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw scaled QR code
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(qrCanvas, padding, padding, scaledWidth, scaledHeight);

          // Draw a red border around the QR code area (for debugging)
          //ctx.strokeStyle = "red";
          //ctx.lineWidth = 5;
          //ctx.strokeRect(padding, padding, scaledWidth, scaledHeight);

          // Draw label below the QR code, matching its width
          ctx.fillStyle = "#000000";
          ctx.font = `bold ${fontSize}px Calibri`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          // Position the label closer to the QR code
          const labelTopPosition = scaledHeight + padding + 5; // minimal gap between QR and label
          ctx.fillText(generatedCode, canvas.width / 2, labelTopPosition);

          // Download the QR code with label
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "qrcode_with_code.png";
          link.click();

          toast({
            title: "QR code downloaded successfully",
            status: "success",
            duration: 3000,
          });

          ReactDOM.unmountComponentAtNode(tempWrapper);
          document.body.removeChild(tempWrapper);
        } else {
          toast({
            title: "Failed to render QR code",
            status: "error",
            duration: 3000,
          });
          document.body.removeChild(tempWrapper);
        }
      }, 100);
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPreviewOpen, setIsModalPreviewOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  const [users, setUsers] = useState([]);
  const [alreadySharedUserIds, setAlreadySharedUserIds] = useState([]); // List of users who already have the file
  const [alreadySharedUsers, setAlreadySharedUsers] = useState([]); // new

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const [file_id, setFileId] = useState(
    editingFile ? editingFile.id : newFile.id
  );

  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 5;

  const [isVIP, setIsVIP] = useState(false); // default to false

  useEffect(() => {
    const username = localStorage.getItem("username");

    if (username) {
      fetchData(
        `users_access`, // endpoint
        (data) => {
          setCurrentUserId(data.id);
          setNewFile((prev) => ({
            ...prev,
            user_id: data.id,
          }));
        },
        (err) => {
          console.error("Failed to fetch user:", err);
        },
        `Failed to fetch user for ${username}`,
        username // params (appended to endpoint)
      );
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchFilesByUserId(currentUserId); // only fetch when we have a user ID
      setNewFile((prev) => ({ ...prev, user_id: currentUserId }));
    }
  }, [currentUserId]);

  const fetchFilesByUserId = async (userId) => {
    try {
      const data = await fetchData(
        `files/user/${userId}`,
        null,
        (msg) => {
          toast({
            title: "Error loading files",
            description: msg,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
        "Failed to load files"
      );

      if (data) {
        const { files, isVIP } = data;
        setFiles(files);
        setFilteredFiles(files);
        setIsVIP(isVIP);
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // useEffect(() => {
  //   const filtered = files.filter((file) => {
  //     return (
  //       file?.filename
  //         ?.toLowerCase()
  //         .includes(searchQuery?.toLowerCase() || "") ||
  //       file?.url?.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
  //       file?.generated_code
  //         ?.toLowerCase()
  //         .includes(searchQuery?.toLowerCase() || "") ||
  //       file?.qrcode?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
  //     );
  //   });

  //   // Calculate which files to display based on the current page
  //   const indexOfLastFile = currentPage * filesPerPage;
  //   const indexOfFirstFile = indexOfLastFile - filesPerPage;
  //   const currentFiles = filtered.slice(indexOfFirstFile, indexOfLastFile);

  //   setFilteredFiles(currentFiles);
  // }, [searchQuery, files, currentPage]);

  useEffect(() => {
    if (!Array.isArray(files)) return;

    const filtered = files.filter((file) => {
      return (
        file?.filename
          ?.toLowerCase()
          .includes(searchQuery?.toLowerCase() || "") ||
        file?.url?.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
        file?.generated_code
          ?.toLowerCase()
          .includes(searchQuery?.toLowerCase() || "") ||
        file?.qrcode?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
      );
    });

    const indexOfLastFile = currentPage * filesPerPage;
    const indexOfFirstFile = indexOfLastFile - filesPerPage;
    const currentFiles = filtered.slice(indexOfFirstFile, indexOfLastFile);

    setFilteredFiles(currentFiles);
  }, [searchQuery, files, currentPage]);

  const totalPages = Math.ceil(files.length / filesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // This Set will keep track of already generated codes in this session
  const generatedCodes = new Set();

  const generateCode = () => {
    const getRandomLetters = () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      return (
        letters.charAt(Math.floor(Math.random() * 26)) +
        letters.charAt(Math.floor(Math.random() * 26))
      );
    };

    const getRandomDigits = () => {
      return Math.floor(10 + Math.random() * 90); // Two-digit number: 10–99
    };

    let newCode = "";

    do {
      const letters = getRandomLetters();
      const digits = getRandomDigits();
      newCode = `${letters}${digits}`;
    } while (generatedCodes.has(newCode)); // Regenerate if already exists

    generatedCodes.add(newCode); // Store to avoid duplication
    return newCode;
  };

  const handleGenerateCode = () => {
    // Check if filename and url are filled
    if (!newFile.filename || !newFile.url) {
      // Optionally show a message to prompt the user
      alert(
        "Please fill in both the filename and URL before generating the code."
      );

      // Prevent further execution if fields are still empty
      return;
    }

    const generatedCode = generateCode();
    const qrcode = generatedCode; // Rename qrcode to qrcode

    if (editingFile) {
      setEditingFile({
        ...editingFile,
        generated_code: generatedCode,
        qrcode: qrcode, // Save qrcode instead of qrcode
      });
    } else {
      setNewFile({
        ...newFile,
        generated_code: generatedCode,
        qrcode: qrcode, // Save qrcode instead of qrcode
      });
    }
  };

  const handleAddFile = async () => {
    const code = generateCode();

    const updatedNewFile = {
      ...newFile,
      user_id: newFile.user_id || currentUserId,
      generated_code: code,
      qrcode: code,
    };

    const { filename, url, generated_code, qrcode, user_id, thumbnailFile } =
      updatedNewFile;

    const isValidUrl = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm.test(url);

    if (!filename || !url || !qrcode || !user_id) {
      toast({
        title: "All fields including user must be filled",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!isValidUrl) {
      toast({
        title: "Please enter a valid URL",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("filename", filename);
      formData.append("url", url);
      formData.append("generated_code", generated_code);
      formData.append("qrcode", qrcode);
      formData.append("user_id", user_id);
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile); // ✅ KEY MUST BE "thumbnail"
      }

      await postData("add-file", formData, "Failed to upload file.");

      fetchFilesByUserId(user_id);
      setNewFile({
        filename: "",
        url: "",
        generated_code: "",
        qrcode: "",
        user_id,
        thumbnailFile: null,
      });
      setIsModalOpen(false);
      toast({ title: "File added", status: "success", duration: 3000 });
    } catch (error) {
      toast({ title: "Error adding file", status: "error", duration: 3000 });
    }
  };

  const handleUpdateFile = async () => {
    //const code = generateCode();
    const updatedEditingFile = {
      ...editingFile,
      // generated_code: code,
      // qrcode: code,
    };

    const { filename, url, generated_code, user_id, qrcode } =
      updatedEditingFile;

    if (!filename || !url || !generated_code || !qrcode) {
      toast({
        title: "All fields are required",
        description:
          "Filename, URL, Generated Code, and Barcode must be filled.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await putData(
        "file-management",
        editingFile.id,
        updatedEditingFile,
        "Failed to update file."
      );

      fetchFilesByUserId(user_id);
      setEditingFile(null);
      setIsModalOpen(false);
      toast({ title: "File updated", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error updating file",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteFile = async () => {
    try {
      await deleteData(
        "file-management",
        deletingFile.id,
        "Failed to delete file."
      );

      fetchFilesByUserId(currentUserId);
      toast({ title: "File deleted", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Error deleting file",
        status: "error",
        duration: 3000,
      });
    } finally {
      setDeletingFile(null);
    }
  };

  const fetchAlreadySharedUserIds = async (fileId) => {
    try {
      const data = await fetchData(
        `files/${fileId.id}/shared-users`,
        null,
        null,
        "Failed to fetch shared users"
      );

      setAlreadySharedUserIds(data.sharedUserIds);

      const sharedUsers = users.filter((user) =>
        data.sharedUserIds.includes(user.user_id)
      );
      setAlreadySharedUsers(sharedUsers);
    } catch (error) {
      console.error("Error fetching shared users:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      await fetchData("users", setUsers, console.error, "Failed to load users");
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const matches = users.filter((user) =>
      `${user.givenName} ${user.sn} ${user.user_id}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    // Combine with alreadySharedUsers
    const combined = [...matches, ...alreadySharedUsers];

    // Deduplicate by user_id
    const uniqueUsers = combined.filter(
      (user, index, self) =>
        index === self.findIndex((u) => u.user_id === user.user_id)
    );

    setFilteredUsers(uniqueUsers);
  }, [searchTerm, users, alreadySharedUsers]);

  const handleCheckboxChange = (user_id) => {
    setSelectedUserIds((prevSelected) =>
      prevSelected.includes(user_id)
        ? prevSelected.filter((id) => id !== user_id)
        : [...prevSelected, user_id]
    );
  };

  const handleShareFile = async () => {
    if (
      !selectedFile?.id ||
      (selectedUserIds && selectedUserIds.length === 0)
    ) {
      toast({
        title: "Missing file or user",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const payload = {
        file_id: selectedFile.id, // The ID of the file being shared
        user_ids: selectedUserIds || [], // Ensure user_ids is always an array
      };

      console.log("Sharing file with payload:", payload); // Debugging

      const response = await postData(
        "files/share",
        payload,
        "Failed to share file."
      );

      const data = await response.json();
      // if (data.alreadySharedUserIds) {
      //   setAlreadySharedUserIds(data.alreadySharedUserIds || []); // Update the already shared users safely
      // }

      if (data.alreadySharedWith) {
        setAlreadySharedUserIds(data.alreadySharedWith || []);
      }

      if (response.ok) {
        toast({
          title: "File shared successfully!",
          status: "success",
          duration: 3000,
        });
        setIsShareModalOpen(false);
      } else {
        toast({
          title: data.message || "Failed to share file.",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      toast({
        title: "Error sharing file.",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Text fontSize="28px" fontWeight="bold">
          Share a link
        </Text>
        <Flex justify="space-between" align="center">
          <Input
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            width="250px"
          />

          {hasPermission("link.newfile") && (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="orange"
              onClick={() => {
                setEditingFile(null); // Reset editing mode
                setNewFile({
                  filename: "",
                  url: "",
                  generated_code: "",
                  qrcode: "",
                }); // Optional: clear newFile state
                setIsModalOpen(true);
              }}
            >
              New File
            </Button>
          )}
        </Flex>
        {filteredFiles.length === 0 ? (
          <p style={{ textAlign: "center", fontWeight: "bold", color: "gray" }}>
            No data available
          </p>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                isDisabled={currentPage === 1}
              >
                Previous
              </Button>

              <Text alignSelf="center">
                Page {currentPage} of {totalPages}
              </Text>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                isDisabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Box>

            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Filename</Th>
                  <Th>Generated Code</Th>

                  {hasPermission("link.qrcode") && <Th>QR Code</Th>}
                  <Th>Sender</Th>
                  <Th>Date Created</Th>
                  {hasPermission("link.action") &&
                    filteredFiles.some(
                      (file) => file.user_id === currentUserId
                    ) && (
                      <Th width="20%" textAlign="right">
                        Actions
                      </Th>
                    )}
                </Tr>
              </Thead>
              <Tbody>
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file, index) => (
                    // <Tr key={file.id}>
                    <Tr key={`${file.id}-${index}`}>
                      <Td>{index + 1}</Td>
                      <Td>
                        {file.filename
                          ? file.filename.charAt(0).toUpperCase() +
                            file.filename.slice(1)
                          : "N/A"}
                      </Td>

                      <Td>
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#1a73e8",
                              textDecoration: "underline",
                            }} // Styling the link
                          >
                            {file.generated_code}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </Td>
                      {hasPermission("link.qrcode") && (
                        <Td>
                          {qrcode ? (
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                ref={qrCodeRef}
                                style={{ textAlign: "center" }}
                              >
                                <QRCodeCanvas
                                  value={file.url}
                                  size={48}
                                  bgColor="transparent"
                                  fgColor="#000000"
                                  level="H"
                                  style={{
                                    width: "48px",
                                    height: "48px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setSelectedQrUrl(file.url); // set selected QR
                                    setSelectedGeneratedCode(
                                      file.generated_code
                                    ); // new
                                    setIsModalPreviewOpen(true);
                                  }}
                                />
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    fontFamily: "Calibri, sans-serif",
                                    marginTop: "4px",
                                    color: "#333",
                                  }}
                                >
                                  {file.generated_code}
                                </div>
                              </div>
                              <i
                                onClick={() =>
                                  downloadQRCode(file.url, file.generated_code)
                                }
                                style={{
                                  marginLeft: "10px",
                                  cursor: "pointer",
                                  fontSize: "20px",
                                  color: "#4CAF50",
                                }}
                              >
                                <FaDownload />
                              </i>
                            </div>
                          ) : (
                            "N/A"
                          )}

                          {/* Modal Implementation */}
                          {isModalPreviewOpen && (
                            <div
                              style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 1000,
                              }}
                              onClick={() => {
                                setIsModalPreviewOpen(false);
                                setSelectedQrUrl(null);
                              }}
                            >
                              <div
                                style={{
                                  backgroundColor: "#fff",
                                  padding: "20px",
                                  borderRadius: "8px",
                                  position: "relative",
                                }}
                                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                              >
                                <QRCodeCanvas
                                  value={selectedQrUrl}
                                  size={256}
                                  bgColor="#ffffff"
                                  fgColor="#000000"
                                  level="H"
                                  style={{ width: "256px", height: "256px" }}
                                />
                                <p
                                  style={{
                                    textAlign: "center",
                                    marginTop: "10px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {selectedGeneratedCode}
                                </p>

                                <button
                                  onClick={() => {
                                    setIsModalPreviewOpen(false);
                                    setSelectedQrUrl(null);
                                  }}
                                  style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    background: "none",
                                    border: "none",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                  }}
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          )}
                        </Td>
                      )}
                      <Td>
                        {file.user?.personnel
                          ? `${file.user.personnel.givenname || ""} ${
                              file.user.personnel.middlename || ""
                            } ${file.user.personnel.surname_husband || ""}`
                          : "N/A"}
                      </Td>

                      <Td>
                        {new Date(file.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Td>

                      {hasPermission("link.action") &&
                      file.user_id === currentUserId ? (
                        <Td textAlign="right">
                          <IconButton
                            icon={<EditIcon />}
                            colorScheme="yellow"
                            aria-label="Edit"
                            onClick={() => {
                              setEditingFile(file);
                              setIsModalOpen(true);
                            }}
                            mr={2}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            aria-label="Delete"
                            onClick={() => setDeletingFile(file)}
                            mr={2}
                          />
                          <IconButton
                            icon={<FaShareAlt />}
                            colorScheme="blue"
                            aria-label="Share"
                            onClick={() => {
                              setSelectedFile(file);
                              fetchAlreadySharedUserIds(file); // Fetch shared users here
                              setIsShareModalOpen(true);
                            }}
                          />

                          <Modal
                            isOpen={isShareModalOpen}
                            onClose={() => setIsShareModalOpen(false)}
                            size="lg"
                          >
                            <ModalOverlay />
                            <ModalContent>
                              <ModalHeader>
                                Select users to share this file with
                              </ModalHeader>
                              <ModalCloseButton />
                              <ModalBody>
                                <Input
                                  placeholder="Search users..."
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  mb={4}
                                />
                                <Stack
                                  spacing={3}
                                  maxHeight="450px"
                                  overflowY="auto"
                                >
                                  {users &&
                                    users
                                      .filter(
                                        (user) =>
                                          selectedUserIds.includes(
                                            user.user_id
                                          ) ||
                                          user.givenName
                                            .toLowerCase()
                                            .includes(
                                              searchTerm.toLowerCase()
                                            ) ||
                                          user.sn
                                            .toLowerCase()
                                            .includes(
                                              searchTerm.toLowerCase()
                                            ) ||
                                          String(user.user_id)
                                            .toLowerCase()
                                            .includes(searchTerm.toLowerCase())
                                      )
                                      .filter(
                                        (user, index, self) =>
                                          index ===
                                          self.findIndex(
                                            (u) => u.user_id === user.user_id
                                          )
                                      )
                                      .sort((a, b) =>
                                        a.givenName.localeCompare(b.givenName)
                                      )
                                      .map((user) => (
                                        <Checkbox
                                          key={user.user_id}
                                          isChecked={
                                            selectedUserIds.includes(
                                              user.user_id
                                            ) ||
                                            alreadySharedUserIds.includes(
                                              user.user_id
                                            )
                                          }
                                          onChange={() =>
                                            handleCheckboxChange(user.user_id)
                                          }
                                        >
                                          {user.givenName} {user.sn}{" "}
                                          {alreadySharedUserIds.includes(
                                            user.user_id
                                          ) && (
                                            <span
                                              style={{
                                                color: "green",
                                                marginLeft: "8px",
                                              }}
                                            >
                                              ✔
                                            </span>
                                          )}
                                        </Checkbox>
                                      ))}
                                  {users.length === 0 && (
                                    <Box>No users found.</Box>
                                  )}
                                </Stack>
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  colorScheme="blue"
                                  onClick={handleShareFile}
                                  isDisabled={selectedUserIds.length === 0}
                                >
                                  Share
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => setIsShareModalOpen(false)}
                                >
                                  Cancel
                                </Button>
                              </ModalFooter>
                            </ModalContent>
                          </Modal>
                        </Td>
                      ) : (
                        !isVIP && (
                          <Td
                            textAlign="right"
                            fontWeight="bold"
                            color="blue.600"
                          >
                            Shared link
                          </Td>
                        )
                      )}
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td
                      colSpan={6}
                      textAlign="center"
                      fontWeight="bold"
                      color="gray.600"
                    >
                      No files found.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                isDisabled={currentPage === 1}
              >
                Previous
              </Button>

              <Text alignSelf="center">
                Page {currentPage} of {totalPages}
              </Text>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                isDisabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Box>
          </>
        )}
      </Stack>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          // Check if any of the fields have values
          if (!newFile.filename && !newFile.url && !newFile.generated_code) {
            setIsModalOpen(false); // Close modal only if no field has a value
          }
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingFile ? "Edit File" : "Add New File"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" gap={3}>
            <FormControl isRequired>
              <Input
                placeholder="Filename"
                value={
                  editingFile ? editingFile.filename : newFile.filename || ""
                }
                onChange={(e) =>
                  editingFile
                    ? setEditingFile({
                        ...editingFile,
                        filename: e.target.value,
                      })
                    : setNewFile({ ...newFile, filename: e.target.value })
                }
              />
            </FormControl>

            <FormControl isRequired>
              <Input
                placeholder="URL"
                value={editingFile ? editingFile.url : newFile.url || ""}
                onChange={(e) =>
                  editingFile
                    ? setEditingFile({ ...editingFile, url: e.target.value })
                    : setNewFile({ ...newFile, url: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>Thumbnail Image</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  if (!editingFile) {
                    setNewFile((prev) => ({ ...prev, thumbnailFile: file }));
                  } else {
                    setEditingFile((prev) => ({
                      ...prev,
                      thumbnailFile: file,
                    }));
                  }
                }}
              />
            </FormControl>

            {/* <FormControl isRequired>
              <Input
                placeholder="Generated Code"
                value={
                  editingFile
                    ? editingFile.generated_code
                    : newFile.generated_code || ""
                }
                onChange={(e) =>
                  editingFile
                    ? setEditingFile({
                        ...editingFile,
                        generated_code: e.target.value,
                      })
                    : setNewFile({ ...newFile, generated_code: e.target.value })
                }
                isReadOnly
              />
            </FormControl>
            <Button onClick={handleGenerateCode} colorScheme="blue" mb={3}>
              Generate Code
            </Button> */}
            {(editingFile?.qrcode || newFile?.qrcode) && (
              <Box
                style={{
                  display: "flex",
                  flexDirection: "column", // Stack text and QR code vertically
                  justifyContent: "center", // Centers horizontally
                  alignItems: "center", // Centers vertically
                  marginTop: "5px", // Optional: Adjust spacing from the top
                }}
              >
                <Text
                  fontWeight="bold"
                  style={{ textAlign: "center", marginBottom: "10px" }}
                >
                  QR Code Preview:
                </Text>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center", // Centers QR code horizontally
                    alignItems: "center", // Centers QR code vertically
                  }}
                >
                  <QRCodeCanvas
                    value={editingFile?.qrcode || newFile?.qrcode}
                    size={128}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
              </Box>
            )}

            {currentUserId ? (
              <Input
                type="hidden"
                value={currentUserId}
                isReadOnly
                placeholder="User ID"
              />
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={editingFile ? handleUpdateFile : handleAddFile}
            >
              {editingFile ? "Update" : "Save"}
            </Button>
            <Button onClick={() => setIsModalOpen(false)} ml={3}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!deletingFile}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeletingFile(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete File
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{deletingFile?.name}"? This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeletingFile(null)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteFile} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default FileManagement;
