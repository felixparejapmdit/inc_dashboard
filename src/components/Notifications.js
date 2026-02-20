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
    Badge,
    Divider,
} from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import { getAuthHeaders } from "../utils/apiHeaders";
import moment from "moment";

const API_URL = process.env.REACT_APP_API_URL;

const Notifications = () => {
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const notifHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const notifDescColor = useColorModeValue("gray.600", "gray.300");
    const popoverBg = useColorModeValue("white", "gray.700");
    const sectionHeaderBg = useColorModeValue("gray.50", "whiteAlpha.100");

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const userSectionId = localStorage.getItem("section_id");
                const userGroupName = localStorage.getItem("groupName");
                const isAdmin = userGroupName === "Admin" || userGroupName === "VIP";

                const [newResponse, celebrantsResponse, remindersResponse, suguanResponse] = await Promise.all([
                    fetch(`${API_URL}/api/personnels/new`, { headers: getAuthHeaders() }),
                    fetch(`${API_URL}/api/personnels/celebrants`, { headers: getAuthHeaders() }),
                    fetch(`${API_URL}/api/reminders`, { headers: getAuthHeaders() }),
                    fetch(`${API_URL}/api/suguan`, { headers: getAuthHeaders() })
                ]);

                let combined = [];

                // 1. Celebrants (Birthdays/Anniversaries)
                if (celebrantsResponse.ok) {
                    const celebrants = await celebrantsResponse.json();
                    const filteredCelebrants = celebrants.filter(c => {
                        return isAdmin || (userSectionId && String(c.section_id) === String(userSectionId));
                    });
                    combined = [...combined, ...filteredCelebrants];
                }

                // 2. Reminders (Today Only)
                if (remindersResponse.ok) {
                    const remindersData = await remindersResponse.json();
                    const todayReminders = remindersData.filter(r => {
                        const isToday = moment(r.reminder_date).isSame(moment(), 'day');
                        const isSectionMatch = isAdmin || (userSectionId && String(r.section_id) === String(userSectionId));
                        return isToday && isSectionMatch;
                    }).map(r => ({
                        id: `reminder-${r.id}`,
                        title: r.title,
                        description: `${moment(r.time, "HH:mm:ss").format("hh:mm A")} - ${r.description || r.message || 'Task for today'}`,
                        type: 'reminder',
                        isToday: true,
                        priority: 2
                    }));
                    combined = [...combined, ...todayReminders];
                }

                // 3. Suguan Assignments (Today Only)
                if (suguanResponse.ok) {
                    const suguanData = await suguanResponse.json();
                    const todaySuguan = suguanData.filter(s => {
                        const isToday = moment(s.date).isSame(moment(), 'day');
                        const isSectionMatch = isAdmin || (userSectionId && String(s.section_id) === String(userSectionId));
                        return isToday && isSectionMatch;
                    }).map(s => ({
                        id: `suguan-${s.id}`,
                        title: `Suguan: ${s.name}`,
                        description: `${moment(s.time, "HH:mm:ss").format("hh:mm A")} - ${s.local_congregation} (${s.gampanin_id})`,
                        type: 'suguan',
                        isToday: true,
                        priority: 1
                    }));
                    combined = [...combined, ...todaySuguan];
                }

                // 4. New Enrollments
                if (newResponse.ok) {
                    const newData = await newResponse.json();
                    const newEnrollments = newData.map(person => ({
                        id: `new-${person.personnel_id || Math.random()}`,
                        title: "New Enrollment",
                        description: `${person.givenname || ''} ${person.surname_husband || ''} - ${person.personnel_type || 'Personnel'}`,
                        type: 'new',
                        priority: 3
                    }));
                    combined = [...combined, ...newEnrollments];
                }

                setNotifications(combined);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        // Listen for refresh events
        window.addEventListener("sync-reminders", fetchNotifications);
        window.addEventListener("sync-suguan", fetchNotifications);

        return () => {
            window.removeEventListener("sync-reminders", fetchNotifications);
            window.removeEventListener("sync-suguan", fetchNotifications);
        };
    }, []);

    const getNotifIcon = (type) => {
        switch (type) {
            case 'birthday': return "🎂";
            case 'anniversary': return "💍";
            case 'reminder': return "⏰";
            case 'suguan': return "🏢";
            default: return "👋";
        }
    };

    const getNotifColor = (type) => {
        switch (type) {
            case 'birthday': return "purple.500";
            case 'anniversary': return "pink.500";
            case 'reminder': return "blue.500";
            case 'suguan': return "teal.500";
            default: return "orange.500";
        }
    };

    if (location.pathname !== "/dashboard") {
        return null;
    }

    const renderNotifItem = (notif) => (
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
                    bg={notif.type === 'new' ? "orange.100" : (getNotifColor(notif.type) + (notif.isToday ? "" : "20"))}
                    color={notif.isToday ? "white" : getNotifColor(notif.type)}
                >
                    <Text fontSize="lg">{getNotifIcon(notif.type)}</Text>
                </Box>
                <VStack align="start" spacing={1} flex={1}>
                    <HStack justify="space-between" width="100%">
                        <Text fontWeight="bold" fontSize="sm" color="gray.800" noOfLines={1}>
                            {notif.title}
                        </Text>
                        {notif.isToday && (
                            <Badge colorScheme="red" variant="solid" fontSize="2xs" borderRadius="full">
                                TODAY
                            </Badge>
                        )}
                    </HStack>
                    <Text fontSize="xs" color={notifDescColor} lineHeight="1.4" noOfLines={2}>
                        {notif.description}
                    </Text>
                </VStack>
            </HStack>
        </Box>
    );

    const sections = [
        { title: "Reminders", icon: "⏰", filter: n => n.type === 'reminder' },
        { title: "Suguan Assignments", icon: "🏢", filter: n => n.type === 'suguan' },
        { title: "Celebrations", icon: "🎉", filter: n => n.type === 'birthday' || n.type === 'anniversary' },
        { title: "New Personnel", icon: "👤", filter: n => n.type === 'new' },
    ];

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
                            <HStack justify="space-between">
                                <Heading size="sm" color="gray.700">Notifications</Heading>
                                <Badge colorScheme="orange" variant="outline">{notifications.length}</Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                Daily updates and tracking
                            </Text>
                        </PopoverHeader>
                        <PopoverBody p={0} maxH="500px" overflowY="auto">
                            {notifications.length > 0 ? (
                                <VStack align="stretch" spacing={0}>
                                    {sections.map(section => {
                                        const items = notifications.filter(section.filter);
                                        if (items.length === 0) return null;
                                        return (
                                            <Box key={section.title}>
                                                <Text
                                                    px={5}
                                                    py={2}
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                    textTransform="uppercase"
                                                    color="gray.500"
                                                    bg={sectionHeaderBg}
                                                >
                                                    {section.icon} {section.title}
                                                </Text>
                                                <List spacing={0}>
                                                    {items.map(renderNotifItem)}
                                                </List>
                                            </Box>
                                        );
                                    })}
                                </VStack>
                            ) : (
                                <VStack p={8} spacing={3} align="center" justify="center" minH="150px">
                                    <Text fontSize="4xl">☕</Text>
                                    <Text fontSize="sm" color="gray.500" fontWeight="medium">All caught up for now!</Text>
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
