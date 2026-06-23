import React from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FiCloud } from "react-icons/fi";

const NEXTCLOUD_FILES_URL = "https://drive.pmdmc.net/apps/files/files";
const WEB_DAV_CLIENT_URL =
  "https://drive.pmdmc.net/remote.php/dav/files/ef757a14-2543-103f-8581-07cedf7bf2ce";

const WebDAVPage = () => {
  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  return (
    <Box bg={pageBg} minH="100vh" w="full">
      <Stack spacing={6} w="full">
        <Card borderColor={borderColor} borderRadius="3xl" boxShadow="xl" overflow="hidden">
          <CardHeader bg={cardBg} borderBottom="1px solid" borderColor={borderColor}>
            <Stack
              align={{ base: "stretch", lg: "center" }}
              direction={{ base: "column", lg: "row" }}
              justify="space-between"
              spacing={4}
            >
              <HStack align="flex-start" spacing={4}>
                <Center bg="blue.50" borderRadius="2xl" color="blue.600" h="52px" w="52px">
                  <Icon as={FiCloud} boxSize={7} />
                </Center>
                <Box>
                  <Badge borderRadius="full" colorScheme="blue" mb={2} px={3} py={1}>
                    Plugin
                  </Badge>
                  <Heading color={headingColor} size="lg">
                    WebDAV Drive
                  </Heading>
                  <Text color={mutedText} mt={1}>
                    Browse PMD Drive from this dashboard page.
                  </Text>
                </Box>
              </HStack>

              <Button
                as="a"
                colorScheme="blue"
                href={NEXTCLOUD_FILES_URL}
                leftIcon={<ExternalLinkIcon />}
                rel="noopener noreferrer"
                target="_blank"
              >
                Open full page
              </Button>
            </Stack>
          </CardHeader>

          <CardBody p={{ base: 3, md: 4 }}>
            <Alert borderRadius="2xl" mb={4} status="info">
              <AlertIcon />
              If the Drive area does not load, the server is blocking embedded pages.
              Use the Open full page button above.
            </Alert>

            <Box
              bg="white"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              h="calc(100vh - 230px)"
              minH="620px"
              overflow="hidden"
              w="full"
            >
              <iframe
                src={NEXTCLOUD_FILES_URL}
                title="WebDAV Drive"
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </Box>

            <Text color={mutedText} fontSize="xs" mt={3}>
              WebDAV client address: {WEB_DAV_CLIENT_URL}
            </Text>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
};

export default WebDAVPage;
