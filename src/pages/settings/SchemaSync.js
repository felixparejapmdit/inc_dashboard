import React, { useState } from "react";
import {
    Box,
    Button,
    VStack,
    HStack,
    useToast,
    Text,
    Badge,
    Card,
    CardBody,
    CardHeader,
    Heading,
    SimpleGrid,
    List,
    ListItem,
    ListIcon,
    Divider,
    Flex,
    Switch,
    FormControl,
    FormLabel,
    Collapse,
    Input,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, InfoIcon } from "@chakra-ui/icons";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "";

const SchemaSync = () => {
    const [dbTables, setDbTables] = useState([]);
    const [modelsList, setModelsList] = useState([]);
    const [missingTables, setMissingTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [useCustomDb, setUseCustomDb] = useState(false);
    const [dbConfig, setDbConfig] = useState({
        host: "localhost",
        port: 3306,
        username: "root",
        password: "",
        database: "",
    });

    const toast = useToast();

    const fetchSchemaStatus = async () => {
        setLoading(true);
        try {
            const payload = useCustomDb ? { dbConfig } : {};
            const response = await axios.post(`${API_URL}/api/schema/check`, payload);

            const { dbTables: tables, allModels, missingTables: missing } = response.data;

            console.log("API Response:", response.data);
            console.log("DB Tables count:", tables?.length);
            console.log("DB Tables:", tables);
            console.log("All Models count:", allModels?.length);

            setDbTables(tables || []);
            setModelsList(allModels || []);
            setMissingTables(missing || []);

            toast({
                title: "Schema Check Complete",
                description: `Found ${allModels?.length || 0} models and ${tables?.length || 0} database tables.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error fetching schema status:", error);
            toast({
                title: "Error",
                description: "Failed to fetch schema status.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (missingTables.length === 0) {
            toast({
                title: "Nothing to Sync",
                description: "All models are already in sync with the database.",
                status: "info",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (useCustomDb) {
            const confirmed = window.confirm(
                "Syncing to a custom database may have limitations (e.g., foreign keys). Continue?"
            );
            if (!confirmed) return;
        }

        setSyncing(true);
        try {
            const tablesToSync = missingTables.map((item) => item.tableName);
            const payload = {
                tablesToSync,
                dbConfig: useCustomDb ? dbConfig : undefined,
            };

            const response = await axios.post(`${API_URL}/api/schema/sync`, payload);

            toast({
                title: "Sync Complete",
                description: `Successfully synced ${response.data.syncedTables.length} tables.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Refresh the schema status
            fetchSchemaStatus();
        } catch (error) {
            console.error("Error syncing schema:", error);
            toast({
                title: "Sync Failed",
                description: error.response?.data?.message || "Failed to sync schema.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setSyncing(false);
        }
    };

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center">
                    <Heading size="lg" color="gray.700">
                        Database Schema Synchronization
                    </Heading>
                    <HStack>
                        <Button
                            colorScheme="blue"
                            onClick={fetchSchemaStatus}
                            isLoading={loading}
                            loadingText="Checking..."
                        >
                            {useCustomDb ? "Check External DB" : "Check for Updates"}
                        </Button>
                        {missingTables.length > 0 && (
                            <Button
                                colorScheme="green"
                                onClick={handleSync}
                                isLoading={syncing}
                                loadingText="Syncing..."
                            >
                                Sync All ({missingTables.length})
                            </Button>
                        )}
                    </HStack>
                </Flex>

                {/* Custom Database Toggle */}
                <Card variant="outline" boxShadow="sm">
                    <CardBody>
                        <FormControl display="flex" alignItems="center" mb={4}>
                            <FormLabel htmlFor="custom-db" mb="0" fontWeight="semibold">
                                Check External Database?
                            </FormLabel>
                            <Switch
                                id="custom-db"
                                isChecked={useCustomDb}
                                onChange={(e) => setUseCustomDb(e.target.checked)}
                                colorScheme="blue"
                            />
                        </FormControl>

                        <Collapse in={useCustomDb} animateOpacity>
                            <VStack spacing={3} align="stretch">
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                    <Input
                                        placeholder="Host"
                                        value={dbConfig.host}
                                        onChange={(e) =>
                                            setDbConfig({ ...dbConfig, host: e.target.value })
                                        }
                                    />
                                    <Input
                                        placeholder="Port"
                                        type="number"
                                        value={dbConfig.port}
                                        onChange={(e) =>
                                            setDbConfig({ ...dbConfig, port: e.target.value })
                                        }
                                    />
                                    <Input
                                        placeholder="Username"
                                        value={dbConfig.username}
                                        onChange={(e) =>
                                            setDbConfig({ ...dbConfig, username: e.target.value })
                                        }
                                    />
                                    <Input
                                        placeholder="Password"
                                        type="password"
                                        value={dbConfig.password}
                                        onChange={(e) =>
                                            setDbConfig({ ...dbConfig, password: e.target.value })
                                        }
                                    />
                                </SimpleGrid>
                                <Input
                                    placeholder="Database Name"
                                    value={dbConfig.database}
                                    onChange={(e) =>
                                        setDbConfig({ ...dbConfig, database: e.target.value })
                                    }
                                />
                            </VStack>
                        </Collapse>
                    </CardBody>
                </Card>

                {/* Summary Alert */}
                {missingTables.length > 0 && (
                    <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Box flex="1">
                            <AlertTitle>Schema Mismatch Detected</AlertTitle>
                            <AlertDescription>
                                {missingTables.filter(t => t.status === "Missing Table").length} table(s) missing and{" "}
                                {missingTables.filter(t => t.status === "Missing Columns").length} table(s) with missing columns.
                            </AlertDescription>
                        </Box>
                    </Alert>
                )}

                {loading ? (
                    <Flex justify="center" align="center" minH="300px">
                        <Spinner size="xl" color="blue.500" thickness="4px" />
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        {/* Backend Models (Source of Truth) */}
                        <Card variant="outline" boxShadow="md" borderColor="blue.200" borderWidth="2px">
                            <CardHeader bg="blue.50" borderBottomWidth="1px">
                                <HStack justify="space-between">
                                    <Heading size="md" color="blue.700">
                                        Backend Models (Source of Truth)
                                    </Heading>
                                    <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                                        {modelsList.length} Models
                                    </Badge>
                                </HStack>
                            </CardHeader>
                            <CardBody maxH="500px" overflowY="auto">
                                {modelsList.length === 0 ? (
                                    <Text color="gray.500" textAlign="center" py={8}>
                                        Click "Check for Updates" to load models
                                    </Text>
                                ) : (
                                    <List spacing={2}>
                                        {modelsList.map((model, index) => (
                                            <ListItem
                                                key={index}
                                                p={3}
                                                borderRadius="md"
                                                bg={model.status === "Missing Table" ? "red.50" : model.status === "Missing Columns" ? "orange.50" : "green.50"}
                                                borderWidth="1px"
                                                borderColor={model.status === "Missing Table" ? "red.200" : model.status === "Missing Columns" ? "orange.200" : "green.200"}
                                            >
                                                <HStack justify="space-between" align="start">
                                                    <VStack align="start" spacing={1} flex={1}>
                                                        <HStack>
                                                            <ListIcon
                                                                as={model.status === "Missing Table" ? WarningIcon : model.status === "Missing Columns" ? InfoIcon : CheckCircleIcon}
                                                                color={model.status === "Missing Table" ? "red.500" : model.status === "Missing Columns" ? "orange.500" : "green.500"}
                                                            />
                                                            <Text fontWeight="bold" fontSize="sm">
                                                                {model.name}
                                                            </Text>
                                                        </HStack>
                                                        <Text fontSize="xs" color="gray.600" ml={6}>
                                                            Table: <code>{model.tableName}</code>
                                                        </Text>
                                                        {model.details && model.details.length > 0 && model.details[0] !== "Entire table missing" && (
                                                            <Text fontSize="xs" color="gray.500" ml={6}>
                                                                Missing: {model.details.join(", ")}
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                    <Badge
                                                        colorScheme={model.status === "Missing Table" ? "red" : model.status === "Missing Columns" ? "orange" : "green"}
                                                        fontSize="xs"
                                                    >
                                                        {model.status === "Missing Table" ? "Missing" : model.status === "Missing Columns" ? "Partial" : "Synced"}
                                                    </Badge>
                                                </HStack>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </CardBody>
                        </Card>

                        {/* Current Database Tables */}
                        <Card variant="outline" boxShadow="md" borderColor="gray.200" borderWidth="2px">
                            <CardHeader bg="gray.50" borderBottomWidth="1px">
                                <HStack justify="space-between">
                                    <Heading size="md" color="gray.700">
                                        Current Database Tables
                                    </Heading>
                                    <Badge colorScheme="gray" fontSize="md" px={3} py={1}>
                                        {dbTables.length} Tables
                                    </Badge>
                                </HStack>
                            </CardHeader>
                            <CardBody maxH="500px" overflowY="auto">
                                {dbTables.length === 0 ? (
                                    <Text color="gray.500" textAlign="center" py={8}>
                                        Click "Check for Updates" to load tables
                                    </Text>
                                ) : (
                                    <List spacing={2}>
                                        {dbTables.map((table, index) => (
                                            <ListItem
                                                key={index}
                                                p={3}
                                                borderRadius="md"
                                                bg="gray.50"
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                            >
                                                <HStack>
                                                    <ListIcon as={CheckCircleIcon} color="gray.500" />
                                                    <Text fontWeight="medium" fontSize="sm">
                                                        {table}
                                                    </Text>
                                                </HStack>
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </CardBody>
                        </Card>
                    </SimpleGrid>
                )}

                {/* Instructions */}
                <Card variant="outline" bg="blue.50" borderColor="blue.200">
                    <CardBody>
                        <VStack align="start" spacing={2}>
                            <HStack>
                                <InfoIcon color="blue.500" />
                                <Text fontWeight="bold" color="blue.700">
                                    How it works:
                                </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.700">
                                1. The <strong>Backend Models</strong> folder serves as the source of truth
                            </Text>
                            <Text fontSize="sm" color="gray.700">
                                2. Click <strong>"Check for Updates"</strong> to compare models against the database
                            </Text>
                            <Text fontSize="sm" color="gray.700">
                                3. Missing or incomplete tables will be highlighted in red/orange
                            </Text>
                            <Text fontSize="sm" color="gray.700">
                                4. Click <strong>"Sync All"</strong> to create missing tables and add missing columns
                            </Text>
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
};

export default SchemaSync;
