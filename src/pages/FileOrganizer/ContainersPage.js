import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  SimpleGrid,
  Spinner,
  Center,
  Divider,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  ScaleFade,
  Icon,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import {
  getContainers,
  createContainer,
} from "../../utils/FileOrganizer/containersService";
import { getShelves } from "../../utils/FileOrganizer/shelvesService";
import ContainerCard from "./ContainerCard";
import AddContainerForm from "./AddContainerForm";
import { handleError } from "../../utils/FileOrganizer/handleError";

const ContainersPage = () => {
  const [containers, setContainers] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [filteredContainers, setFilteredContainers] = useState([]);
  const [selectedShelfId, setSelectedShelfId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchShelves();
  }, []);

  useEffect(() => {
    fetchContainers();
  }, []);


  useEffect(() => {
    if (!loading) {
      filterContainers();
    }
  }, [containers, selectedShelfId, search, loading]);

  const fetchShelves = async () => {
    try {
      const shelfData = await getShelves();
      setShelves(shelfData || []);
    } catch (error) {
      handleError(error, toast, "Failed to fetch shelves");
    }
  };

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const data = await getContainers();
      setContainers(data); // ✅ updates containers
    } catch (error) {
      handleError(error, toast, "Failed to fetch containers");
      setContainers([]);
    } finally {
      setLoading(false); // ✅ triggers the useEffect to call filterContainers
    }
  };

const handleAddContainer = async (newContainerData) => {
  try {
    const created = await createContainer(newContainerData); // ✅ use as-is
    if (created) {
      setShowForm(false);
      fetchContainers();
      filterContainers();
      toast({
        title: "Container added",
        description: "New container successfully created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (error) {
    handleError(error, toast, "Error adding container");
  }
};


  const filterContainers = () => {
    console.log("Filtering containers", {
      containers,
      selectedShelfId,
      search,
    });

    let result = [...containers];
 if (selectedShelfId !== null) {
  result = result.filter((c) => Number(c.shelf_id) === Number(selectedShelfId));
}

    if (search.trim()) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }
    setFilteredContainers(result);
  };

 const handleShelfSelect = (id) => {
  setSelectedShelfId((prev) => (prev === id ? null : Number(id)));
};


  return (
    <Box p={[4, 6, 10]}>
      <HStack justifyContent="space-between" mb={6}>
        <Heading size="lg" color="teal.700">
          📦 File Organizer — Containers1
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme={showForm ? "red" : "teal"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "Add Container"}
        </Button>
      </HStack>

      {showForm && (
        <Box mb={6}>
          <AddContainerForm shelves={shelves} onAdd={handleAddContainer} />
          <Divider mt={6} />
        </Box>
      )}

      {/* Filters */}
      <Box mb={6}>
        <VStack align="start" spacing={4}>
          {/* Search */}
          <Input
            placeholder="Search container by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftElement={<Icon as={SearchIcon} />}
          />

          {/* Filter Pills */}
          <Wrap spacing={2}>
            <WrapItem>
              <Tag
                size="lg"
                variant={selectedShelfId === "" ? "solid" : "subtle"}
                colorScheme="teal"
                cursor="pointer"
                onClick={() => setSelectedShelfId(null)}
              >
                <TagLabel>All Shelves</TagLabel>
              </Tag>
            </WrapItem>
            {shelves.map((shelf) => (
              <WrapItem key={shelf.id}>
                <Tag
                  size="lg"
                  variant={selectedShelfId === shelf.id ? "solid" : "subtle"}
                  colorScheme="teal"
                  cursor="pointer"
                  onClick={() => handleShelfSelect(shelf.id)}
                >
                  <TagLabel>{shelf.name}</TagLabel>
                  {selectedShelfId === shelf.id && (
                    <TagCloseButton onClick={() => setSelectedShelfId(null)} />
                  )}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </VStack>
      </Box>

      {/* Container Grid */}
      <Box mt={6}>
        {loading ? (
          <Center>
            <Spinner size="xl" color="teal.500" />
          </Center>
        ) : filteredContainers.length > 0 ? (
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {filteredContainers.map((container) => (
              <ScaleFade in={true} initialScale={0.95} key={container.id}>
                <ContainerCard container={container} />
              </ScaleFade>
            ))}
          </SimpleGrid>
        ) : (
          <Center>
            <Text color="gray.500">No containers found.</Text>
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default ContainersPage;
