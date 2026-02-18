import React from "react";
import { Box, Text, Progress, Flex, Tooltip } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const StepProgressTracker = ({ data, requiredFields = [], totalFields = [] }) => {
    // Calculate progress directly
    const fieldsToCheck = totalFields.length > 0 ? totalFields : (data ? Object.keys(data) : []);

    let filledCount = 0;
    let validTotal = 0;

    if (data) {
        fieldsToCheck.forEach((field) => {
            const value = data[field];

            let isFilled = false;

            if (Array.isArray(value)) {
                isFilled = value.length > 0;
            } else if (typeof value === "object" && value !== null) {
                isFilled = Object.keys(value).length > 0;
            } else {
                isFilled = value !== undefined && value !== null && String(value).trim() !== "";
            }

            if (isFilled) {
                filledCount++;
            }
            validTotal++;
        });
    }

    const progress = validTotal > 0 ? Math.round((filledCount / validTotal) * 100) : 0;

    // Determine color scheme based on progress
    const getColorScheme = (value) => {
        if (value < 30) return "red";
        if (value < 70) return "yellow";
        return "green";
    };

    const progressValue = progress; // Use state value
    const colorScheme = getColorScheme(progressValue);

    return (
        <AnimatePresence>
            <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                width="100%"
                bg="white"
                borderBottom="1px solid"
                borderColor="gray.100"
                position="sticky"
                top="0"
                zIndex="999"
            >
                <Flex align="center" width="100%">
                    <Tooltip label={`${filledCount}/${validTotal} fields filled (${progressValue}%)`} hasArrow placement="bottom">
                        <Box flex="1" position="relative" height="6px" bg="gray.100" borderRadius="full" overflow="hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressValue}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{
                                    height: "100%",
                                    background: `var(--chakra-colors-${colorScheme}-400)`,
                                    borderRadius: "0 4px 4px 0",
                                    boxShadow: `0 0 10px var(--chakra-colors-${colorScheme}-200)`
                                }}
                            />
                        </Box>
                    </Tooltip>
                    <Text ml={3} fontSize="xs" fontWeight="bold" color={`${colorScheme}.500`} width="35px" textAlign="right">
                        {progressValue}%
                    </Text>
                </Flex>
            </MotionBox>
        </AnimatePresence>
    );
};


export default StepProgressTracker;
