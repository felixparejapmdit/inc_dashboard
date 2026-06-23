import React from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

const FormActionModal = ({
  children,
  colorScheme = "teal",
  description,
  helperItems = [],
  icon,
  isOpen,
  onClose,
  title,
  eyebrow,
}) => {
  const panelBg = useColorModeValue(`${colorScheme}.50`, "gray.900");
  const iconBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue(`${colorScheme}.100`, "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const titleColor = useColorModeValue("gray.900", "white");

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
      <ModalContent borderRadius="3xl" overflow="hidden">
        <ModalHeader display="none">{title}</ModalHeader>
        <ModalCloseButton borderRadius="full" zIndex={2} />
        <ModalBody p={0}>
          <Flex direction={{ base: "column", md: "row" }} minH={{ md: "520px" }}>
            <Box
              bg={panelBg}
              borderRight={{ base: "0", md: "1px solid" }}
              borderBottom={{ base: "1px solid", md: "0" }}
              borderColor={borderColor}
              flex="0 0 34%"
              p={{ base: 6, md: 8 }}
            >
              <Flex
                align="center"
                bg={iconBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                boxShadow="0 14px 35px rgba(15, 23, 42, 0.08)"
                h="58px"
                justify="center"
                mb={6}
                w="58px"
              >
                <Icon as={icon} boxSize={7} color={`${colorScheme}.500`} />
              </Flex>

              {eyebrow && (
                <Text
                  color={`${colorScheme}.700`}
                  fontSize="xs"
                  fontWeight="800"
                  letterSpacing="0.08em"
                  mb={2}
                  textTransform="uppercase"
                >
                  {eyebrow}
                </Text>
              )}

              <Heading color={titleColor} lineHeight="1.1" size="lg">
                {title}
              </Heading>
              <Text color={mutedText} fontSize="sm" mt={3}>
                {description}
              </Text>

              {helperItems.length > 0 && (
                <Stack mt={8} spacing={3}>
                  {helperItems.map((item) => (
                    <HStack key={item} align="flex-start" spacing={3}>
                      <Flex
                        align="center"
                        bg={`${colorScheme}.500`}
                        borderRadius="full"
                        color="white"
                        flexShrink={0}
                        fontSize="xs"
                        fontWeight="800"
                        h="22px"
                        justify="center"
                        mt="1px"
                        w="22px"
                      >
                        +
                      </Flex>
                      <Text color={mutedText} fontSize="sm">
                        {item}
                      </Text>
                    </HStack>
                  ))}
                </Stack>
              )}
            </Box>

            <Box flex="1" p={{ base: 6, md: 8 }}>
              {children}
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FormActionModal;
