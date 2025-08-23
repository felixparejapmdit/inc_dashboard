// src/pages/FileOrganizer/GlobalSearchPage.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Input,
  Spinner,
  Text,
  VStack,
  useToast,
  List,
  ListItem,
  Flex,
  IconButton,
  SimpleGrid,
  useColorModeValue,
  Center,
  Button,
  Select,
  HStack,
  Heading,
  Divider
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import { getAllData } from "../../utils/FileOrganizer/globalSearchService";
import { getShelves, updateShelf } from "../../utils/FileOrganizer/shelvesService";
import { getContainers, updateContainer } from "../../utils/FileOrganizer/containersService";
import { getFolders, updateFolder } from "../../utils/FileOrganizer/foldersService";
import { getDocuments, updateDocument } from "../../utils/FileOrganizer/documentsService";

import ShelfCard from "./ShelfCard";
import ContainerCard from "./ContainerCard";
import FolderCard from "./FolderCard";
import DocumentCard from "./DocumentCard";

const GlobalSearchPage = ({ onResultClick }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allData, setAllData] = useState({ shelves: [], containers: [], folders: [], documents: [] });
  const [selectedItemForMove, setSelectedItemForMove] = useState(null);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const MAX_HISTORY = 5;
  const cardMinWidth = "240px";

  const searchBg = useColorModeValue("white", "gray.700");
  const searchBorderColor = useColorModeValue("gray.200", "gray.600");
  const resultBg = useColorModeValue("white", "gray.700");
  const resultHoverBg = useColorModeValue("gray.100", "gray.600");
  const resultColor = useColorModeValue("gray.800", "white");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");
  const headerColor = useColorModeValue("teal.600", "teal.300");

  const typeIcons = {
    shelf: "📚",
    container: "📦",
    folder: "📁",
    document: "📄",
  };

  // Moved fetchData outside of useEffect so it's accessible everywhere
  const fetchData = async () => {
    try {
      const [shelves, containers, folders, documents] = await Promise.all([
        getShelves(),
        getContainers(),
        getFolders(),
        getDocuments(),
      ]);
      setAllData({ shelves, containers, folders, documents });
      setLoading(false);
    } catch (err) {
      toast({
        title: "Error fetching data",
        description: "Could not load all data for search.",
        status: "error",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("globalSearchHistory") || "[]");
    setHistory(stored);
    
    // Initial data fetch on component mount
    fetchData();
  }, [toast]);

  const saveToHistory = (term) => {
    if (!term.trim()) return;
    let updated = [term, ...history.filter((h) => h !== term)];
    updated = updated.slice(0, MAX_HISTORY);
    setHistory(updated);
    localStorage.setItem("globalSearchHistory", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("globalSearchHistory");
  };

  const highlightMatch = (text, match) => {
    if (!text) return null;
    const regex = new RegExp(`(${match})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === match.toLowerCase() ? (
        <Text as="span" bg="yellow.200" key={i}>{part}</Text>
      ) : (
        <Text as="span" key={i}>{part}</Text>
      )
    );
  };

  const handleSearch = (e) => {
    const input = e.target.value;
    setQuery(input);

    if (input.trim() === "") {
      setResults([]);
      setShowSuggestions(true);
      return;
    }

    setShowSuggestions(false);
    
    const combinedData = [
      ...allData.shelves.map((item) => ({ ...item, type: "shelf" })),
      ...allData.containers.map((item) => ({ ...item, type: "container" })),
      ...allData.folders.map((item) => ({ ...item, type: "folder" })),
      ...allData.documents.map((item) => ({ ...item, type: "document" })),
    ];
    
    const filtered = combinedData.filter((item) =>
      item.name?.toLowerCase().includes(input.toLowerCase())
    );

    setResults(filtered);
  };

  const handleResultClick = (item) => {
    saveToHistory(item.name || "");
    setQuery(item.name || "");
    setResults([item]);
    onResultClick();

    // CORRECTED NAVIGATION LOGIC
    switch (item.type) {
      case "shelf":
        navigate(`/file-organizer/shelves/${item.id}/containers`);
        break;
      case "container":
        navigate(`/containers/${item.id}/folders`);
        break;
      case "folder":
        const folderContainer = allData.containers.find(c => c.id === item.container_id);
        const folderShelfId = folderContainer?.shelf_id;
        if (folderContainer && folderShelfId) {
          navigate(`/shelves/${folderShelfId}/containers/${item.container_id}/folders/${item.id}/documents`);
        } else {
          toast({
            title: "Error",
            description: "Could not determine folder's location.",
            status: "error",
          });
        }
        break;
      case "document":
        // Find the parent folder, container, and shelf IDs
        const docFolder = allData.folders.find(f => f.id === item.folder_id);
        const docContainerId = docFolder ? docFolder.container_id : item.container_id;
        const docContainer = allData.containers.find(c => c.id === docContainerId);
        const docShelfId = docContainer?.shelf_id;
        if (docContainer && docShelfId && docFolder) {
          navigate(`/shelves/${docShelfId}/containers/${docContainerId}/folders/${docFolder.id}/documents`);
        } else if (docContainer && docShelfId && !docFolder) {
           navigate(`/shelves/${docShelfId}/containers/${docContainerId}/folders`);
        } else {
          toast({
            title: "Error",
            description: "Could not determine document's location.",
            status: "error",
          });
        }
        break;
      default:
        break;
    }
  };

  const handleMove = async () => {
    if (!selectedItemForMove) return;

    const { type, id } = selectedItemForMove;
    let success = false;
    setLoading(true);

    try {
      if (type === "container" && selectedShelf) {
        await updateContainer(id, { shelf_id: parseInt(selectedShelf) });
        success = true;
      } else if (type === "folder" && selectedContainer) {
        await updateFolder(id, { container_id: parseInt(selectedContainer) });
        success = true;
      } else if (type === "document" && (selectedFolder || selectedContainer)) {
        const updateData = {};
        if (selectedFolder) {
          updateData.folder_id = parseInt(selectedFolder);
          updateData.container_id = null;
        } else if (selectedContainer) {
          updateData.container_id = parseInt(selectedContainer);
          updateData.folder_id = null;
        }
        await updateDocument(id, updateData);
        success = true;
      }
    } catch (err) {
      console.error("Move operation failed:", err);
      success = false;
    }

    if (success) {
      toast({
        title: "Move successful!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Clear move state and refresh data
      setSelectedItemForMove(null);
      setSelectedShelf(null);
      setSelectedContainer(null);
      setSelectedFolder(null);
      setQuery("");
      setResults([]);
      
      // Live update: Re-fetch the data immediately
      await fetchData();
    } else {
      toast({
        title: "Move failed.",
        description: "Please check your selection.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderCard = (item) => {
    const itemProps = {
      ...item,
      onDelete: () => {},
      onUpdate: () => {},
    };

    switch (item.type) {
      case "shelf":
        return (
          <ShelfCard 
            shelf={itemProps}
            containers={allData.containers.filter(c => c.shelf_id === item.id)}
          />
        );
      case "container":
        return (
          <ContainerCard 
            container={itemProps}
            folders={allData.folders.filter(f => f.container_id === item.id)}
          />
        );
      case "folder":
        return (
          <FolderCard 
            folder={itemProps}
            shelfId={allData.containers.find(c => c.id === item.container_id)?.shelf_id}
            containerId={item.container_id}
            documents={allData.documents.filter(d => d.folder_id === item.id)}
          />
        );
      case "document":
        return (
          <DocumentCard 
            document={itemProps} 
            folderId={item.folder_id}
            containerId={item.container_id}
          />
        );
      default:
        return null;
    }
  };

  const renderCurrentLocation = () => {
    if (!selectedItemForMove) return null;

    let shelfName = "N/A";
    let containerName = "N/A";
    let folderName = "N/A";

    const item = selectedItemForMove;
    const itemType = item.type;

    if (itemType === 'shelf') {
      shelfName = item.name;
    } else if (itemType === 'container') {
      containerName = item.name;
      const shelf = allData.shelves.find(s => s.id === item.shelf_id);
      if (shelf) shelfName = shelf.name;
    } else if (itemType === 'folder') {
      folderName = item.name;
      const container = allData.containers.find(c => c.id === item.container_id);
      if (container) {
        containerName = container.name;
        const shelf = allData.shelves.find(s => s.id === container.shelf_id);
        if (shelf) shelfName = shelf.name;
      }
    } else if (itemType === 'document') {
      const folder = allData.folders.find(f => f.id === item.folder_id);
      if (folder) {
        folderName = folder.name;
        const container = allData.containers.find(c => c.id === folder.container_id);
        if (container) {
          containerName = container.name;
          const shelf = allData.shelves.find(s => s.id === container.shelf_id);
          if (shelf) shelfName = shelf.name;
        }
      } else {
        const container = allData.containers.find(c => c.id === item.container_id);
        if (container) {
          containerName = container.name;
          const shelf = allData.shelves.find(s => s.id === container.shelf_id);
          if (shelf) shelfName = shelf.name;
        }
      }
    }

    return (
      <VStack align="start" spacing={2} mb={4} p={4} bg={resultHoverBg} borderRadius="md">
        <Text fontWeight="semibold" color={resultColor}>Current Location:</Text>
        <Flex w="100%" justify="space-between">
          <Text fontSize="sm" color={subtitleColor}>Shelf:</Text>
          <Text fontSize="sm" color={resultColor} fontWeight="medium">{shelfName}</Text>
        </Flex>
        <Flex w="100%" justify="space-between">
          <Text fontSize="sm" color={subtitleColor}>Container:</Text>
          <Text fontSize="sm" color={resultColor} fontWeight="medium">{containerName}</Text>
        </Flex>
        <Flex w="100%" justify="space-between">
          <Text fontSize="sm" color={subtitleColor}>Folder:</Text>
          <Text fontSize="sm" color={resultColor} fontWeight="medium">{folderName}</Text>
        </Flex>
      </VStack>
    );
  };

  return (
    <Box maxW="6xl" mx="auto" mt={6} px={[2, 4]}>
      <VStack spacing={6} align="stretch">
        <HStack spacing={4}>
          <Input
            size="lg"
            placeholder="Search shelves, containers, folders, or documents..."
            value={query}
            onChange={handleSearch}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            bg={searchBg}
            borderColor={searchBorderColor}
            _hover={{ borderColor: "gray.400" }}
            _focus={{ borderColor: headerColor, boxShadow: "0 0 0 1px teal.500" }}
          />
        </HStack>
        
        {showSuggestions && history.length > 0 && (
          <Box
            position="absolute"
            top="4.5rem"
            width="100%"
            bg={resultBg}
            shadow="lg"
            borderRadius="md"
            zIndex={99}
            p={2}
          >
            <Flex justify="space-between" align="center" px={2} mb={1}>
              <Text fontWeight="semibold" fontSize="sm" color={headerColor}>Recent Searches</Text>
              <IconButton
                icon={<DeleteIcon />}
                size="xs"
                onClick={clearHistory}
                variant="ghost"
                colorScheme="red"
                aria-label="Clear history"
              />
            </Flex>
            <List>
              {history.map((item, i) => (
                <ListItem
                  key={i}
                  px={3}
                  py={2}
                  _hover={{ bg: resultHoverBg, cursor: "pointer" }}
                  onClick={() => {
                    setQuery(item);
                    handleSearch({ target: { value: item } });
                    setShowSuggestions(false);
                  }}
                  color={resultColor}
                >
                  {item}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </VStack>

      <Box mt={6}>
        {loading ? (
          <Center py={10}>
            <Spinner size="xl" color={headerColor} />
          </Center>
        ) : (
          <SimpleGrid columns={[1, 2, 3]} spacing={6} minChildWidth={cardMinWidth}>
            {results.length > 0 ? (
              results.map((item) => (
                <Box key={item.id}>
                  <Flex align="center" gap={2} mb={2}>
                    <Heading size="sm" color={headerColor}>{typeIcons[item.type]}</Heading>
                    <Text fontSize="md" color={subtitleColor} fontWeight="semibold">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
                  </Flex>
                  <Box 
                    minH="220px" // Enforce a consistent height
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSelectedItemForMove(item);
                    }}
                    onClick={() => handleResultClick(item)}
                  >
                    {renderCard(item)}
                  </Box>
                </Box>
              ))
            ) : query.length > 0 ? (
              <Text fontSize="lg" color="gray.500" textAlign="center" py={10}>No matching results found.</Text>
            ) : null}
          </SimpleGrid>
        )}
      </Box>

      {/* Move Location UI */}
      {selectedItemForMove && (
        <Box 
          mt={8} 
          p={6} 
          borderWidth="1px" 
          borderColor={searchBorderColor} 
          borderRadius="lg" 
          bg={resultBg}
          position="fixed"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          zIndex={100}
          w="90%"
          maxW="md"
          boxShadow="xl"
        >
          <Heading size="md" mb={4} color={headerColor}>Move Item</Heading>
          
          {/* Current Location Details */}
          {renderCurrentLocation()}
          
          <Divider my={4} />

          <VStack spacing={4} align="stretch">
            <Text fontWeight="semibold" color={resultColor}>Choose New Location:</Text>
            
            {/* Conditional Dropdowns based on item type */}
            {(selectedItemForMove.type === "container" || selectedItemForMove.type === "folder" || selectedItemForMove.type === "document") && (
              <Select
                placeholder="Select New Shelf"
                value={selectedShelf || ""}
                onChange={(e) => {
                  setSelectedShelf(e.target.value);
                  setSelectedContainer(null);
                  setSelectedFolder(null);
                }}
              >
                {allData.shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </option>
                ))}
              </Select>
            )}
            
            {(selectedItemForMove.type === "folder" || selectedItemForMove.type === "document") && selectedShelf && (
              <Select
                placeholder="Select New Container"
                value={selectedContainer || ""}
                onChange={(e) => {
                  setSelectedContainer(e.target.value);
                  setSelectedFolder(null);
                }}
              >
                {allData.containers.filter(c => c.shelf_id === parseInt(selectedShelf)).map((container) => (
                  <option key={container.id} value={container.id}>
                    {container.name}
                  </option>
                ))}
              </Select>
            )}
            
            {selectedItemForMove.type === "document" && selectedContainer && (
              <Select
                placeholder="Select New Folder (optional)"
                value={selectedFolder || ""}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">(None)</option>
                {allData.folders.filter(f => f.container_id === parseInt(selectedContainer)).map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </Select>
            )}

            <Button colorScheme="teal" onClick={handleMove} mt={4} w="100%">
              Confirm Move
            </Button>
            <Button variant="outline" onClick={() => setSelectedItemForMove(null)} w="100%">
              Cancel
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default GlobalSearchPage;
