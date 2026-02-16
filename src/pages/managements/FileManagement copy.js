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
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Checkbox,
    Flex,
    Badge,
    Tooltip,
    useDisclosure,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Card,
    CardBody,
    CardHeader,
    Heading,
    VStack,
    HStack,
    Divider,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useBreakpointValue,
    Container,
    Avatar,
    AvatarGroup,
} from "@chakra-ui/react";
import {
    AddIcon,
    DeleteIcon,
    EditIcon,
    SearchIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DownloadIcon,
    ViewIcon,
    LinkIcon,
    CopyIcon,
} from "@chakra-ui/icons";
import { FaShareAlt, FaDownload, FaQrcode, FaEllipsisV, FaFilter } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { usePermissionContext } from "../../contexts/PermissionContext";
import { getAuthHeaders } from "../../utils/apiHeaders";
import {
    fetchData,
    postData,
    putData,
    deleteData,
    putFileData,
} from "../../utils/fetchData";

const FileManagement = ({ qrcode }) => {
    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [newFile, setNewFile] = useState({
        filename: "",
        url: "",
        generated_code: "",
        qrcode: "",
        thumbnailFile: null,
    });
    const [editingFile, setEditingFile] = useState(null);
    const [deletingFile, setDeletingFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filesPerPage] = useState(10);
    const [selectedFile, setSelectedFile] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [alreadySharedUserIds, setAlreadySharedUserIds] = useState([]);
    const [alreadySharedUsers, setAlreadySharedUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedQrUrl, setSelectedQrUrl] = useState(null);
    const [selectedGeneratedCode, setSelectedGeneratedCode] = useState("");
    const [isVIP, setIsVIP] = useState(false);
    const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const { isOpen: isShareModalOpen, onOpen: onShareModalOpen, onClose: onShareModalClose } = useDisclosure();
    const { isOpen: isModalPreviewOpen, onOpen: onModalPreviewOpen, onClose: onModalPreviewClose } = useDisclosure();
    const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();

    const toast = useToast();
    const qrCodeRef = useRef();
    const cancelRef = useRef();
    const { hasPermission } = usePermissionContext();

    const currentUserId = localStorage.getItem("user_id");
    const isMobile = useBreakpointValue({ base: true, md: false });

    useEffect(() => {
        if (currentUserId) {
            fetchFilesByUserId(currentUserId);
        }
    }, [currentUserId]);

    const downloadQRCode = (url, generatedCode = "") => {
        const canvas = document.createElement("canvas");
        const size = 512;
        canvas.width = size;
        canvas.height = size + 60;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const qrCanvas = document.createElement("canvas");
        const qrCtx = qrCanvas.getContext("2d");

        import("qrcode").then((QRCode) => {
            QRCode.toCanvas(
                qrCanvas,
                url,
                {
                    width: size,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff",
                    },
                    errorCorrectionLevel: "H",
                },
                (error) => {
                    if (error) {
                        console.error("QR Code generation error:", error);
                        toast({
                            title: "Error generating QR code",
                            status: "error",
                            duration: 3000,
                        });
                        return;
                    }

                    ctx.drawImage(qrCanvas, 0, 0, size, size);

                    if (generatedCode) {
                        ctx.fillStyle = "#000000";
                        ctx.font = "bold 28px Calibri, sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText(generatedCode, size / 2, size + 40);
                    }

                    canvas.toBlob((blob) => {
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `qrcode_${generatedCode || "download"}.png`;
                        link.click();
                        URL.revokeObjectURL(link.href);

                        toast({
                            title: "QR Code downloaded successfully!",
                            status: "success",
                            duration: 2000,
                        });
                    });
                }
            );
        });
    };

    const fetchFilesByUserId = async (userId) => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/files/user/${userId}`,
                {
                    method: "GET",
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch files");
            }

            const data = await response.json();
            if (data && Array.isArray(data.files)) {
                setFiles(data.files);
                const isVIP = data.isVIP || false;
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
            return Math.floor(10 + Math.random() * 90);
        };

        let newCode = "";

        do {
            const letters = getRandomLetters();
            const digits = getRandomDigits();
            newCode = `${letters}${digits}`;
        } while (generatedCodes.has(newCode));

        generatedCodes.add(newCode);
        return newCode;
    };

    const handleGenerateCode = () => {
        if (!newFile.filename || !newFile.url) {
            toast({
                title: "Missing Information",
                description: "Please fill in both the filename and URL before generating the code.",
                status: "warning",
                duration: 3000,
            });
            return;
        }

        const generatedCode = generateCode();
        const qrcode = generatedCode;

        if (editingFile) {
            setEditingFile({
                ...editingFile,
                generated_code: generatedCode,
                qrcode: qrcode,
            });
        } else {
            setNewFile({
                ...newFile,
                generated_code: generatedCode,
                qrcode: qrcode,
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
                formData.append("thumbnail", thumbnailFile);
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
            onModalClose();
            toast({ title: "File added successfully!", status: "success", duration: 3000 });
        } catch (error) {
            toast({ title: "Error adding file", status: "error", duration: 3000 });
        }
    };

    const handleUpdateFile = async () => {
        const updatedEditingFile = { ...editingFile };

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
            await putFileData("file-management", editingFile.id, updatedEditingFile);

            fetchFilesByUserId(user_id);
            setEditingFile(null);
            onModalClose();
            toast({ title: "File updated successfully!", status: "success", duration: 3000 });
        } catch (error) {
            toast({
                title: "Error updating file",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        }
    };

    const handleDeleteFile = async () => {
        if (!deletingFile) return;

        try {
            await deleteData("file-management", deletingFile.id);
            fetchFilesByUserId(currentUserId);
            toast({
                title: "File deleted successfully!",
                status: "success",
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: "Error deleting file",
                description: error.message,
                status: "error",
                duration: 3000,
            });
        } finally {
            setDeletingFile(null);
            onDeleteAlertClose();
        }
    };

    const fetchAlreadySharedUserIds = (fileId) => {
        fetchData(
            `files/${fileId.id}/shared-users`,
            (data) => {
                setAlreadySharedUserIds(data.sharedUserIds);

                const sharedUsers = users.filter((user) =>
                    data.sharedUserIds.includes(user.user_id)
                );
                setAlreadySharedUsers(sharedUsers);
            },
            (err) => {
                console.error("Failed to fetch already shared users:", err);
            },
            "Failed to fetch shared users"
        );
    };

    const fetchUsers = () => {
        fetchData(
            "users",
            (data) => setUsers(data),
            (err) => {
                console.error("Failed to load users:", err);
            },
            "Failed to load users"
        );
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

        const combined = [...matches, ...alreadySharedUsers];

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
                file_id: selectedFile.id,
                user_ids: selectedUserIds || [],
            };

            const response = await postData(
                "files/share",
                payload,
                "Failed to share file."
            );

            const data = await response.json();

            if (data.alreadySharedWith) {
                setAlreadySharedUserIds(data.alreadySharedWith || []);
            }

            if (response.ok) {
                toast({
                    title: "File shared successfully!",
                    status: "success",
                    duration: 3000,
                });
                onShareModalClose();
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
            status: "success",
            duration: 2000,
        });
    };

    return (
        <Container maxW="container.xl" py={{ base: 4, md: 6 }}>
            <VStack spacing={6} align="stretch">
                {/* Header Section */}
                <Box>
                    <Heading
                        as="h1"
                        size={{ base: "lg", md: "xl" }}
                        bgGradient="linear(to-r, orange.400, orange.600)"
                        bgClip="text"
                        mb={2}
                    >
                        Share a Link
                    </Heading>
                    <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                        Manage and share your files with QR codes
                    </Text>
                </Box>

                {/* Search and Actions Bar */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }}
                    gap={4}
                    bg="white"
                    p={4}
                    borderRadius="lg"
                    boxShadow="sm"
                >
                    <InputGroup maxW={{ base: "100%", md: "350px" }}>
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                            placeholder="Search files, codes, or URLs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            borderRadius="full"
                            bg="gray.50"
                            _focus={{ bg: "white", borderColor: "orange.400" }}
                        />
                    </InputGroup>

                    <HStack spacing={3}>
                        {/* View Mode Toggle */}
                        <HStack
                            bg="gray.100"
                            borderRadius="full"
                            p={1}
                            display={{ base: "none", md: "flex" }}
                        >
                            <IconButton
                                icon={<ViewIcon />}
                                size="sm"
                                borderRadius="full"
                                colorScheme={viewMode === "table" ? "orange" : "gray"}
                                variant={viewMode === "table" ? "solid" : "ghost"}
                                onClick={() => setViewMode("table")}
                                aria-label="Table view"
                            />
                            <IconButton
                                icon={<FaQrcode />}
                                size="sm"
                                borderRadius="full"
                                colorScheme={viewMode === "grid" ? "orange" : "gray"}
                                variant={viewMode === "grid" ? "solid" : "ghost"}
                                onClick={() => setViewMode("grid")}
                                aria-label="Grid view"
                            />
                        </HStack>

                        {hasPermission("link.newfile") && (
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="orange"
                                size={{ base: "md", md: "md" }}
                                borderRadius="full"
                                onClick={() => {
                                    setEditingFile(null);
                                    setNewFile({
                                        filename: "",
                                        url: "",
                                        generated_code: "",
                                        qrcode: "",
                                    });
                                    onModalOpen();
                                }}
                                boxShadow="md"
                                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                                transition="all 0.2s"
                            >
                                New File
                            </Button>
                        )}
                    </HStack>
                </Flex>

                {/* Stats Cards */}
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
                    <Card>
                        <CardBody>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                    Total Files
                                </Text>
                                <Heading size="lg" color="orange.500">
                                    {files.length}
                                </Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                    My Files
                                </Text>
                                <Heading size="lg" color="blue.500">
                                    {files.filter((f) => f.user_id === currentUserId).length}
                                </Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                    Shared Files
                                </Text>
                                <Heading size="lg" color="green.500">
                                    {files.filter((f) => f.user_id !== currentUserId).length}
                                </Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="sm" color="gray.600">
                                    Current Page
                                </Text>
                                <Heading size="lg" color="purple.500">
                                    {currentPage}/{totalPages || 1}
                                </Heading>
                            </VStack>
                        </CardBody>
                    </Card>
                </SimpleGrid>

                {/* Content Area */}
                {filteredFiles.length === 0 ? (
                    <Card>
                        <CardBody>
                            <VStack spacing={4} py={10}>
                                <LinkIcon boxSize={12} color="gray.300" />
                                <Text fontSize="lg" fontWeight="bold" color="gray.500">
                                    No files found
                                </Text>
                                <Text color="gray.400" textAlign="center">
                                    {searchQuery
                                        ? "Try adjusting your search terms"
                                        : "Get started by creating your first file"}
                                </Text>
                            </VStack>
                        </CardBody>
                    </Card>
                ) : viewMode === "grid" ? (
                    /* Grid View */
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {filteredFiles.map((file, index) => (
                            <Card
                                key={`${file.id}-${index}`}
                                overflow="hidden"
                                _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                                transition="all 0.3s"
                            >
                                <CardHeader bg="orange.50" pb={3}>
                                    <Flex justify="space-between" align="start">
                                        <VStack align="start" spacing={1} flex={1}>
                                            <Heading size="sm" noOfLines={1}>
                                                {file.filename}
                                            </Heading>
                                            <Badge colorScheme={file.user_id === currentUserId ? "orange" : "blue"}>
                                                {file.user_id === currentUserId ? "My File" : "Shared"}
                                            </Badge>
                                        </VStack>
                                        {hasPermission("link.action") && file.user_id === currentUserId && (
                                            <Menu>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={<FaEllipsisV />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <MenuList>
                                                    <MenuItem
                                                        icon={<EditIcon />}
                                                        onClick={() => {
                                                            setEditingFile(file);
                                                            onModalOpen();
                                                        }}
                                                    >
                                                        Edit
                                                    </MenuItem>
                                                    <MenuItem
                                                        icon={<FaShareAlt />}
                                                        onClick={() => {
                                                            setSelectedFile(file);
                                                            fetchAlreadySharedUserIds(file);
                                                            onShareModalOpen();
                                                        }}
                                                    >
                                                        Share
                                                    </MenuItem>
                                                    <MenuItem
                                                        icon={<DeleteIcon />}
                                                        color="red.500"
                                                        onClick={() => {
                                                            setDeletingFile(file);
                                                            onDeleteAlertOpen();
                                                        }}
                                                    >
                                                        Delete
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        )}
                                    </Flex>
                                </CardHeader>
                                <CardBody>
                                    <VStack spacing={4}>
                                        {/* QR Code */}
                                        <Box
                                            p={3}
                                            bg="white"
                                            borderRadius="md"
                                            border="2px"
                                            borderColor="gray.200"
                                            cursor="pointer"
                                            onClick={() => {
                                                setSelectedQrUrl(file.url);
                                                setSelectedGeneratedCode(file.generated_code);
                                                onModalPreviewOpen();
                                            }}
                                            _hover={{ borderColor: "orange.400" }}
                                            transition="all 0.2s"
                                        >
                                            <QRCodeCanvas
                                                value={file.url}
                                                size={120}
                                                bgColor="transparent"
                                                fgColor="#000000"
                                                level="H"
                                            />
                                            <Text
                                                mt={2}
                                                fontSize="sm"
                                                fontWeight="bold"
                                                textAlign="center"
                                                color="gray.700"
                                            >
                                                {file.generated_code}
                                            </Text>
                                        </Box>

                                        {/* File Info */}
                                        <VStack spacing={2} w="100%" align="stretch">
                                            <HStack justify="space-between">
                                                <Text fontSize="xs" color="gray.500">
                                                    Created
                                                </Text>
                                                <Text fontSize="xs" fontWeight="medium">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                </Text>
                                            </HStack>
                                            <HStack justify="space-between">
                                                <Text fontSize="xs" color="gray.500">
                                                    Sender
                                                </Text>
                                                <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                                                    {file.user?.personnel
                                                        ? `${file.user.personnel.givenname || ""} ${file.user.personnel.surname_husband || ""
                                                        }`
                                                        : "N/A"}
                                                </Text>
                                            </HStack>
                                        </VStack>

                                        {/* Actions */}
                                        <HStack w="100%" spacing={2}>
                                            <Tooltip label="Copy Link">
                                                <IconButton
                                                    icon={<CopyIcon />}
                                                    size="sm"
                                                    flex={1}
                                                    colorScheme="gray"
                                                    onClick={() => copyToClipboard(file.url)}
                                                />
                                            </Tooltip>
                                            <Tooltip label="Download QR">
                                                <IconButton
                                                    icon={<DownloadIcon />}
                                                    size="sm"
                                                    flex={1}
                                                    colorScheme="green"
                                                    onClick={() =>
                                                        downloadQRCode(file.url, file.generated_code)
                                                    }
                                                />
                                            </Tooltip>
                                            <Tooltip label="Open Link">
                                                <IconButton
                                                    as="a"
                                                    href={file.url}
                                                    target="_blank"
                                                    icon={<LinkIcon />}
                                                    size="sm"
                                                    flex={1}
                                                    colorScheme="blue"
                                                />
                                            </Tooltip>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                ) : (
                    /* Table View */
                    <Card>
                        <CardBody p={0} overflowX="auto">
                            <Table variant="simple">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>#</Th>
                                        <Th>Filename</Th>
                                        <Th>Code</Th>
                                        {hasPermission("link.qrcode") && <Th>QR Code</Th>}
                                        <Th display={{ base: "none", md: "table-cell" }}>Sender</Th>
                                        <Th display={{ base: "none", lg: "table-cell" }}>Date</Th>
                                        {hasPermission("link.action") && <Th textAlign="right">Actions</Th>}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {filteredFiles.map((file, index) => (
                                        <Tr
                                            key={`${file.id}-${index}`}
                                            _hover={{ bg: "gray.50" }}
                                            transition="all 0.2s"
                                        >
                                            <Td fontWeight="medium">{index + 1}</Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="semibold" noOfLines={1}>
                                                        {file.filename}
                                                    </Text>
                                                    <Badge
                                                        colorScheme={
                                                            file.user_id === currentUserId ? "orange" : "blue"
                                                        }
                                                        fontSize="xs"
                                                    >
                                                        {file.user_id === currentUserId ? "My File" : "Shared"}
                                                    </Badge>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <HStack>
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: "#1a73e8",
                                                            textDecoration: "none",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        {file.generated_code}
                                                    </a>
                                                    <Tooltip label="Copy Link">
                                                        <IconButton
                                                            icon={<CopyIcon />}
                                                            size="xs"
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(file.url)}
                                                        />
                                                    </Tooltip>
                                                </HStack>
                                            </Td>
                                            {hasPermission("link.qrcode") && (
                                                <Td>
                                                    <HStack spacing={2}>
                                                        <Box
                                                            cursor="pointer"
                                                            onClick={() => {
                                                                setSelectedQrUrl(file.url);
                                                                setSelectedGeneratedCode(file.generated_code);
                                                                onModalPreviewOpen();
                                                            }}
                                                            _hover={{ opacity: 0.7 }}
                                                            transition="opacity 0.2s"
                                                        >
                                                            <QRCodeCanvas
                                                                value={file.url}
                                                                size={48}
                                                                bgColor="transparent"
                                                                fgColor="#000000"
                                                                level="H"
                                                            />
                                                        </Box>
                                                        <Tooltip label="Download QR Code">
                                                            <IconButton
                                                                icon={<FaDownload />}
                                                                size="sm"
                                                                colorScheme="green"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    downloadQRCode(file.url, file.generated_code)
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </HStack>
                                                </Td>
                                            )}
                                            <Td display={{ base: "none", md: "table-cell" }}>
                                                <Text fontSize="sm" noOfLines={1}>
                                                    {file.user?.personnel
                                                        ? `${file.user.personnel.givenname || ""} ${file.user.personnel.surname_husband || ""
                                                        }`
                                                        : "N/A"}
                                                </Text>
                                            </Td>
                                            <Td display={{ base: "none", lg: "table-cell" }}>
                                                <Text fontSize="sm">
                                                    {new Date(file.created_at).toLocaleDateString()}
                                                </Text>
                                            </Td>
                                            {hasPermission("link.action") &&
                                                file.user_id === currentUserId ? (
                                                <Td textAlign="right">
                                                    <HStack spacing={2} justify="flex-end">
                                                        <Tooltip label="Edit">
                                                            <IconButton
                                                                icon={<EditIcon />}
                                                                size="sm"
                                                                colorScheme="yellow"
                                                                onClick={() => {
                                                                    setEditingFile(file);
                                                                    onModalOpen();
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip label="Share">
                                                            <IconButton
                                                                icon={<FaShareAlt />}
                                                                size="sm"
                                                                colorScheme="blue"
                                                                onClick={() => {
                                                                    setSelectedFile(file);
                                                                    fetchAlreadySharedUserIds(file);
                                                                    onShareModalOpen();
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip label="Delete">
                                                            <IconButton
                                                                icon={<DeleteIcon />}
                                                                size="sm"
                                                                colorScheme="red"
                                                                onClick={() => {
                                                                    setDeletingFile(file);
                                                                    onDeleteAlertOpen();
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </HStack>
                                                </Td>
                                            ) : (
                                                !isVIP && (
                                                    <Td textAlign="right">
                                                        <Badge colorScheme="blue" fontSize="xs">
                                                            Shared link
                                                        </Badge>
                                                    </Td>
                                                )
                                            )}
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </CardBody>
                    </Card>
                )}

                {/* Pagination */}
                {filteredFiles.length > 0 && (
                    <Flex
                        justify="space-between"
                        align="center"
                        bg="white"
                        p={4}
                        borderRadius="lg"
                        boxShadow="sm"
                    >
                        <Button
                            leftIcon={<ChevronLeftIcon />}
                            onClick={() => handlePageChange(currentPage - 1)}
                            isDisabled={currentPage === 1}
                            size={{ base: "sm", md: "md" }}
                            variant="outline"
                            colorScheme="orange"
                        >
                            Previous
                        </Button>

                        <HStack spacing={2}>
                            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                                Page {currentPage} of {totalPages}
                            </Text>
                        </HStack>

                        <Button
                            rightIcon={<ChevronRightIcon />}
                            onClick={() => handlePageChange(currentPage + 1)}
                            isDisabled={currentPage === totalPages}
                            size={{ base: "sm", md: "md" }}
                            variant="outline"
                            colorScheme="orange"
                        >
                            Next
                        </Button>
                    </Flex>
                )}
            </VStack>

            {/* Add/Edit File Modal */}
            <Modal isOpen={isModalOpen} onClose={onModalClose} size={{ base: "full", md: "lg" }}>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader>
                        {editingFile ? "Edit File" : "Add New File"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Filename</FormLabel>
                                <Input
                                    placeholder="Enter filename"
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
                                <FormLabel>URL</FormLabel>
                                <Input
                                    placeholder="https://example.com"
                                    value={editingFile ? editingFile.url : newFile.url || ""}
                                    onChange={(e) =>
                                        editingFile
                                            ? setEditingFile({ ...editingFile, url: e.target.value })
                                            : setNewFile({ ...newFile, url: e.target.value })
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Thumbnail Image (Optional)</FormLabel>
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

                            {(editingFile?.qrcode || newFile?.qrcode) && (
                                <Box
                                    p={4}
                                    bg="gray.50"
                                    borderRadius="md"
                                    w="100%"
                                    textAlign="center"
                                >
                                    <Text fontWeight="bold" mb={3}>
                                        QR Code Preview
                                    </Text>
                                    <QRCodeCanvas
                                        value={editingFile?.qrcode || newFile?.qrcode}
                                        size={128}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="H"
                                    />
                                    <Text mt={2} fontSize="sm" fontWeight="semibold">
                                        {editingFile?.generated_code || newFile?.generated_code}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onModalClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="orange"
                            onClick={editingFile ? handleUpdateFile : handleAddFile}
                        >
                            {editingFile ? "Update" : "Add File"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Share Modal */}
            <Modal isOpen={isShareModalOpen} onClose={onShareModalClose} size="lg">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader>Share File</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} align="stretch">
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>

                            <Box
                                maxH="400px"
                                overflowY="auto"
                                border="1px"
                                borderColor="gray.200"
                                borderRadius="md"
                                p={3}
                            >
                                <VStack spacing={2} align="stretch">
                                    {users &&
                                        users
                                            .filter(
                                                (user) =>
                                                    selectedUserIds.includes(user.user_id) ||
                                                    user.givenName
                                                        .toLowerCase()
                                                        .includes(searchTerm.toLowerCase()) ||
                                                    user.sn
                                                        .toLowerCase()
                                                        .includes(searchTerm.toLowerCase()) ||
                                                    String(user.user_id)
                                                        .toLowerCase()
                                                        .includes(searchTerm.toLowerCase())
                                            )
                                            .filter(
                                                (user, index, self) =>
                                                    index ===
                                                    self.findIndex((u) => u.user_id === user.user_id)
                                            )
                                            .sort((a, b) => a.givenName.localeCompare(b.givenName))
                                            .map((user) => (
                                                <Checkbox
                                                    key={user.user_id}
                                                    isChecked={
                                                        selectedUserIds.includes(user.user_id) ||
                                                        alreadySharedUserIds.includes(user.user_id)
                                                    }
                                                    onChange={() => handleCheckboxChange(user.user_id)}
                                                    p={2}
                                                    borderRadius="md"
                                                    _hover={{ bg: "gray.50" }}
                                                >
                                                    <HStack>
                                                        <Avatar size="sm" name={`${user.givenName} ${user.sn}`} />
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontWeight="medium">
                                                                {user.givenName} {user.sn}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                ID: {user.user_id}
                                                            </Text>
                                                        </VStack>
                                                        {alreadySharedUserIds.includes(user.user_id) && (
                                                            <Badge colorScheme="green" ml="auto">
                                                                Shared
                                                            </Badge>
                                                        )}
                                                    </HStack>
                                                </Checkbox>
                                            ))}
                                    {users.length === 0 && (
                                        <Text textAlign="center" color="gray.500" py={4}>
                                            No users found
                                        </Text>
                                    )}
                                </VStack>
                            </Box>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onShareModalClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleShareFile}
                            isDisabled={selectedUserIds.length === 0}
                            leftIcon={<FaShareAlt />}
                        >
                            Share ({selectedUserIds.length})
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* QR Code Preview Modal */}
            <Modal isOpen={isModalPreviewOpen} onClose={onModalPreviewClose} size="md" isCentered>
                <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
                <ModalContent>
                    <ModalHeader textAlign="center">QR Code</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4} pb={4}>
                            <Box
                                p={6}
                                bg="white"
                                borderRadius="lg"
                                boxShadow="xl"
                            >
                                <QRCodeCanvas
                                    value={selectedQrUrl}
                                    size={256}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="H"
                                />
                            </Box>
                            <Text fontSize="lg" fontWeight="bold" color="gray.700">
                                {selectedGeneratedCode}
                            </Text>
                            <Button
                                leftIcon={<DownloadIcon />}
                                colorScheme="green"
                                onClick={() => downloadQRCode(selectedQrUrl, selectedGeneratedCode)}
                                w="100%"
                            >
                                Download QR Code
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteAlertOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteAlertClose}
            >
                <AlertDialogOverlay backdropFilter="blur(4px)">
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete File
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete this file? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteFile} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Container>
    );
};

export default FileManagement;
