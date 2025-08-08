import React, { useEffect, useState } from "react";
import {
  Box,
  Input,
  Heading,
  Text,
  VStack,
  Spinner,
  Divider,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const GlobalSearchPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    shelves: [],
    containers: [],
    folders: [],
    documents: [],
  });

  const [allData, setAllData] = useState({
    shelves: [],
    containers: [],
    folders: [],
    documents: [],
  });

  const cardBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual data fetch functions or API calls
        const shelves = await getAllData("shelves");
        const containers = await getAllData("containers");
        const folders = await getAllData("folders");
        const documents = await getAllData("documents");

        setAllData({ shelves, containers, folders, documents });
        setResults({ shelves, containers, folders, documents });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const lowerQuery = query.toLowerCase();

    const filter = (items) =>
      items.filter((item) => item.name?.toLowerCase().includes(lowerQuery));

    setResults({
      shelves: filter(allData.shelves),
      containers: filter(allData.containers),
      folders: filter(allData.folders),
      documents: filter(allData.documents),
    });
  }, [query, allData]);

  const renderResultGroup = (title, items, type) => (
    <Box mt={6}>
      <Heading size="sm" mb={2}>
        {title}
      </Heading>
      {items.length > 0 ? (
        <VStack align="start" spacing={2}>
          {items.map((item) => (
            <ChakraLink
              key={item.id}
              as={Link}
              to={getPath(type, item)}
              _hover={{ textDecoration: "underline" }}
              fontSize="sm"
              bg={cardBg}
              px={3}
              py={2}
              borderRadius="md"
              w="100%"
              boxShadow="md"
            >
              {item.name}
            </ChakraLink>
          ))}
        </VStack>
      ) : (
        <Text fontSize="sm" color="gray.500">
          No matching {title.toLowerCase()}.
        </Text>
      )}
      <Divider mt={3} />
    </Box>
  );

  const getPath = (type, item) => {
    switch (type) {
      case "shelves":
        return `/file-organizer/shelves/${item.id}/containers`;
      case "containers":
        return `/file-organizer/shelves/${item.shelf_id}/containers/${item.id}/folders`;
      case "folders":
        return `/shelves/${item.shelf_id}/containers/${item.container_id}/folders/${item.id}/documents`;
      case "documents":
        return `/shelves/${item.shelf_id}/containers/${item.container_id}/folders/${item.folder_id}/documents/${item.id}`;
      default:
        return "/";
    }
  };

  return (
    <Box maxW="700px" mx="auto" p={6}>
      <Heading size="md" mb={4}>
        🔍 Global Search
      </Heading>
      <Input
        placeholder="Search shelves, containers, folders, or documents by name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        size="lg"
        mb={6}
      />

      {loading ? (
        <Spinner size="xl" color="teal.500" />
      ) : (
        <>
          {renderResultGroup("Shelves", results.shelves, "shelves")}
          {renderResultGroup("Containers", results.containers, "containers")}
          {renderResultGroup("Folders", results.folders, "folders")}
          {renderResultGroup("Documents", results.documents, "documents")}
        </>
      )}
    </Box>
  );
};

export default GlobalSearchPage;

// Dummy fetch function if needed (replace with your actual logic)
async function getAllData(endpoint) {
  const res = await fetch(`/api/${endpoint}`);
  const json = await res.json();
  return json;
}
