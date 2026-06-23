// src/pages/FileOrganizer/ContainersPage.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, ChevronRightIcon, SearchIcon } from "@chakra-ui/icons";
import { Link as RouterLink, useParams } from "react-router-dom";
import { BsBoxSeam } from "react-icons/bs";
import { FaFolder, FaLayerGroup } from "react-icons/fa";
import AddContainerForm from "./AddContainerForm";
import ContainerCard from "./ContainerCard";
import {
  createContainer,
  deleteContainer,
  getContainers,
  updateContainer,
} from "../../utils/FileOrganizer/containersService";
import { getShelfById } from "../../utils/FileOrganizer/shelvesService";
import { handleError } from "../../utils/FileOrganizer/handleError";
import FormActionModal from "../../components/FileOrganizer/FormActionModal";

const ContainersPage = () => {
  const { shelfId } = useParams();
  const toast = useToast();

  const [shelf, setShelf] = useState(null);
  const [containers, setContainers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [loading, setLoading] = useState(true);

  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const loadContainers = async () => {
    try {
      setLoading(true);
      const [shelfData, containersData] = await Promise.all([
        getShelfById(shelfId),
        getContainers(shelfId),
      ]);
      setShelf(shelfData);
      setContainers(containersData || []);
    } catch (error) {
      handleError(error, toast, "Failed to load containers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, [shelfId]);

  const filteredContainers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return containers;
    return containers.filter((container) =>
      [container.name, container.description, container.generated_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [containers, search]);

  const folderCount = useMemo(
    () => containers.reduce((total, container) => total + (container.folders?.length || 0), 0),
    [containers]
  );

  const openNewContainerForm = () => {
    setEditingContainer(null);
    setShowForm(true);
  };

  const handleSaveContainer = async (data) => {
    try {
      if (editingContainer) {
        await updateContainer(editingContainer.id, data);
        toast({ title: "Container updated", status: "success", isClosable: true });
      } else {
        await createContainer({ ...data, shelf_id: parseInt(shelfId, 10) });
        toast({ title: "Container created", status: "success", isClosable: true });
      }

      setShowForm(false);
      setEditingContainer(null);
      setSearch("");
      await loadContainers();
    } catch (error) {
      handleError(
        error,
        toast,
        editingContainer ? "Error updating container" : "Error adding container"
      );
    }
  };

  const handleDeleteContainer = async (containerId) => {
    try {
      await deleteContainer(containerId);
      toast({ title: "Container deleted", status: "success", isClosable: true });
      await loadContainers();
    } catch (error) {
      handleError(error, toast, "Error deleting container");
    }
  };

  return (
    <Box bg={pageBg} minH="100vh" mt={12} px={{ base: 3, md: 5 }} py={6} w="full">
      <Box w="full">
        <Breadcrumb
          color={mutedText}
          fontSize="sm"
          fontWeight="600"
          mb={5}
          separator={<ChevronRightIcon color="gray.400" />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/file-organizer/shelves">
              <HStack spacing={2}>
                <Icon as={FaLayerGroup} color="teal.500" />
                <Text>Shelves</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <HStack spacing={2}>
                <Icon as={FaLayerGroup} color="teal.500" />
                <Text>{shelf?.name || "Loading shelf"}</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>
              <HStack spacing={2}>
                <Icon as={BsBoxSeam} color="orange.500" />
                <Text>Containers</Text>
              </HStack>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex
          align={{ base: "flex-start", lg: "center" }}
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="3xl"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.08)"
          direction={{ base: "column", lg: "row" }}
          gap={6}
          justify="space-between"
          p={{ base: 5, md: 8 }}
        >
          <HStack align="flex-start" spacing={4}>
            <Flex
              align="center"
              bg="orange.50"
              borderRadius="2xl"
              color="orange.600"
              h="58px"
              justify="center"
              w="58px"
            >
              <Icon as={BsBoxSeam} boxSize={7} />
            </Flex>
            <Box>
              <Badge borderRadius="full" colorScheme="orange" mb={3} px={3} py={1}>
                Shelf containers
              </Badge>
              <Heading color={headingColor} size="xl">
                {shelf?.name || "Containers"}
              </Heading>
              <Text color={mutedText} fontSize={{ base: "md", md: "lg" }} mt={2}>
                Containers are boxes or sections inside this shelf.
              </Text>
            </Box>
          </HStack>

          <Button
            colorScheme="orange"
            leftIcon={<AddIcon />}
            onClick={openNewContainerForm}
            size="lg"
          >
            New container
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} mt={6} spacing={4}>
          <Flex
            align="center"
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="2xl"
            gap={3}
            p={4}
          >
            <Icon as={BsBoxSeam} color="orange.500" />
            <Text fontWeight="800">{containers.length}</Text>
            <Text color={mutedText}>containers in this shelf</Text>
          </Flex>
          <Flex
            align="center"
            bg={panelBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="2xl"
            gap={3}
            p={4}
          >
            <Icon as={FaFolder} color="yellow.500" />
            <Text fontWeight="800">{folderCount}</Text>
            <Text color={mutedText}>folders across containers</Text>
          </Flex>
        </SimpleGrid>

        <FormActionModal
          colorScheme="orange"
          description="Create a container, like a box or section, inside the current shelf."
          eyebrow="Container setup"
          helperItems={[
            "Use containers to divide a shelf into smaller areas.",
            "Add a helpful description if this container has a specific purpose.",
            "Folders can be added after the container is saved.",
          ]}
          icon={BsBoxSeam}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingContainer(null);
          }}
          title={editingContainer ? "Edit container" : "Create new container"}
        >
          <AddContainerForm
            editData={editingContainer}
            onSave={handleSaveContainer}
          />
        </FormActionModal>

        <Stack
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          mt={8}
          spacing={4}
        >
          <Box>
            <Heading color={headingColor} size="md">
              Containers
            </Heading>
            <Text color={mutedText} fontSize="sm">
              {filteredContainers.length} container{filteredContainers.length === 1 ? "" : "s"} shown
            </Text>
          </Box>

          <InputGroup maxW={{ base: "100%", md: "360px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              bg={panelBg}
              borderColor={borderColor}
              borderRadius="xl"
              placeholder="Search containers"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </InputGroup>
        </Stack>

        {loading ? (
          <Center minH="320px">
            <Spinner color="orange.500" size="xl" />
          </Center>
        ) : filteredContainers.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} mt={5} spacing={5}>
            {filteredContainers.map((container) => (
              <ContainerCard
                key={container.id}
                container={container}
                folders={container.folders || []}
                onDelete={handleDeleteContainer}
                onUpdate={(item) => {
                  setEditingContainer(item);
                  setShowForm(true);
                }}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center
            bg={panelBg}
            border="1px dashed"
            borderColor={borderColor}
            borderRadius="2xl"
            flexDirection="column"
            mt={5}
            minH="280px"
            p={8}
            textAlign="center"
          >
            <Icon as={search ? FaLayerGroup : BsBoxSeam} boxSize={10} color="orange.400" mb={4} />
            <Heading size="md">No containers found</Heading>
            <Text color={mutedText} maxW="420px" mt={2}>
              {search
                ? "Try a different search word."
                : "Add a container inside this shelf to hold folders."}
            </Text>
            {!search && (
              <Button colorScheme="orange" leftIcon={<AddIcon />} mt={5} onClick={openNewContainerForm}>
                New container
              </Button>
            )}
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default ContainersPage;
