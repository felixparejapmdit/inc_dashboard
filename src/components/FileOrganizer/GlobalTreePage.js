import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  useColorModeValue,
  Spinner,
  Center,
  Icon,
  Collapse,
  HStack,
  Heading,
  Divider,
  Badge,
  Image,
  Button,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaChevronRight,
  FaChevronDown,
  FaFolder,
  FaFileAlt,
  FaBoxes,
} from "react-icons/fa";
import { DownloadIcon, ViewIcon } from "@chakra-ui/icons";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";
import ShelfCard from "../../pages/FileOrganizer/ShelfCard";
import ContainerCard from "../../pages/FileOrganizer/ContainerCard";
import FolderCard from "../../pages/FileOrganizer/FolderCard";
import DocumentCard from "../../pages/FileOrganizer/DocumentCard";



/** -------------------------------------------------------
 * Icon + color map (returns { icon, color } objects)
 * ------------------------------------------------------*/
const getTypeIcon = (type) => {
  switch (type) {
    case "shelf":
      return { icon: FaBoxes, color: "orange.500" };
    case "container":
      return { icon: FaBoxes, color: "purple.500" };
    case "folder":
      return { icon: FaFolder, color: "blue.500" };
    case "document":
      return { icon: FaFileAlt, color: "gray.500" };
    default:
      return { icon: FaFileAlt, color: "gray.400" };
  }
};

/** File type checks */
const isImage = (fileUrl) => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
const isPDF = (fileUrl) => /\.pdf$/i.test(fileUrl);

/** -------------------------------------------------------
 * Tree Node Component
 * ------------------------------------------------------*/
const TreeNode = ({ item, level = 0, onSelect, selectedItem, palette }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isSelected =
    selectedItem &&
    selectedItem.id === item.id &&
    selectedItem.type === item.type;

  const { icon, color } = getTypeIcon(item.type);
  const Chevron = isExpanded ? FaChevronDown : FaChevronRight;

  const bg = isSelected ? palette.selectedBg : "transparent";
  const hoverBg = isSelected ? palette.selectedHoverBg : palette.hoverBg;
  const textColor = isSelected ? palette.selectedText : palette.textColor;

  const handleToggle = (e) => {
    e.stopPropagation();
    if (hasChildren) setIsExpanded((v) => !v);
    onSelect(item);
  };

  return (
    <VStack align="start" spacing={0} w="100%">
      <Flex
        pl={`${level * 16}px`}
        pr={2}
        py={1.5}
        align="center"
        cursor="pointer"
        onClick={handleToggle}
        bg={bg}
        _hover={{ bg: hoverBg }}
        w="100%"
        borderRadius="md"
        transition="background-color 0.2s, transform 0.12s"
      >
        <HStack spacing={2} flex="1" minW={0}>
          {hasChildren ? (
            <Icon as={Chevron} boxSize={3} color={palette.chevron} />
          ) : (
            <Box w="12px" /> // spacer to align
          )}
          <Icon as={icon} boxSize={4} color={color} />
          <Text
            fontSize="sm"
            fontWeight={isSelected ? "semibold" : "medium"}
            color={textColor}
            noOfLines={1}
            title={item.name}
          >
            {item.name}
          </Text>
        </HStack>
        {item.count != null && (
          <Badge
            ml="auto"
            variant="subtle"
            colorScheme="gray"
            fontSize="0.7rem"
          >
            {item.count}
          </Badge>
        )}
      </Flex>

      <Collapse in={isExpanded} animateOpacity>
        <Box pl={`${level * 16}px`} w="100%">
          {hasChildren &&
            item.children.map((child) => (
              <TreeNode
                key={`${child.type}-${child.id}`}
                item={child}
                level={level + 1}
                onSelect={onSelect}
                selectedItem={selectedItem}
                palette={palette}
              />
            ))}
        </Box>
      </Collapse>
    </VStack>
  );
};

/** -------------------------------------------------------
 * Main Page Component
 * ------------------------------------------------------*/
