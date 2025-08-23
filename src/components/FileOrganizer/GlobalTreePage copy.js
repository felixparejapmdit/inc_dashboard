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
} from "@chakra-ui/react";
import {
  FaChevronRight,
  FaChevronDown,
  FaFolder,
  FaFileAlt,
  FaBoxes,
} from "react-icons/fa";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";

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

/** -------------------------------------------------------
 * Tree Node
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
 * Page
 * ------------------------------------------------------*/
const GlobalTreePage = () => {
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemContent, setSelectedItemContent] = useState([]);

  // Theme tokens (hooks MUST be at top-level, not inside callbacks)
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
  const contentIconColor = useColorModeValue("blue.500", "blue.300");
  const contentTextColor = useColorModeValue("gray.800", "white");
  
  // Palette object passed to TreeNode (no hooks inside it)
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

  /** Load data and build a hierarchical tree with explicit `type` on every node */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shelves, containers, folders, documents] = await Promise.all([
          getAllData("Shelves"),
          getAllData("Containers"),
          getAllData("Folders"),
          getAllData("Documents"),
        ]);

        // Build tree with `type` and child counts
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

  /** Right-pane content based on selected item */
  useEffect(() => {
    if (!selectedItem || !allData) {
      setSelectedItemContent([]);
      return;
    }

    if (selectedItem.type === "shelf") {
      const content = allData.containers
        .filter((c) => c.shelf_id === selectedItem.id)
        .map((c) => ({ ...c, type: "container" }));
      setSelectedItemContent(content);
    } else if (selectedItem.type === "container") {
      const content = allData.folders
        .filter((f) => f.container_id === selectedItem.id)
        .map((f) => ({ ...f, type: "folder" }));
      setSelectedItemContent(content);
    } else if (selectedItem.type === "folder") {
      const content = allData.documents
        .filter((d) => d.folder_id === selectedItem.id)
        .map((d) => ({ ...d, type: "document" }));
      setSelectedItemContent(content);
    } else {
      setSelectedItemContent([]);
    }
  }, [selectedItem, allData]);

  if (loading) {
    return (
      <Center w="100%" h="100%" minH="100vh" pt="4rem">
        <Spinner size="xl" />
      </Center>
    );
  }
  
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
        {/* Header Card */}
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
            <Center p={8} h="100%" minH="300px">
              <Text>Document Preview (Placeholder for file: {selectedItem.name})</Text>
            </Center>
        ) : selectedItemContent.length > 0 ? (
          <VStack align="stretch" spacing={3}>
            {selectedItemContent.map((item) => {
              const meta = getTypeIcon(item.type);
              return (
                <HStack
                  key={`${item.type}-${item.id}`}
                  p={3}
                  bg={contentCardBg}
                  borderWidth="1px"
                  borderColor={contentBorder}
                  borderRadius="md"
                  boxShadow="sm"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  transition="all 0.18s"
                >
                  <Icon as={meta.icon} color={meta.color} boxSize={5} />
                  <Text flex="1" fontSize="sm" color={contentTextColor} noOfLines={1} title={item.name}>
                    {item.name}
                  </Text>
                  <Badge variant="outline" colorScheme="gray">
                    {item.type}
                  </Badge>
                </HStack>
              );
            })}
          </VStack>
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
    <Flex h="100vh" w="100%" pt="4rem">
      {/* Left: Tree View */}
      <Box
        w="320px"
        borderRight="1px solid"
        borderColor={sidebarBorder}
        bg={sidebarBg}
        display="flex"
        flexDirection="column"
      >
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
              onSelect={setSelectedItem}
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
  );
};

export default GlobalTreePage;
