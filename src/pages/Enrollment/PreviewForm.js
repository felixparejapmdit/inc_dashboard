import React from "react";
import {
    Box,
    Text,
    FormControl,
    FormLabel,
    FormErrorMessage,
} from "@chakra-ui/react";

/**
 * InfoField Component
 * 
 * Conditionally renders children (input controls) when isEditing is true,
 * or a styled preview box when isEditing is false.
 */
export const InfoField = ({
    label,
    value,
    isEditing,
    children,
    isRequired,
    error,
    ...props
}) => (
    <FormControl isRequired={isRequired && isEditing} isInvalid={!!error} {...props}>
        <FormLabel color="#0a5856" fontWeight="bold" fontSize="sm" mb={isEditing ? 2 : 1}>
            {label}
            {isRequired && isEditing && (
                <Text as="span" color="red.500" ml={1}>
                    *
                </Text>
            )}
        </FormLabel>
        {isEditing ? (
            children
        ) : (
            <Box
                p={3}
                bg="gray.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="teal.400"
                minH="45px"
                display="flex"
                alignItems="center"
                transition="all 0.2s"
                _hover={{ bg: "gray.100" }}
            >
                <Text fontSize="sm" color="gray.800" fontWeight="semibold">
                    {value || "N/A"}
                </Text>
            </Box>
        )}
        {isEditing && error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
);

export default InfoField;
