import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Box,
    IconButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    Heading,
    Text,
    VStack,
    HStack,
    List,
    Portal,
    useColorModeValue,
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import { getAuthHeaders } from "../utils/apiHeaders";

const API_URL = process.env.REACT_APP_API_URL;

const Notifications = () => {
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);



    const notifHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const notifDescColor = useColorModeValue("gray.600", "gray.300");
    const popoverBg = useColorModeValue("white", "gray.700");
    const iconHoverBg = useColorModeValue("orange.100", "whiteAlpha.200");
    const sectionHeaderBg = useColorModeValue("gray.50", "whiteAlpha.100");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const [newResponse, celebrantsResponse] = await Promise.all([
                    fetch(`${API_URL}/api/personnels/new`, { headers: getAuthHeaders() }),
                    fetch(`${API_URL}/api/personnels/celebrants`, { headers: getAuthHeaders() })
                ]);

                let combined = [];

                // Prioritize celebrants
                if (celebrantsResponse.ok) {
                    const celebrants = await celebrantsResponse.json();
                    combined = [...celebrants];
                }

                if (newResponse.ok) {
                    const newData = await newResponse.json();
                    const newEnrollments = newData.map(person => ({
                        id: person.id || Math.random(),
                        title: "New Enrollment",
                        description: `${person.givenname || ''} ${person.surname_husband || ''} - ${person.personnel_type || 'Personnel'} ${person.current_step ? `(Step: ${person.current_step})` : ''}`,
                        type: 'new'
                    }));
                    combined = [...combined, ...newEnrollments];
                }

                setNotifications(combined);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };
        fetchNotifications();
    }, []);

    const getNotifIcon = (type) => {
        switch (type) {
            case 'birthday': return "🎂";
            case 'anniversary': return "💍";
            default: return "👋";
        }
    };

    const getNotifColor = (type) => {
        switch (type) {
            case 'birthday': return "purple.500";
            case 'anniversary': return "pink.500";
            default: return "orange.500";
        }
    };

    if (location.pathname !== "/dashboard") {
        return null;
    }

    return (
        <Portal>
            <Box position="fixed" top="24px" right="90px" zIndex={99999}>
                <Popover placement="bottom-end">
                    <PopoverTrigger>
                        <Box position="relative">
                            <IconButton
                                icon={<FiBell />}
                                isRound
                                size="lg"
                                aria-label="Notifications"
                                colorScheme="orange"
                                boxShadow="dark-lg"
                                _hover={{ transform: "scale(1.1)", bg: "orange.400" }}
                                transition="all 0.2s"
                            />
                            {notifications.length > 0 && (
                                <Box
                                    w="12px"
                                    h="12px"
                                    borderRadius="full"
                                    bg="red.500"
                                    position="absolute"
                                    top="2px"
                                    right="2px"
                                    border="2px solid white"
                                />
                            )}
                        </Box>
                    </PopoverTrigger>
                    <PopoverContent
                        bg={popoverBg}
                        borderColor="orange.200"
                        zIndex={100000}
                        width="360px"
                        shadow="2xl"
                        borderRadius="xl"
                        _focus={{ outline: "none" }}
                    >
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader borderBottom="1px solid" borderColor="gray.100" pt={4} px={5} pb={3}>
                            <Heading size="sm" color="gray.700">Notifications</Heading>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                Updates for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </Text>
                        </PopoverHeader>
                        <PopoverBody p={0} maxH="500px" overflowY="auto">
                            {notifications.length > 0 ? (
                                <VStack align="stretch" spacing={0}>
                                    {/* Celebrations Section */}
                                    {notifications.some(n => n.type !== 'new') && (
                                        <Box>
                                            <Text
                                                px={5}
                                                py={2}
                                                fontSize="xs"
                                                fontWeight="bold"
                                                textTransform="uppercase"
                                                color="gray.500"
                                                bg={sectionHeaderBg}
                                            >
                                                🎉 Celebrations
                                            </Text>
                                            <List spacing={0}>
                                                {notifications.filter(n => n.type !== 'new').map((notif) => (
                                                    <Box
                                                        key={notif.id}
                                                        px={5}
                                                        py={3}
                                                        _hover={{ bg: notifHoverBg }}
                                                        transition="all 0.2s"
                                                        cursor="pointer"
                                                        borderBottom="1px solid"
                                                        borderColor="gray.50"
                                                    >
                                                        <HStack align="start" spacing={4}>
                                                            <Box
                                                                w="40px"
                                                                h="40px"
                                                                borderRadius="full"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                bg={getNotifColor(notif.type) + (notif.isToday ? "" : "20")}
                                                                color={notif.isToday ? "white" : getNotifColor(notif.type)}
                                                            >
                                                                <Text fontSize="lg">{getNotifIcon(notif.type)}</Text>
                                                            </Box>
                                                            <VStack align="start" spacing={1} flex={1}>
                                                                <HStack justify="space-between" width="100%">
                                                                    <Text fontWeight="bold" fontSize="sm" color="gray.800">
                                                                        {notif.title}
                                                                    </Text>
                                                                    {notif.isToday && (
                                                                        <Box px={2} py={0.5} bg="red.500" color="white" borderRadius="full" fontSize="xx-small" fontWeight="bold">
                                                                            TODAY
                                                                        </Box>
                                                                    )}
                                                                </HStack>
                                                                <Text fontSize="xs" color={notifDescColor} lineHeight="1.4">
                                                                    {notif.description}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </List>
                                        </Box>
                                    )}

                                    {/* New Enrollments Section */}
                                    {notifications.some(n => n.type === 'new') && (
                                        <Box>
                                            <Text
                                                px={5}
                                                py={2}
                                                fontSize="xs"
                                                fontWeight="bold"
                                                textTransform="uppercase"
                                                color="gray.500"
                                                bg={sectionHeaderBg}
                                            >
                                                👤 New Personnel
                                            </Text>
                                            <List spacing={0}>
                                                {notifications.filter(n => n.type === 'new').map((notif) => (
                                                    <Box
                                                        key={notif.id}
                                                        px={5}
                                                        py={3}
                                                        _hover={{ bg: notifHoverBg }}
                                                        transition="all 0.2s"
                                                        cursor="pointer"
                                                        borderBottom="1px solid"
                                                        borderColor="gray.50"
                                                    >
                                                        <HStack align="start" spacing={4}>
                                                            <Box
                                                                w="40px"
                                                                h="40px"
                                                                borderRadius="full"
                                                                display="flex"
                                                                alignItems="center"
                                                                justifyContent="center"
                                                                bg="orange.100"
                                                                color="orange.500"
                                                            >
                                                                <Text fontSize="lg">👋</Text>
                                                            </Box>
                                                            <VStack align="start" spacing={1}>
                                                                <Text fontWeight="bold" fontSize="sm" color="gray.800">
                                                                    {notif.title}
                                                                </Text>
                                                                <Text fontSize="xs" color={notifDescColor} lineHeight="1.4">
                                                                    {notif.description}
                                                                </Text>
                                                            </VStack>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </VStack>
                            ) : (
                                <VStack p={8} spacing={3} align="center" justify="center" minH="150px">
                                    <Text fontSize="4xl">☕</Text>
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium">All caught up for {new Date().toLocaleString('default', { month: 'long' })}!</Text>
                                </VStack>
                            )}
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </Box>
        </Portal>
    );
};

export default Notifications;
