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
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

import { getAllData } from "../../utils/FileOrganizer/globalSearchService";
import ShelfCard from "./ShelfCard";
import ContainerCard from "./ContainerCard";
import FolderCard from "./FolderCard";
import DocumentCard from "./DocumentCard";

const GlobalSearchPage = ({ onResultClick }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const toast = useToast();

  const MAX_HISTORY = 5;

  const typeIcons = {
    shelf: "📚",
    container: "🗃️",
    folder: "📁",
    document: "📄",
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("globalSearchHistory") || "[]");
    setHistory(stored);
  }, []);

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

  const highlightMatch = (text) => {
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ backgroundColor: "#fdd835" }}>{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const handleSearch = async (e) => {
    const input = e.target.value;
    setQuery(input);

  
    if (input.trim() === "") {
      setResults([]);
      setShowSuggestions(true);
      return;
    }

    setLoading(true);
    setShowSuggestions(false);

    try {
      const [shelves, containers, folders, documents] = await Promise.all([
        getAllData("Shelves"),
        getAllData("Containers"),
        getAllData("Folders"),
        getAllData("Documents"),
      ]);

      // Build a container map to resolve shelf_id for folders
      const containerMap = containers.reduce((acc, container) => {
        acc[container.id] = container;
        return acc;
      }, {});

      const combined = [
        ...shelves.map((item) => ({ ...item, type: "shelf" })),
        ...containers.map((item) => ({ ...item, type: "container" })),
        ...folders.map((item) => {
          const container = containerMap[item.container_id];
          return {
            ...item,
            type: "folder",
            shelf_id: container?.shelf_id || null,
            container_id: item.container_id,
          };
        }),
        ...documents.map((item) => ({ ...item, type: "document" })),
      ];

      const filtered = combined.filter((item) =>
        item.name?.toLowerCase().includes(input.toLowerCase())
      );

      setResults(filtered);
    } catch (err) {
      console.error("Search failed", err);
      toast({
        title: "Error",
        description: "Search failed to load data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (item) => {
    saveToHistory(item.name || "");
    onResultClick();
  };

  const renderCard = (item) => {
    const highlightedName = highlightMatch(item.name || "");
    const icon = typeIcons[item.type];
    const label = `${icon} ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;

    const commonProps = {
      key: `${item.type}-${item.id}`,
      onClick: () => handleResultClick(item),
    };

    switch (item.type) {
      case "shelf":
        return (
          <Box {...commonProps}>
            <Text fontSize="sm" color="gray.500" mb={1}>{label}</Text>
            <ShelfCard shelf={{ ...item, name: highlightedName, icon }} />
          </Box>
        );
      case "container":
        return (
          <Box {...commonProps}>
            <Text fontSize="sm" color="gray.500" mb={1}>{label}</Text>
            <ContainerCard container={{ ...item, name: highlightedName, icon }} />
          </Box>
        );
      case "folder":
        console.log("🟡 FolderCard render:", {
          folder: item,
          shelfId: item.shelf_id,
          containerId: item.container_id,
        });
        return (
          <Box {...commonProps}>
            <Text fontSize="sm" color="gray.500" mb={1}>{label}</Text>
            <FolderCard
              folder={{ ...item, name: highlightedName, icon }}
              shelfId={item.shelf_id}
              containerId={item.container_id}
              onDelete={() => {}}
              onUpdate={() => {}}
            />
          </Box>
        );
      case "document":
        return (
          <Box {...commonProps}>
            <Text fontSize="sm" color="gray.500" mb={1}>{label}</Text>
            <DocumentCard document={{ ...item, name: highlightedName, icon }} />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box maxW="6xl" mx="auto" mt={6} px={4}>
      <Box position="relative">
        <Input
          size="lg"
          placeholder="Search shelves, containers, folders, or documents..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          mb={4}
        />

        {showSuggestions && history.length > 0 && (
          <Box
            position="absolute"
            top="3.2rem"
            width="100%"
            bg="white"
            shadow="md"
            borderRadius="md"
            zIndex={99}
            p={2}
          >
            <Flex justify="space-between" align="center" px={2} mb={1}>
              <Text fontWeight="semibold" fontSize="sm">Recent Searches</Text>
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
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() => {
                    setQuery(item);
                    setShowSuggestions(false);
                    setTimeout(() => {
                      const event = { target: { value: item } };
                      handleSearch(event);
                    }, 0);
                  }}
                >
                  {item}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>

      {loading ? (
        <Spinner size="xl" color="teal.500" />
      ) : (
        <VStack align="stretch" spacing={4}>
          {results.length > 0 ? (
            results.map((item) => renderCard(item))
          ) : query ? (
            <Text fontSize="lg" color="gray.500">No matching results found.</Text>
          ) : null}
        </VStack>
      )}
    </Box>
  );
};

export default GlobalSearchPage;
