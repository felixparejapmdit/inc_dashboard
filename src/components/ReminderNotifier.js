import React, { useEffect, useState } from "react";
import { useToast, Box, Text, VStack, HStack, Icon, CloseButton } from "@chakra-ui/react";
import { BellIcon, TimeIcon } from "@chakra-ui/icons";
import { fetchData } from "../utils/fetchData";
import moment from "moment";

/**
 * ReminderNotifier
 * Globally monitors reminders and shows a toast notification 
 * 1-5 minutes before the scheduled time.
 */
const ReminderNotifier = () => {
    const [reminders, setReminders] = useState([]);
    const [notifiedIds, setNotifiedIds] = useState(new Set());
    const toast = useToast();
    const userId = localStorage.getItem("userId");

    // Load reminders periodically
    useEffect(() => {
        if (!userId) return;

        const loadReminders = () => {
            fetchData(
                "reminders",
                (data) => {
                    // If metadata-less array or success structure, fetchData handles it.
                    // We filter by user just in case the backend returns all.
                    const userReminders = Array.isArray(data)
                        ? data.filter(r => String(r.created_by) === String(userId))
                        : [];
                    setReminders(userReminders);
                },
                null,
                "Failed to fetch reminders for notifications"
            );
        };

        loadReminders();
        const fetchInterval = setInterval(loadReminders, 15000); // Refresh every 15 seconds for live sync

        // Listen for internal app changes
        const handleSync = () => loadReminders();
        window.addEventListener("sync-reminders", handleSync);

        return () => {
            clearInterval(fetchInterval);
            window.removeEventListener("sync-reminders", handleSync);
        };
    }, [userId]);

    // Check for upcoming reminders
    useEffect(() => {
        if (reminders.length === 0) return;

        const checkReminders = () => {
            const now = moment();

            reminders.forEach((reminder) => {
                // Skip if already notified in this session
                if (notifiedIds.has(reminder.id)) return;

                const reminderTime = moment(`${reminder.reminder_date} ${reminder.time}`);

                // Difference in minutes (positive means in future, negative means in past)
                const diffMinutes = reminderTime.diff(now, 'minutes', true);

                // Logic: From 5 minutes before up to the exact time
                // We also check if it's "now" (up to 30 seconds past) to catch any overlap
                if (diffMinutes >= -0.5 && diffMinutes <= 5) {
                    showNotification(reminder);
                    setNotifiedIds((prev) => new Set(prev).add(reminder.id));
                }
            });
        };

        const checkerInterval = setInterval(checkReminders, 15000); // Check every 15 seconds for precision
        checkReminders();

        return () => clearInterval(checkerInterval);
    }, [reminders, notifiedIds]);

    const playAlertSound = () => {
        try {
            // Using a reliable public notification sound URL
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(e => console.warn("Audio autoplay blocked until user interacts with page."));
        } catch (error) {
            console.error("Error playing alert sound:", error);
        }
    };

    const speakTitle = (text) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech to avoid overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a male voice
        const voices = window.speechSynthesis.getVoices();
        const maleVoice = voices.find(v =>
            v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('guy') ||
            v.name.toLowerCase().includes('james')
        );

        if (maleVoice) {
            utterance.voice = maleVoice;
        }

        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 0.8; // Lower pitch for a more masculine sound
        window.speechSynthesis.speak(utterance);
    };

    const showNotification = (reminder) => {
        // Unique toast ID to prevent duplicates if user keeps app open for days
        const toastId = `reminder-${reminder.id}`;
        if (toast.isActive(toastId)) return;

        // Play sound and voice
        playAlertSound();
        speakTitle(`Reminder: ${reminder.title}`);

        toast({
            id: toastId,
            position: "bottom-right",
            duration: 15000, // 15 seconds visibility
            isClosable: true,
            render: ({ onClose }) => (
                <Box
                    color="white"
                    p={4}
                    bg="orange.600"
                    borderRadius="2xl"
                    boxShadow="2xl"
                    borderLeft="8px solid"
                    borderLeftColor="whiteAlpha.400"
                    position="relative"
                    cursor="default"
                    _hover={{ bg: "orange.500" }}
                    transition="all 0.2s"
                    maxW="400px"
                >
                    <HStack spacing={4} align="start">
                        <VStack
                            bg="whiteAlpha.300"
                            p={3}
                            borderRadius="xl"
                            justify="center"
                            align="center"
                            minW="60px"
                        >
                            <Icon as={BellIcon} boxSize={7} />
                            <Text fontSize="10px" fontWeight="black" textTransform="uppercase">Alert</Text>
                        </VStack>

                        <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="bold" fontSize="lg" lineHeight="1.2">
                                {reminder.title}
                            </Text>
                            {reminder.description && (
                                <Text fontSize="sm" opacity={0.9} noOfLines={2}>
                                    {reminder.description}
                                </Text>
                            )}
                            <HStack spacing={2} pt={2}>
                                <Icon as={TimeIcon} boxSize={3} />
                                <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.800">
                                    {moment(`${reminder.reminder_date} ${reminder.time}`).fromNow()} ({reminder.time})
                                </Text>
                            </HStack>
                        </VStack>

                        <CloseButton size="sm" onClick={onClose} _hover={{ bg: "whiteAlpha.300" }} />
                    </HStack>
                </Box>
            ),
        });
    };

    return null;
};

export default ReminderNotifier;
