import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import {
    Box,
    Text,
    VStack,
    Flex,
    Divider,
    Icon,
    useColorModeValue,
} from "@chakra-ui/react";
import { FaFolder, FaBoxOpen } from "react-icons/fa";
import GlobalMenuButton from "../../components/FileOrganizer/GlobalMenuButton";
import DeleteConfirmModal from "../../components/FileOrganizer/DeleteConfirmModal";
import QRCodeModal from "../../components/FileOrganizer/QRCodeModal";

const ContainerCard = ({ container, folders = [], onUpdate, onDelete, onClick }) => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [isQROpen, setIsQROpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Theme colors for storage box style
    const cardBg = useColorModeValue("orange.50", "gray.700");
    const cardBorder = useColorModeValue("orange.200", "gray.600");
    const topBg = useColorModeValue("orange.100", "gray.600");
    const folderSectionBg = useColorModeValue("orange.50", "gray.800");
    const nameColor = useColorModeValue("orange.700", "orange.300");
    const folderBg = useColorModeValue("white", "gray.700");
    const folderHoverBg = useColorModeValue("orange.100", "gray.600");
    const folderTextColor = useColorModeValue("gray.700", "gray.300");
    const emptyFolderColor = useColorModeValue("gray.400", "gray.500");

    const handleCardClick = (e) => {
        if (!e.target.closest("button")) {
            // Check if we are inside the tree view
            if (location.pathname.includes("/file-organizer/tree")) {
                // If in tree view, call the onClick prop (to update right panel content)
                if (onClick) {
                    onClick(container); 
                }
            } else {
                // Standard navigation outside the tree view
                navigate(`/containers/${container.id}/folders`);
            }
        }
    };

    return (
        <>
            <Box
                borderWidth="2px"
                borderColor={cardBorder}
                borderRadius="xl"
                bg={cardBg}
                boxShadow="md"
                transition="all 0.2s"
                _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
                cursor="pointer"
                onClick={handleCardClick} 
                display="flex"
                flexDirection="column"
                h="100%"
                position="relative"
                minW="260px"
                maxW="280px"
            >
                {/* Top "lid" of the storage box */}
                <Flex
                    bg={topBg}
                    p={4}
                    borderTopRadius="xl"
                    align="center"
                    justify="center"
                    flexShrink={0}
                    position="relative"
                >
                    {/* Global Menu Button */}
                    <Box position="absolute" top={2} right={2} zIndex={1}>
                        <GlobalMenuButton
                            // Pass the container item for the GlobalMenuButton's logic
                            item={container} 
                            // onEdit calls the onUpdate function from GlobalTreePage (to open modal)
                            onEdit={() => onUpdate(container)} 
                            onDelete={() => setIsDeleteOpen(true)}
                            onGenerateQr={() => setIsQROpen(true)}
                            itemType="container"
                        />
                    </Box>

                    {/* Title + Box icon */}
                    <Flex align="center" gap={2} px={6} w="full" justify="center">
                        <Icon as={FaBoxOpen} boxSize={6} color={nameColor} flexShrink={0} />
                        <Text
                            fontWeight="bold"
                            fontSize="md"
                            color={nameColor}
                            noOfLines={1}
                            flex="1"
                            textAlign="center"
                            title={container.name}
                        >
                            {container.name}
                        </Text>
                    </Flex>
                </Flex>

                <Divider borderColor={cardBorder} />

                {/* Inside the storage box */}
                <VStack
                    bg={folderSectionBg}
                    p={4}
                    spacing={2}
                    flex="1"
                    align="stretch"
                    borderBottomRadius="xl"
                    overflow="hidden"
                >
                    {folders && folders.length > 0 ? (
                        <>
                            {folders.slice(0, 3).map((folder) => (
                                <Flex
                                    key={folder.id}
                                    align="center"
                                    gap={2}
                                    p={2}
                                    bg={folderBg}
                                    borderRadius="md"
                                    _hover={{ bg: folderHoverBg }}
                                    transition="all 0.2s"
                                >
                                    <Icon as={FaFolder} boxSize={5} color={nameColor} />
                                    <Text
                                        fontSize="sm"
                                        color={folderTextColor}
                                        noOfLines={1}
                                        flex="1"
                                        title={folder.name}
                                    >
                                        {folder.name}
                                    </Text>
                                </Flex>
                            ))}
                            {folders.length > 3 && (
                                <Text
                                    fontSize="xs"
                                    color={emptyFolderColor}
                                    fontWeight="medium"
                                    textAlign="right"
                                >
                                    +{folders.length - 3} more
                                </Text>
                            )}
                        </>
                    ) : (
                        <Flex
                            align="center"
                            justify="center"
                            h="100%"
                            minH="80px"
                            direction="column"
                            gap={2}
                        >
                            <Icon as={FaFolder} boxSize={8} color={emptyFolderColor} opacity={0.5} />
                            <Text
                                fontSize="sm"
                                color={emptyFolderColor}
                                fontStyle="italic"
                                textAlign="center"
                            >
                                No folders yet
                            </Text>
                        </Flex>
                    )}
                </VStack>
            </Box>

            {/* QR Code Modal */}
            <QRCodeModal
                isOpen={isQROpen}
                onClose={() => setIsQROpen(false)}
                value={container.id.toString()}
                code={container.generated_code}
                title={container.name}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => {
                    onDelete && onDelete(container.id);
                    setIsDeleteOpen(false);
                }}
                title="Delete Container"
                description={`Are you sure you want to delete "${container.name}"? This action cannot be undone.`}
            />
        </>
    );
};

export default ContainerCard;