const GlobalTreePage = () => {
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemContent, setSelectedItemContent] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Theme tokens
  const sidebarBg = useColorModeValue("white", "gray.800");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");
  const sidebarHeader = useColorModeValue("blue.600", "blue.300");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const selectedHoverBg = useColorModeValue("blue.100", "blue.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const selectedText = useColorModeValue("blue.800", "blue.100");
  const chevronColor = useColorModeValue("gray.500", "gray.400");

  const contentBg = useColorModeValue("gray.50", "gray.900");
  const contentCardBg = useColorModeValue("white", "gray.800");
  const contentBorder = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const contentTextColor = useColorModeValue("gray.800", "white");
  
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const palette = useMemo(
    () => ({
      hoverBg,
      selectedBg,
      selectedHoverBg,
      textColor,
      selectedText,
      chevron: chevronColor,
    }),
    [hoverBg, selectedBg, selectedHoverBg, textColor, selectedText, chevronColor]
  );
  
  const handleSelect = (item) => {
    setSelectedItem(item);
  };

  /** Load Data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shelves, containers, folders, documents] = await Promise.all([
          getAllData("Shelves"),
          getAllData("Containers"),
          getAllData("Folders"),
          getAllData("Documents"),
        ]);

        const data = shelves.map((shelf) => {
          const shelfContainers = containers
            .filter((c) => c.shelf_id === shelf.id)
            .map((container) => {
              const containerFolders = folders
                .filter((f) => f.container_id === container.id)
                .map((folder) => {
                  const folderDocs = documents
                    .filter((d) => d.folder_id === folder.id)
                    .map((d) => ({ ...d, type: "document" }));
                  return {
                    ...folder,
                    type: "folder",
                    count: folderDocs.length,
                    children: folderDocs,
                  };
                });
              return {
                ...container,
                type: "container",
                count: containerFolders.length,
                children: containerFolders,
              };
            });

          return {
            ...shelf,
            type: "shelf",
            count: shelfContainers.length,
            children: shelfContainers,
          };
        });

        setAllData({ shelves, containers, folders, documents });
        setTreeData(data);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /** Update right panel content */
  useEffect(() => {
    if (!selectedItem || !allData) {
      setSelectedItemContent([]);
      return;
    }

    if (selectedItem.type === "shelf") {
      const content = allData.containers.filter((c) => c.shelf_id === selectedItem.id);
      setSelectedItemContent(content.map((c) => ({ ...c, type: "container" })));
    } else if (selectedItem.type === "container") {
      const content = allData.folders.filter((f) => f.container_id === selectedItem.id);
      setSelectedItemContent(content.map((f) => ({ ...f, type: "folder" })));
    } else if (selectedItem.type === "folder") {
      const content = allData.documents.filter((d) => d.folder_id === selectedItem.id);
      setSelectedItemContent(content.map((d) => ({ ...d, type: "document" })));
    } else {
      setSelectedItemContent([]);
    }
  }, [selectedItem, allData]);

  const openFileModal = (file) => {
    setSelectedFile(file);
    onOpen();
  };

  if (loading) {
    return (
      <Center w="100%" h="100%" minH="100vh" pt="4rem">
        <Spinner size="xl" />
      </Center>
    );
  }

    // ✅ This function fixes the "handleClick not defined" issue
const handleClick = (type, item) => {
    // 💡 Update the main selected item state
    setSelectedItem(item); 
    
    // The following lines might be for breadcrumbs or other secondary features,
    // but they can remain if they are needed elsewhere:
    if (type === "shelf") {
      setSelectedShelf(item);
      setSelectedContainer(null);
      setSelectedFolder(null);
    }
    if (type === "container") {
      setSelectedContainer(item);
      setSelectedFolder(null);
    }
    if (type === "folder") {
      setSelectedFolder(item);
    }
};

  /** Render right-side details */
  

// GlobalTreePage.js

// ... (Rest of the component code above renderItemDetails remains the same)

/** Render right-side details */
 const renderItemDetails = () => {
 if (!selectedItem) {
return (
 <Center w="100%" h="100%" p={8}>
 <VStack spacing={2}>
<Icon as={FaBoxes} boxSize={6} color={mutedText} />
 <Text color={mutedText}>Select an item to view details.</Text>
</VStack>
 </Center>
 );
 }

 const { icon: headerIcon, color: headerColorIcon } = getTypeIcon(selectedItem.type);

 return (
 <Box p={0} w="100%">
 {/* Header */}
 <Box
bg={contentCardBg}
borderWidth="1px"
borderColor={contentBorder}
 borderRadius="lg"
boxShadow="sm"
 p={4}
 >
 <HStack spacing={3} mb={1}>
 <Icon as={headerIcon} boxSize={6} color={headerColorIcon} />
<Heading size="md" color={contentTextColor} noOfLines={2} title={selectedItem.name}>
{selectedItem.name}
</Heading>
 </HStack>
 <Text fontSize="sm" color={mutedText}>
 Type: {selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
</Text>
 </Box>

 <Divider my={4} />
 
{/* Children / Content List or Document Preview */}
{selectedItem.type === "document" ? (
<VStack align="stretch" spacing={4} mt={4}>
 <DocumentCard 
 document={selectedItem}
 onView={() => openFileModal(selectedItem)}
 />
 </VStack>
 ) : selectedItemContent.length > 0 ? (
<SimpleGrid columns={[1, 2, 3]} spacing={6} minChildWidth="240px">
 {selectedItemContent.map((item) => {
 const commonProps = {
onView: () => openFileModal(item),
onUpdate: () => {},
onDelete: () => {},
onGenerateQR: () => {},
 // 🚨 PREVIOUS CODE (Incorrect for your goal): onClick: () => handleClick(item.type, item), 

// ✅ CORRECTED CODE: Accept the item passed from the Card (cardItem) 
 // and use its type and value to update the state using handleClick.
     onClick: (cardItem) => handleClick(cardItem.type, cardItem),
 };

 switch (item.type) {
 case "shelf":
 return (
 <ShelfCard
 key={item.id}
shelf={item}
 containers={allData.containers.filter(
 (c) => c.shelf_id === item.id
 )}
 {...commonProps}
 />
 );
 case "container":
 return (
 <ContainerCard
 key={item.id}
 container={item}
folders={allData.folders.filter(
 (f) => f.container_id === item.id
)}
{...commonProps}
/>
);
 case "folder":
return (
 <FolderCard
 key={item.id}
 folder={item}
 documents={allData.documents.filter(
 (d) => d.folder_id === item.id
 )}
 {...commonProps}
 />
);
 case "document":
 return <DocumentCard key={item.id} document={item} {...commonProps} />;
 default:
 return null;
 }
 })}
</SimpleGrid>

 ) : (
 <Center w="100%" p={8}>
 <Text fontSize="sm" color={mutedText} fontStyle="italic">
 No items found.
 </Text>
 </Center>
)}
 </Box>
);
 };

  return (
    <>
      <Flex h="100vh" w="100%" pt="4rem">
        {/* Left: Tree View */}
        <Box w="320px" borderRight="1px solid" borderColor={sidebarBorder} bg={sidebarBg} display="flex" flexDirection="column">
          {/* Sticky Header */}
          <Box
            position="sticky"
            top="0"
            zIndex={1}
            bg={sidebarBg}
            borderBottom="1px solid"
            borderColor={sidebarBorder}
            px={4}
            py={3}
          >
            <Heading size="md" color={sidebarHeader}>
              File Explorer
            </Heading>
            <Text fontSize="xs" color={mutedText}>
              Shelves • Containers • Folders • Documents
            </Text>
          </Box>

          {/* Tree Body */}
          <Box p={3} overflowY="auto">
            {treeData.map((shelf) => (
              <TreeNode
                key={`shelf-${shelf.id}`}
                item={shelf}
                onSelect={handleSelect}
                selectedItem={selectedItem}
                palette={palette}
              />
            ))}
          </Box>
        </Box>

        {/* Right: Content Display */}
        <Box flex="1" p={6} bg={contentBg} overflowY="auto">
          {renderItemDetails()}
        </Box>
      </Flex>
      
      {/* Fullscreen Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={4}>
            {selectedFile && (
              <Center>
                {isImage(selectedFile.file_url) ? (
                  <Image src={selectedFile.file_url} alt={selectedFile.name} maxH="80vh" />
                ) : (
                  <iframe
                    src={selectedFile.file_url}
                    title="PDF Viewer"
                    style={{ width: "100%", height: "80vh", border: "none" }}
                  />
                )}
              </Center>
            )}
            {selectedFile && (
              <HStack justify="center" mt={4} spacing={4}>
                <Button as="a" href={selectedFile.file_url} download colorScheme="blue">
                  Download
                </Button>
                <Button as="a" href={selectedFile.file_url} target="_blank" rel="noopener noreferrer" colorScheme="gray">
                  Open in New Tab
                </Button>
              </HStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GlobalTreePage;
