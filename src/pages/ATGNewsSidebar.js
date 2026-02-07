// src/pages/ATGNewsSidebar.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box, Flex, Heading, Image, Link, Select, Spinner, Stack,
    Tabs, Tab, TabList, Text, useColorModeValue, Input,
    InputGroup, InputLeftElement, Divider, HStack, VStack,
    Skeleton, SkeletonText, Icon, Badge, Popover, PopoverTrigger,
    PopoverContent, PopoverBody, ScaleFade, useBreakpointValue, Portal
} from "@chakra-ui/react";
import { SearchIcon, ExternalLinkIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import axios from "axios";
import { FaNewspaper } from "react-icons/fa";

/* =========================
   NEWS SOURCES CONFIG
========================= */
const NEWS_SOURCES = {
    philippines: {
        label: "Philippines",
        outlets: {
            inquirer: { label: "Inquirer", url: "https://newsinfo.inquirer.net/feed" },
            philstar: { label: "Philstar", url: "https://www.philstar.com/rss/headlines" },
            manilabulletin: { label: "Manila Bulletin", url: "https://mb.com.ph/rss/news" },
            rappler: { label: "Rappler", url: "https://www.rappler.com/rss" },
        },
    },
    global: {
        label: "Global",
        outlets: {
            bbc: { label: "BBC News", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
            aljazeera: { label: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
            theguardian: { label: "The Guardian", url: "https://www.theguardian.com/world/rss" },
            cnn: { label: "CNN", url: "http://rss.cnn.com/rss/edition.rss" },
        },
    },
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=200&h=200&auto=format&fit=crop";

/* -------------------- UPDATED TIME LOGIC (Fixed "Just now" issue) -------------------- */
const formatTimeAgo = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const pubDate = new Date(dateString);
        const now = new Date();

        if (isNaN(pubDate.getTime())) return "N/A";

        const diffInSeconds = Math.floor((now - pubDate) / 1000);

        // Dynamic Time Formatting
        if (diffInSeconds < 30) return "Just now";
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

        return pubDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
        return "N/A";
    }
};

const extractImage = (item) => {
    const mediaThumb = item.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url");
    const mediaContent = Array.from(item.getElementsByTagName("media:content"))
        .find(m => m.getAttribute("medium") === "image" || m.getAttribute("type")?.startsWith("image"))?.getAttribute("url");
    const enclosure = item.querySelector("enclosure")?.getAttribute("url");
    const description = item.querySelector("description")?.textContent || "";
    const imgFromDesc = description.match(/src="([^"]+)"/)?.[1];
    return mediaThumb || mediaContent || enclosure || imgFromDesc || DEFAULT_IMAGE;
};

export default function ATGNewsSidebar() {
    const [category, setCategory] = useState("philippines");
    const [outletKey, setOutletKey] = useState("inquirer");
    const [allFetchedItems, setAllFetchedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const popoverTrigger = useBreakpointValue({ base: "click", lg: "hover" });
    const popoverPlacement = useBreakpointValue({ base: "bottom", lg: "left" });

    const cardBg = useColorModeValue("white", "gray.800");
    const popoverBg = useColorModeValue("white", "gray.700");
    const textMuted = useColorModeValue("gray.500", "gray.400");
    const borderColor = useColorModeValue("gray.100", "gray.700");
    const itemHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");
    const headlineColor = useColorModeValue("gray.800", "whiteAlpha.900");

    const outlet = useMemo(() => NEWS_SOURCES[category]?.outlets?.[outletKey], [category, outletKey]);

    const fetchNews = useCallback(async () => {
        if (!outlet?.url) return;
        setLoading(true);
        try {
            // Use the provided proxy endpoint logic
            const proxyUrl = `${process.env.REACT_APP_API_URL}/api/news/proxy-news`;
            const res = await axios.get(proxyUrl, {
                params: { url: outlet.url }
            });

            // Backend now returns normalized JSON array
            const data = Array.isArray(res.data) ? res.data : [];

            const items = data.map((item) => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                description: item.description?.replace(/<[^>]*>?/gm, '') || "",
                thumbnail: item.image || DEFAULT_IMAGE,
                sourceLabel: outlet.label,
                sourceKey: outletKey
            }));

            setAllFetchedItems(prev => {
                const otherOutlets = prev.filter(p => p.sourceKey !== outletKey);
                return [...otherOutlets, ...items];
            });
        } catch (err) {
            console.error("RSS sync error:", err.message);
        } finally { setLoading(false); }
    }, [outlet, outletKey]);

    useEffect(() => { fetchNews(); }, [fetchNews]);

    const displayedItems = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        if (searchQuery.trim() === "") {
            return allFetchedItems.filter(item => item.sourceKey === outletKey);
        }
        return allFetchedItems.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.sourceLabel.toLowerCase().includes(lowerQuery)
        ).slice(0, 20);
    }, [allFetchedItems, searchQuery, outletKey]);

    return (
        <Box bg={cardBg} borderRadius="2xl" shadow="sm" border="1px solid" borderColor={borderColor}
            overflow="hidden" display="flex" flexDirection="column" h="full" maxH="100%">

            <Box
                p={4}
                borderBottom="1px solid"
                borderColor={borderColor}
                bgGradient="linear(to-r, blue.50, white)"
                zIndex={2}
            >
                <VStack align="stretch" spacing={4}>
                    <Flex justify="space-between" align="center">
                        <HStack spacing={3}>
                            <Flex p={2} bg="blue.500" borderRadius="lg" shadow="md" color="white" align="center" justify="center">
                                <Icon as={FaNewspaper} boxSize={4} />
                            </Flex>
                            <VStack align="start" spacing={0}>
                                <Heading size="sm" color="blue.800" textTransform="uppercase" letterSpacing="wider">News Center</Heading>
                                {loading && <Spinner size="xs" color="blue.500" mt={1} />}
                            </VStack>
                        </HStack>
                        <Select size="xs" variant="filled" maxW="130px" borderRadius="full" value={outletKey} onChange={(e) => setOutletKey(e.target.value)} bg="white">
                            {Object.entries(NEWS_SOURCES[category].outlets).map(([key, o]) => (
                                <option key={key} value={key}>{o.label}</option>
                            ))}
                        </Select>
                    </Flex>
                    <InputGroup size="sm">
                        <InputLeftElement><SearchIcon color="gray.400" /></InputLeftElement>
                        <Input
                            placeholder="Search all news..."
                            borderRadius="xl"
                            bg={useColorModeValue("gray.50", "gray.900")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            border="none"
                        />
                    </InputGroup>
                    <Tabs isFitted variant="unstyled" size="sm" index={category === "philippines" ? 0 : 1}
                        onChange={(i) => {
                            const newCat = i === 0 ? "philippines" : "global";
                            setCategory(newCat);
                            setOutletKey(Object.keys(NEWS_SOURCES[newCat].outlets)[0]);
                        }}>
                        <TabList bg={useColorModeValue("gray.100", "gray.900")} p={1} borderRadius="xl">
                            <Tab _selected={{ bg: cardBg, shadow: "sm", borderRadius: "lg", color: "blue.600" }} fontWeight="bold" fontSize="xs">PH News</Tab>
                            <Tab _selected={{ bg: cardBg, shadow: "sm", borderRadius: "lg", color: "blue.600" }} fontWeight="bold" fontSize="xs">Global</Tab>
                        </TabList>
                    </Tabs>
                </VStack>
            </Box>

            {/* 2. LIST AREA (With Scroll-to-Hide Fix) */}
            <Box
                flex="1"
                overflowY="auto"
                p={3}
                sx={{ '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: 'gray.200', borderRadius: '10px' } }}
            >
                {loading && displayedItems.length === 0 ? (
                    <Stack spacing={4}>{[1, 2, 3, 4, 5].map(i => (
                        <Flex key={i} gap={3} p={2}><Skeleton w="70px" h="70px" borderRadius="lg" /><Box flex={1}><SkeletonText noOfLines={3} spacing="2" /></Box></Flex>
                    ))}</Stack>
                ) : displayedItems.length > 0 ? (
                    <Stack spacing={3}>
                        {displayedItems.map((item, idx) => (
                            <Popover
                                key={`${item.sourceKey}-${idx}`}
                                trigger={popoverTrigger}
                                placement={popoverPlacement}
                                openDelay={250}
                                closeDelay={100}
                                isLazy
                                closeOnScroll={true}
                                closeOnBlur={true}
                            >
                                <PopoverTrigger>
                                    <Box cursor="pointer">
                                        <Flex gap={3} p={2} borderRadius="xl" transition="all 0.2s" align="center"
                                            _hover={{ bg: itemHoverBg, transform: "scale(1.01)" }} _active={{ transform: "scale(0.98)" }}>
                                            <Box w="70px" h="70px" borderRadius="xl" overflow="hidden" flexShrink={0} bg="gray.100">
                                                <Image src={item.thumbnail} w="full" h="full" objectFit="cover" fallbackSrc={DEFAULT_IMAGE} />
                                            </Box>
                                            <VStack align="start" spacing={0} flex={1}>
                                                <HStack justify="space-between" w="full" mb={1}>
                                                    <Badge colorScheme="blue" variant="outline" fontSize="8px" borderRadius="full" px={2}>{item.sourceLabel}</Badge>
                                                    <Text fontSize="2xs" color={textMuted}>{formatTimeAgo(item.pubDate)}</Text>
                                                </HStack>
                                                <Text fontWeight="bold" fontSize="xs" color={headlineColor} noOfLines={2} lineHeight="1.3">{item.title}</Text>
                                            </VStack>
                                        </Flex>
                                    </Box>
                                </PopoverTrigger>

                                <Portal>
                                    <PopoverContent
                                        w={{ base: "90vw", md: "320px" }}
                                        bg={popoverBg}
                                        shadow="2xl"
                                        borderRadius="2xl"
                                        border="none"
                                        overflow="hidden"
                                        zIndex={9999}
                                        _focus={{ outline: "none" }}
                                    >
                                        <Link href={item.link} isExternal _hover={{ textDecoration: "none" }}>
                                            <ScaleFade initialScale={0.95} in={true}>
                                                <Box h="180px" w="full" overflow="hidden">
                                                    <Image src={item.thumbnail} w="full" h="full" objectFit="cover" />
                                                </Box>
                                                <PopoverBody p={4} cursor="pointer">
                                                    <VStack align="start" spacing={2}>
                                                        <HStack w="full" justify="space-between">
                                                            <Badge colorScheme="blue" fontSize="9px">{item.sourceLabel}</Badge>
                                                            <Icon as={ExternalLinkIcon} boxSize={3} color="blue.500" />
                                                        </HStack>
                                                        <Text fontWeight="extrabold" fontSize="sm" lineHeight="short" color={headlineColor}>{item.title}</Text>
                                                        <Text fontSize="xs" color={textMuted} noOfLines={4}>{item.description}</Text>
                                                        <Divider pt={2} />
                                                        <Text fontSize="xs" color="blue.500" fontWeight="bold" textAlign="center" w="full">
                                                            CLICK TO READ MORE →
                                                        </Text>
                                                    </VStack>
                                                </PopoverBody>
                                            </ScaleFade>
                                        </Link>
                                    </PopoverContent>
                                </Portal>
                            </Popover>
                        ))}
                    </Stack>
                ) : (
                    <Flex direction="column" align="center" justify="center" py={20} opacity={0.6}><InfoOutlineIcon boxSize={8} mb={2} /><Text fontSize="sm">No results match.</Text></Flex>
                )}
            </Box>

            {/* 3. FOOTER */}
            <Box p={2} bg={useColorModeValue("gray.50", "gray.900")} textAlign="center" borderTop="1px solid" borderColor={borderColor}>
                <Text fontSize="9px" color={textMuted} fontWeight="bold" letterSpacing="widest">
                    {searchQuery ? "SEARCH ACTIVE" : `LIVE SYNC • ${outlet?.label.toUpperCase()}`}
                </Text>
            </Box>
        </Box>
    );
}
