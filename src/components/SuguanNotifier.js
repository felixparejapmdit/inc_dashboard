import React, { useEffect, useState } from "react";
import { useToast, Box, Text, VStack, HStack, Icon, CloseButton, Badge } from "@chakra-ui/react";
import { TimeIcon } from "@chakra-ui/icons";
import { fetchData } from "../utils/fetchData";
import moment from "moment";
import { BookOpen, MapPin, User, Bell } from "lucide-react";

/**
 * SuguanNotifier
 * Globally monitors Suguan assignments and triggers premium popup alerts.
 */
const SuguanNotifier = () => {
    const [assignments, setAssignments] = useState([]);
    const [notifiedKeys, setNotifiedKeys] = useState(new Set());
    const toast = useToast();

    // Mapping of target windows (in minutes) 
    const TARGET_WINDOWS = [
        { min: 1440, label: "1 Day Before", id: "1d" },
        { min: 720, label: "12 Hours Before", id: "12h" },
        { min: 360, label: "6 Hours Before", id: "6h" },
        { min: 180, label: "3 Hours Before", id: "3h" },
        { min: 60, label: "1 Hour Before", id: "1h" }
    ];

    // Helper to get consistent event time
    const getEventTime = (item) => {
        // Handle cases where date might be an ISO string from Sequelize DATE type
        const dateStr = moment(item.date).format("YYYY-MM-DD");
        return moment(`${dateStr} ${item.time}`);
    };

    // Load assignments periodically
    useEffect(() => {
        const loadAssignments = () => {
            fetchData(
                "suguan",
                (data) => {
                    if (Array.isArray(data)) {
                        const now = moment();
                        const upcoming = data.filter(item => {
                            const eventTime = getEventTime(item);
                            // Keep assignments from 10 mins ago up to 48 hours ahead
                            return eventTime.isAfter(now.clone().subtract(10, 'minutes')) &&
                                eventTime.diff(now, 'hours') < 48;
                        });
                        setAssignments(upcoming);
                    }
                },
                null,
                "Failed to fetch suguan for notifications"
            );
        };

        loadAssignments();
        const fetchInterval = setInterval(loadAssignments, 20000); // 20s refresh

        const handleSync = () => loadAssignments();
        window.addEventListener("sync-suguan", handleSync);

        return () => {
            clearInterval(fetchInterval);
            window.removeEventListener("sync-suguan", handleSync);
        };
    }, []);

    // Check for triggers
    useEffect(() => {
        if (assignments.length === 0) return;

        const checkTriggers = () => {
            const now = moment();

            assignments.forEach((assignment) => {
                const eventTime = getEventTime(assignment);
                const diffMinutes = eventTime.diff(now, 'minutes', true);

                // Find the appropriate milestone
                const currentMilestone = [...TARGET_WINDOWS]
                    .filter(w => diffMinutes <= w.min)
                    .sort((a, b) => a.min - b.min)[0];

                if (currentMilestone && diffMinutes > -2) { // Allow slight buffer past start
                    const notificationKey = `suguan-${assignment.id}-${currentMilestone.id}`;

                    if (!notifiedKeys.has(notificationKey)) {
                        triggerAlert(assignment, currentMilestone.label);
                        setNotifiedKeys(prev => new Set(prev).add(notificationKey));
                    }
                }
            });
        };

        const interval = setInterval(checkTriggers, 10000); // Check every 10s
        checkTriggers();

        return () => clearInterval(interval);
    }, [assignments, notifiedKeys]);

    const triggerAlert = (item, windowLabel) => {
        const toastId = `suguan-alert-${item.id}-${windowLabel.replace(/\s+/g, '')}`;
        if (toast.isActive(toastId)) return;

        playAlertSound();
        speakAssignment(item, windowLabel);

        const eventTime = getEventTime(item);

        toast({
            id: toastId,
            position: "bottom-right",
            duration: 15000,
            isClosable: true,
            render: ({ onClose }) => (
                <Box
                    color="white"
                    p={4}
                    bg="teal.600"
                    borderRadius="2xl"
                    boxShadow="xl"
                    borderLeft="10px solid"
                    borderLeftColor="whiteAlpha.400"
                    maxW="400px"
                    m={2}
                >
                    <HStack spacing={4} align="start">
                        <VStack bg="whiteAlpha.200" p={2} borderRadius="lg" minW="60px">
                            <Icon as={Bell} boxSize={6} />
                            <Text fontSize="8px" fontWeight="bold">SUGUAN</Text>
                        </VStack>

                        <VStack align="start" spacing={1} flex={1}>
                            <Badge colorScheme="whiteAlpha" fontSize="9px">{windowLabel}</Badge>
                            <Text fontWeight="bold" fontSize="md" noOfLines={1}>{item.name}</Text>
                            <HStack spacing={1}>
                                <Icon as={MapPin} boxSize={3} />
                                <Text fontSize="xs" noOfLines={1}>{item.local_congregation}</Text>
                            </HStack>
                            <HStack spacing={2} pt={2}>
                                <Icon as={TimeIcon} boxSize={3} />
                                <Text fontSize="xs" fontWeight="bold">
                                    {eventTime.format("h:mm A")} ({eventTime.fromNow()})
                                </Text>
                            </HStack>
                        </VStack>
                        <CloseButton size="sm" onClick={onClose} />
                    </HStack>
                </Box>
            ),
        });
    };

    const playAlertSound = () => {
        try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
            audio.volume = 0.4;
            audio.play().catch(() => { });
        } catch (e) { }
    };

    const speakAssignment = (item, windowLabel) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const text = `Suguan Reminder: ${windowLabel}. ${item.name} at ${item.local_congregation}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    return null;
};

export default SuguanNotifier;
