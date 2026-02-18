import React, { useState, useEffect } from "react";
import Joyride, { STATUS } from "react-joyride";
import { useLocation } from "react-router-dom";
import {
  Box,
  Text,
  Image,
  HStack,
  VStack,
  Heading,
  useColorModeValue,
  IconButton,
  Icon,
  Tooltip,
  Portal,
  Flex,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  List,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { usePermissionContext } from "../contexts/PermissionContext";
import { FiHelpCircle, FiBell } from "react-icons/fi";
import { getAuthHeaders } from "../utils/apiHeaders";

const API_URL = process.env.REACT_APP_API_URL;

const MotionBox = motion.create(Box);

// Helper for Typing Effect
const TypingText = ({ text, speed = 25, onTypingStatusChange }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (onTypingStatusChange) onTypingStatusChange(true);
    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onTypingStatusChange) onTypingStatusChange(false);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]); // Removed onTypingStatusChange from dependency to avoid loop if parent callback isn't stable

  return <>{displayedText}</>;
};

// Carrier Component to hold step data
const StepContent = ({ img, text, title }) => null;

const TooltipComponent = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}) => {
  const { img, text, title } = step.content.props;
  const [isTyping, setIsTyping] = useState(false);

  // Animation Variants
  const mascotVariants = {
    idle: {
      y: [0, -15, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    talking: {
      y: [0, -5, 3, -2, 0],
      scale: [1, 1.02, 0.98, 1.01, 1],
      rotate: [0, -1, 1, -1, 0],
      transition: { duration: 0.4, repeat: Infinity }
    }
  };

  // Text-to-Speech Effect
  useEffect(() => {
    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.9; // Lower pitch for male robot tone
      utterance.volume = 1.0;

      // Try to select a "Microsoft David" or "Google UK English Male" or any Male voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.name.includes("Microsoft David") ||
        voice.name.includes("Google UK English Male") ||
        voice.name.includes("Google US English Male") ||
        (voice.name.includes("Male") && voice.lang.startsWith("en"))
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    };

    // A small delay to ensure voices are loaded if it's the first time
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
    } else {
      speak();
    }

    // Cleanup on unmount or step change
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [text]);

  return (
    <Box
      {...tooltipProps}
      bg="white"
      borderRadius="3xl"
      p={6}
      shadow="0 25px 70px rgba(0,0,0,0.4)"
      maxWidth="460px"
      position="relative"
      mr={{ base: 0, md: "100px" }}
    >
      <Flex direction="row" gap={4} align="start">
        <VStack align="start" spacing={5} flex="1">
          <VStack align="start" spacing={2} width="100%">
            <HStack spacing={3} width="100%" justify="space-between">
              <HStack spacing={3}>
                <Box p={2.5} bg="orange.50" borderRadius="2xl" shadow="sm">
                  {img && <Image src={img} boxSize="32px" objectFit="contain" />}
                </Box>
                <Heading size="md" color="orange.600" fontWeight="900" letterSpacing="tight">
                  {title}
                </Heading>
              </HStack>
              <Box bg="orange.100" px={3} py={1} borderRadius="full">
                <Text fontSize="xs" fontWeight="extrabold" color="orange.700">
                  Step {index + 1} / {step.totalSteps}
                </Text>
              </Box>
            </HStack>
            <Box h="4px" w="70px" bg="orange.400" borderRadius="full" mt={1} />
          </VStack>

          <Box
            bg="orange.50"
            p={5}
            borderRadius="2xl"
            width="100%"
            border="2px solid"
            borderColor="orange.100"
            boxShadow="inner"
            minH="100px" // ensure height doesn't jump too much during typing
          >
            <Text fontSize="md" color="gray.800" fontWeight="700" lineHeight="1.7">
              <TypingText text={text} onTypingStatusChange={setIsTyping} />
            </Text>
          </Box>

          <Flex width="100%" justify="space-between" align="center" pt={4}>
            {!isLastStep ? (
              <Button {...skipProps} variant="ghost" size="sm" color="gray.400" fontWeight="700" _hover={{ color: "red.400", bg: "red.50" }}>
                Skip Guide
              </Button>
            ) : <Box />}

            <HStack spacing={4}>
              {index > 0 && (
                <Button {...backProps} variant="outline" colorScheme="orange" size="md" borderRadius="2xl" fontWeight="800" px={6}>
                  Previous
                </Button>
              )}
              <Button
                {...primaryProps}
                colorScheme="orange"
                size="lg"
                borderRadius="2xl"
                px={10}
                fontWeight="900"
                fontSize="md"
                boxShadow="0 8px 25px rgba(245, 124, 0, 0.4)"
                _hover={{ transform: "translateY(-3px)", boxShadow: "0 12px 30px rgba(245, 124, 0, 0.5)" }}
                _active={{ transform: "translateY(0)" }}
              >
                {isLastStep ? "Let's Go!" : "Continue"}
              </Button>
            </HStack>
          </Flex>
        </VStack>

        {/* Animated Mascot - Sticker Style on RIGHT */}
        <MotionBox
          position="absolute"
          right="-180px"
          bottom="-10px"
          width="240px"
          height="240px"
          zIndex="2"
          display={{ base: "none", md: "block" }}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <MotionBox
            animate={isTyping ? "talking" : "idle"}
            variants={mascotVariants}
          >
            <Box
              position="relative"
              width="240px"
              height="240px"
            >
              {/* The Robot Image with a Circular Clip to hide the white corners */}
              <Image
                src="/images/robot_avatar.png"
                alt="Guide Robot"
                objectFit="contain"
                boxSize="100%"
                filter="drop-shadow(0px 12px 24px rgba(0,0,0,0.4))"
                style={{
                  clipPath: 'circle(45% at 50% 50%)',
                  mixBlendMode: 'multiply'
                }}
              />
            </Box>
          </MotionBox>
        </MotionBox>

        {/* Small version for mobile - Right side */}
        <Box
          display={{ base: "flex", md: "none" }}
          position="absolute"
          top="-60px"
          right="20px"
          borderRadius="full"
          bg="white"
          p={1}
          shadow="2xl"
          border="4px solid"
          borderColor="orange.400"
          zIndex="3"
        >
          {/* Add simpler animation for mobile if needed, but MotionBox is desktop only in current code block structure above. 
               Let's wrap this Image in MotionBox too or leave static for performance? 
               User asked for "animated talking robot", let's apply a simple one here too. */}
          <MotionBox
            animate={isTyping ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={isTyping ? { duration: 0.4, repeat: Infinity } : {}}
          >
            <Image
              src="/images/robot_avatar.png"
              boxSize="100px"
              borderRadius="full"
              bg="white"
              style={{ clipPath: 'circle(50%)' }}
            />
          </MotionBox>
        </Box>
      </Flex>

      {/* Speech Arrow - Pointing to Right */}
      <Box
        position="absolute"
        bottom="70px"
        right="-12px"
        width="28px"
        height="28px"
        bg="white"
        transform="rotate(45deg)"
        display={{ base: "none", md: "block" }}
        boxShadow="5px -5px 10px rgba(0,0,0,0.05)"
      />
    </Box>
  );
};

const Tutorial = ({ isSidebarExpanded, onExpandSidebar }) => {
  const [run, setRun] = useState(false);
  const { hasPermission } = usePermissionContext();

  const allPossibleSteps = [
    {
      target: '[data-tour="dashboard-logo"]',
      content: <StepContent
        title="Welcome Back!"
        img="/images/hand-pointer.png"
        text="Hello! I'm your Guide Assistant. I'll help you get familiar with the new interface and powerful tools at your fingertips!"
      />,
      placement: "center", // Centered as requested
      alwaysShow: true,
      disableBeacon: true,
    },
    {
      target: '[data-tour="sidebar-toggle"]',
      content: <StepContent
        title="Layout Control"
        img="/images/hand-pointer.png"
        text="Need a wider view? Use this toggle to collapse the sidebar and focus entirely on your active workspace."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="search-bar"]',
      content: <StepContent
        title="Global Search"
        img="/images/hand-pointer.png"
        text="Looking for someone or something specific? The search bar scans the entire system instantly for you."
      />,
      placement: "bottom",
    },
    {
      target: '[data-tour="dashboard"]',
      permission: "*home.view",
      content: <StepContent
        title="Home Dashboard"
        img="/images/hand-pointer.png"
        text="Your central hub. Get instant updates, task reminders, and a high-level summary of your personnel data."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="statistics"]',
      permission: "statistics.view",
      content: <StepContent
        title="Insight Analytics"
        img="/images/hand-pointer.png"
        text="Access deep-dive analytics and visual reporting here to monitor organizational trends in real-time."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="inventory-dashboard"]',
      permission: "inv_dashboard.view",
      content: <StepContent
        title="Asset Management"
        img="/images/hand-pointer.png"
        text="Complete control over company assets and inventory levels. Perfect for logistics and resource tracking."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="atg-dashboard"]',
      permission: "atg_dashboard.view",
      content: <StepContent
        title="Ops Monitoring"
        img="/images/hand-pointer.png"
        text="Dedicated tracking for ATG operations and specialized performance dashboards."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="profile-settings"]',
      permission: "*profile.view",
      content: <StepContent
        title="Your Account"
        img="/images/hand-pointer.png"
        text="Manage your personal information, security preferences, and profile picture."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="schedule-button"]',
      permission: "links.view",
      content: <StepContent
        title="External Resources"
        img="/images/hand-pointer.png"
        text="Quickly access and share important links, documents, and external tools within your group."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="settings-menu"]',
      permission: "*settings.view",
      content: <StepContent
        title="Admin Settings"
        img="/images/hand-pointer.png"
        text="Master configurations for the portal, including application management and category settings."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="enrollment-menu"]',
      permission: "*progress.view",
      content: <StepContent
        title="Workflow Engine"
        img="/images/hand-pointer.png"
        text="The heartbeat of enrollment. Track, update, and manage the progress of every pending applicant."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="progress-tracker"]',
      permission: "progresstracking.view",
      content: <StepContent
        title="Progress Pipeline"
        img="/images/hand-pointer.png"
        text="Visualize where every step of the process stands in real-time across the organization."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="management-menu"]',
      permission: "*management.view",
      content: <StepContent
        title="Organizational Mgmt"
        img="/images/hand-pointer.png"
        text="Fine-tune departments, sections, and citizenship settings from one centralized location."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="plugins-menu"]',
      permission: "*plugins.view",
      content: <StepContent
        title="Plugin System"
        img="/images/hand-pointer.png"
        text="Extend functionality with additional specialized modules and tools suited for your needs."
      />,
      placement: "right",
    },
    {
      target: '[data-tour="logout"]',
      content: <StepContent
        title="Secure Logout"
        img="/images/hand-pointer.png"
        text="Always remember to logout when you're done for the day to protect your session and sensitive data."
      />,
      alwaysShow: true,
      placement: "top",
    },
  ];

  const steps = allPossibleSteps
    .filter(step => step.alwaysShow || (step.permission && hasPermission(step.permission)))
    .map((step, idx, arr) => ({ ...step, totalSteps: arr.length }));

  useEffect(() => {
    const isLoggingIn = localStorage.getItem("isLoggingIn");
    // Get view count, default to 0
    const viewCount = parseInt(localStorage.getItem("tutorialViewCount") || "0", 10);
    const MAX_VIEWS = 5;

    // Only run if user just logged in AND views are less than max
    if (isLoggingIn === "true" && viewCount < MAX_VIEWS) {

      const startTourIfPossible = () => {
        if (steps.length > 0) {
          const targetEl = document.querySelector(steps[0].target);
          if (targetEl) {
            setRun(true);

            // Increment view count
            localStorage.setItem("tutorialViewCount", (viewCount + 1).toString());

            // Clear login flag so refresh doesn't trigger count increment again
            localStorage.removeItem("isLoggingIn");
            return true;
          }
        }
        return false;
      };

      // Try immediately
      if (!startTourIfPossible()) {
        const interval = setInterval(() => {
          if (startTourIfPossible()) {
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
    } else {
      // If not running, ensure isLoggingIn is cleared to not block future valid attempts incorrectly? 
      // Or if view count >= 5, simply clear it.
      if (isLoggingIn === "true") {
        localStorage.removeItem("isLoggingIn");
      }
    }
  }, [steps]);

  const handleCallback = ({ status }) => {
    const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status);
    if (finished) {
      // localStorage.removeItem("isLoggingIn"); // Handled in start logic
      setRun(false);
    }
  };

  const handleStartTour = () => {
    if (!isSidebarExpanded && onExpandSidebar) {
      onExpandSidebar();
    }
    setRun(true);
  };

  const location = useLocation();

  if (location.pathname !== "/dashboard") {
    return null;
  }

  return (
    <Portal>
      <Box position="fixed" top="24px" right="24px" zIndex={99999}>
        <Tooltip label="Need help? Click for a Tour" placement="left" hasArrow>
          <IconButton
            aria-label="Start Tutorial"
            icon={<FiHelpCircle />}
            colorScheme="orange"
            borderRadius="full"
            boxShadow="dark-lg"
            size="lg"
            onClick={handleStartTour}
            _hover={{ transform: "scale(1.1)", bg: "orange.400" }}
            transition="all 0.2s"
          />
        </Tooltip>
      </Box>

      <AnimatePresence>
        {run && (
          <Joyride
            run={run}
            steps={steps}
            callback={handleCallback}
            showSkipButton
            continuous
            scrollToFirstStep
            disableOverlayClose
            disableScrolling={false} // Allow scrolling during tour
            disableScrollParentFix={true} // Prevent Joyride from messing with parent overflow/styles
            tooltipComponent={TooltipComponent}
            styles={{
              options: {
                zIndex: 100000,
              },
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.6)",
              }
            }}
          />
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default Tutorial;
