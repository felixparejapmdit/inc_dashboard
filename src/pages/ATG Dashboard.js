// src/pages/ATG Dashboard.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Spacer,
  Avatar,
  Select,
  useToast,
  Link,
  Stack,
  Badge,
  VStack,
  HStack,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import {
  ExternalLinkIcon,
  SearchIcon,
  AddIcon,
  DownloadIcon,
  SmallCloseIcon,
} from "@chakra-ui/icons";

/**
 * ATG Dashboard (Option A)
 *
 * - News is a right-side fixed sidebar occupying ~15% width on large screens.
 * - Main content occupies remaining ~85%.
 * - Improved layout & styling, fixed search (debounced), pagination, responsive.
 * - Organization chart preview uses the provided local dev file path.
 *
 * Replace mock data with real API calls as needed.
 */

// Use the uploaded file path (dev-provided) as the default org-chart preview URL.
const ORG_CHART_DEFAULT = "/mnt/data/0e0e7ae3-1f8f-4a52-9fd4-c307403b494b.png";

const PAGE_SIZES = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 20;

/* ---------- Mock data (replace with API responses) ---------- */
const mockDirectory = Array.from({ length: 88 }).map((_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  department: ["PMD", "ATG", "EIS", "Video"][i % 4],
  phone: `+63 912 345 ${String(1000 + i).slice(-4)}`,
  email: `person${i + 1}@example.local`,
}));

const mockWebex = [
  {
    id: 1,
    title: "Daily Ops Sync",
    host: "Kuya Marcel",
    start: "2025-11-24 09:00",
    duration: "30m",
    joinUrl: "#",
  },
  {
    id: 2,
    title: "Weekly ATG Review",
    host: "Kuya Ruben",
    start: "2025-11-25 14:00",
    duration: "1h",
    joinUrl: "#",
  },
];

const mockSuguan = [
  { id: 1, name: "Suguan A", lokal: "Local 1", district: "District 1", phone: "+63 900 111 2222" },
  { id: 2, name: "Suguan B", lokal: "Local 2", district: "District 2", phone: "+63 900 222 3333" },
];

const mockATGFiles = [
  { id: 1, type: "Report", filename: "ATG_Suguan_Report_2025.pdf", date: "2025-11-01", url: "#" },
  { id: 2, type: "Memo", filename: "ATG_Memo_Transport.xlsx", date: "2025-10-25", url: "#" },
];

const mockNews = [
  { id: 1, title: "System Maintenance 27 Nov", author: "Admin", date: "2025-11-20", excerpt: "Planned maintenance at 02:00-04:00." },
  { id: 2, title: "New Video Streaming Guidelines", author: "Kuya Marcel", date: "2025-11-18", excerpt: "Guidelines for encoded content." },
];

/* ---------- Component ---------- */
export default function ATGDashboard() {
  const toast = useToast();

  // Directory state & search (debounced)
  const [directory] = useState(mockDirectory);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const searchDebounceRef = useRef(null);


  // Pagination
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);

  // Other sections
  const [webexMeetings] = useState(mockWebex);
  const [suguanList] = useState(mockSuguan);
  const [atgFiles, setAtgFiles] = useState(mockATGFiles);

  // News (right sidebar)
  const [newsList, setNewsList] = useState(mockNews);
  const [isAdminPosting, setIsAdminPosting] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState("");
  const [newNewsExcerpt, setNewNewsExcerpt] = useState("");

  // Org chart
  const [orgChartUrl, setOrgChartUrl] = useState(ORG_CHART_DEFAULT);

  /* ---------- Effects ---------- */
  // Debounce search input to update searchQuery
  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = window.setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
      setCurrentPage(1);
    }, 300); // 300ms debounce
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  // Derived: filtered directory based on searchQuery
  const filteredDirectory = useMemo(() => {
    if (!searchQuery) return directory;
    return directory.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery) ||
        d.department.toLowerCase().includes(searchQuery) ||
        d.phone.includes(searchQuery) ||
        d.email.toLowerCase().includes(searchQuery)
    );
  }, [directory, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredDirectory.length / pageSize));
  const paginatedDirectory = filteredDirectory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, searchQuery]);

  /* ---------- Handlers ---------- */
  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const handleDownloadFile = (file) => {
    toast({ title: "Download", description: `Downloading ${file.filename}`, status: "info", duration: 2000, isClosable: true });
    // Replace with actual download logic or window.open(file.url)
  };

  const handlePostNews = () => {
    if (!newNewsTitle.trim()) {
      toast({ title: "Title required", status: "warning", duration: 2000, isClosable: true });
      return;
    }
    const item = {
      id: Date.now(),
      title: newNewsTitle,
      author: "Admin",
      date: new Date().toISOString().slice(0, 10),
      excerpt: newNewsExcerpt,
    };
    setNewsList((s) => [item, ...s]);
    setNewNewsTitle("");
    setNewNewsExcerpt("");
    setIsAdminPosting(false);
    toast({ title: "News posted", status: "success", duration: 2000, isClosable: true });
  };

  const handleOrgChartUpload = (evt) => {
    const f = evt.target.files?.[0];
    if (!f) return;
    const localUrl = URL.createObjectURL(f);
    setOrgChartUrl(localUrl);
    toast({ title: "Uploaded", description: f.name, status: "success", duration: 2000, isClosable: true });
    // TODO: upload to backend and replace url with hosted link
  };

  /* ---------- Helpers: pagination rendering ---------- */
  const renderPageButtons = () => {
    const buttons = [];
    const total = pageCount;
    const cur = currentPage;

    const pushBtn = (n) =>
      buttons.push(
        <Button key={n} size="sm" colorScheme={cur === n ? "teal" : "gray"} onClick={() => setCurrentPage(n)}>
          {n}
        </Button>
      );

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pushBtn(i);
    } else {
      if (cur <= 4) {
        for (let i = 1; i <= 5; i++) pushBtn(i);
        buttons.push(<Text key="ell1" px={2}>...</Text>);
        pushBtn(total);
      } else if (cur >= total - 3) {
        pushBtn(1);
        buttons.push(<Text key="ell2" px={2}>...</Text>);
        for (let i = total - 4; i <= total; i++) pushBtn(i);
      } else {
        pushBtn(1);
        buttons.push(<Text key="ell3" px={2}>...</Text>);
        pushBtn(cur - 1);
        pushBtn(cur);
        pushBtn(cur + 1);
        buttons.push(<Text key="ell4" px={2}>...</Text>);
        pushBtn(total);
      }
    }

    return buttons;
  };

  /* ---------- Small UI helpers ---------- */
  const SectionHeader = ({ title, right }) => (
    <Flex align="center" mb={3}>
      <Heading size="md">{title}</Heading>
      <Spacer />
      {right}
    </Flex>
  );

  /* ---------- Return JSX ---------- */
  return (
    <Box bg="gray.50" minH="100vh" p={{ base: 4, md: 8 }}>
      <Flex align="center" mb={6} gap={4}>
        <Heading>ATG Dashboard</Heading>
        <Text color="gray.500" fontSize="sm">Overview • Directory • Meetings • Files</Text>
      </Flex>

      <Grid
        templateColumns={{ base: "1fr", lg: "85% 15%" }}
        gap={6}
        alignItems="start"
      >
        {/* ---------- MAIN COLUMN (85%) ---------- */}
        <GridItem>
          <Stack spacing={6}>
            {/* Directory + controls */}
            <Card>
              <CardHeader>
                <SectionHeader
                  title="Directory (Phone & Contacts)"
                  right={
                    <HStack spacing={3}>
                      <InputGroup size="sm" maxW="420px">
                        <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.400" />} />
                        <Input
                          placeholder="Search name, dept, phone, or email"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          bg="white"
                        />
                        {searchInput && (
                          <IconButton
                            aria-label="clear"
                            icon={<SmallCloseIcon />}
                            size="sm"
                            onClick={clearSearch}
                            ml={1}
                            variant="ghost"
                          />
                        )}
                      </InputGroup>

                    <Select
  size="sm"
  value={pageSize}
  onChange={(e) => setPageSize(Number(e.target.value))}
  maxW="120px"
>
  {PAGE_SIZES.map((s) => (
    <option key={s} value={s}>
      {s} / page
    </option>
  ))}
</Select>

                    </HStack>
                  }
                />
              </CardHeader>

              <CardBody>
                <Table size="sm" variant="simple">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th>Person</Th>
                      <Th>Department</Th>
                      <Th>Phone</Th>
                      <Th>Email</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {paginatedDirectory.map((p) => (
                      <Tr key={p.id} _hover={{ bg: "yellow.50" }}>
                        <Td>
                          <Flex align="center">
                            <Avatar name={p.name} size="sm" mr={3} />
                            <Box>
                              <Text fontWeight="semibold">{p.name}</Text>
                              <Text fontSize="xs" color="gray.600">ID: {p.id}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td><Text>{p.department}</Text></Td>
                        <Td><Text>{p.phone}</Text></Td>
                        <Td><Text>{p.email}</Text></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Pagination row */}
                <Flex justify="space-between" align="center" mt={4} wrap="wrap" gap={3}>
                  <Text fontSize="sm" color="gray.600">
                    Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredDirectory.length)} of {filteredDirectory.length} rows
                  </Text>

                  <Flex align="center" gap={2} wrap="wrap">
                    <Button size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      Previous
                    </Button>

                    {renderPageButtons()}

                    <Button size="sm" onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount}>
                      Next
                    </Button>
                  </Flex>
                </Flex>
              </CardBody>
            </Card>

            {/* Middle row: Webex, Suguan, Org Chart, Files (stacked nicely) */}
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <GridItem>
                <Stack spacing={6}>
                  {/* Webex */}
                  <Card>
                    <CardHeader>
                      <SectionHeader
                        title="Webex / Meetings"
                        right={<Button size="sm" leftIcon={<AddIcon />} onClick={() => toast({ title: "TODO add meeting", status: "info" })}>Add</Button>}
                      />
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {webexMeetings.map((m) => (
                          <Flex key={m.id} align="center" gap={3} p={2} borderRadius="md" _hover={{ bg: "gray.50" }}>
                            <Box>
                              <Text fontWeight="semibold">{m.title}</Text>
                              <Text fontSize="sm" color="gray.600">{m.host} • {m.start} • {m.duration}</Text>
                            </Box>
                            <Spacer />
                            <Link href={m.joinUrl} isExternal>
                              <Button size="sm" colorScheme="teal" rightIcon={<ExternalLinkIcon />}>Join</Button>
                            </Link>
                          </Flex>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Suguan (PMD) */}
                  <Card>
                    <CardHeader>
                      <SectionHeader title="Suguan (PMD Personnel)" right={<Text fontSize="sm" color="gray.600">Improved list</Text>} />
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {suguanList.map((s) => (
                          <Flex key={s.id} align="center" gap={3} p={2} borderRadius="md" _hover={{ bg: "gray.50" }}>
                            <Avatar name={s.name} size="sm" />
                            <Box>
                              <Text fontWeight="semibold">{s.name}</Text>
                              <Text fontSize="sm" color="gray.600">{s.lokal} • {s.district}</Text>
                            </Box>
                            <Spacer />
                            <Text fontSize="sm">{s.phone}</Text>
                          </Flex>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </Stack>
              </GridItem>

              <GridItem>
                <Stack spacing={6}>
                  {/* Organization Chart */}
                  <Card>
                    <CardHeader>
                      <SectionHeader
                        title="Organization Chart"
                        right={
                          <HStack>
                            <Input type="file" accept=".pdf,.png,.jpg" size="sm" onChange={handleOrgChartUpload} display="none" id="org-upload" />
                            <Button as="label" htmlFor="org-upload" size="sm">Upload</Button>
                            <Button size="sm" onClick={() => { setOrgChartUrl(ORG_CHART_DEFAULT); toast({ title: "Reset", status: "info", duration: 1000 }); }}>Reset</Button>
                          </HStack>
                        }
                      />
                    </CardHeader>
                    <CardBody>
                      <Box borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.100">
                        {orgChartUrl?.toLowerCase().endsWith(".pdf") ? (
                          <Flex align="center" justify="center" p={6}>
                            <Link href={orgChartUrl} isExternal><Button leftIcon={<DownloadIcon />}>Open Organization Chart (PDF)</Button></Link>
                          </Flex>
                        ) : (
                          <img src={orgChartUrl} alt="Organization Chart" style={{ width: "100%", display: "block", maxHeight: 320, objectFit: "contain" }} />
                        )}
                      </Box>
                      <Text fontSize="sm" mt={2} color="gray.600">Preview uses the local dev file path or uploaded image.</Text>
                    </CardBody>
                  </Card>

                  {/* ATG Suguan Files */}
                  <Card>
                    <CardHeader>
                      <SectionHeader title="ATG Suguan - Files" right={<Button size="sm" leftIcon={<AddIcon />} onClick={() => toast({ title: "TODO add file", status: "info" })}>Upload</Button>} />
                    </CardHeader>
                    <CardBody>
                      <Table size="sm" variant="simple">
                        <Thead bg="gray.100">
                          <Tr>
                            <Th>Type</Th>
                            <Th>File</Th>
                            <Th>Date</Th>
                            <Th>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {atgFiles.map((f) => (
                            <Tr key={f.id} _hover={{ bg: "yellow.50" }}>
                              <Td><Badge colorScheme="purple">{f.type}</Badge></Td>
                              <Td><Text fontWeight="semibold">{f.filename}</Text></Td>
                              <Td>{f.date}</Td>
                              <Td>
                                <Button size="sm" onClick={() => handleDownloadFile(f)} leftIcon={<DownloadIcon />}>Download</Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                </Stack>
              </GridItem>
            </Grid>
          </Stack>
        </GridItem>

        {/* ---------- RIGHT SIDEBAR (15%) - NEWS ---------- */}
        <GridItem>
          <Box position={{ lg: "sticky" }} top={{ lg: 20 }} alignSelf="start">
            <Card boxShadow="md" borderRadius="md">
              <CardHeader>
                <Flex align="center" gap={3}>
                  <Heading size="sm">News</Heading>
                  <Spacer />
                  <Text fontSize="xs" color="gray.500">Daily / Weekly</Text>
                </Flex>
              </CardHeader>

              <CardBody>
                <VStack spacing={3} align="stretch">
                  {/* Admin post area (collapsible) */}
                  {isAdminPosting ? (
                    <Box p={2} bg="gray.50" borderRadius="md">
                      <Input placeholder="Title" mb={2} size="sm" value={newNewsTitle} onChange={(e) => setNewNewsTitle(e.target.value)} />
                      <Input placeholder="Short excerpt" mb={2} size="sm" value={newNewsExcerpt} onChange={(e) => setNewNewsExcerpt(e.target.value)} />
                      <HStack>
                        <Button size="sm" colorScheme="teal" onClick={handlePostNews}>Publish</Button>
                        <Button size="sm" onClick={() => setIsAdminPosting(false)}>Cancel</Button>
                      </HStack>
                    </Box>
                  ) : (
                    <Button size="sm" leftIcon={<AddIcon />} onClick={() => setIsAdminPosting(true)}>Post News</Button>
                  )}

                  <Divider />

                  {/* News list - scrollable if long */}
                  <VStack spacing={2} align="stretch" maxH={{ lg: "60vh" }} overflowY="auto" pr={2}>
                    {newsList.map((n) => (
                      <Box key={n.id} p={2} bg="white" borderRadius="md" boxShadow="sm">
                        <Text fontWeight="bold" fontSize="sm">{n.title}</Text>
                        <Text fontSize="xs" color="gray.500">{n.author} • {n.date}</Text>
                        <Text fontSize="sm" mt={1}>{n.excerpt}</Text>
                        <HStack mt={2} justify="space-between">
                          <Link href="#" fontSize="xs">Read more <ExternalLinkIcon mx="2px" /></Link>
                          <Text fontSize="xs" color="gray.400">ID {n.id}</Text>
                        </HStack>
                      </Box>
                    ))}
                    {newsList.length === 0 && <Text color="gray.500">No news posted yet.</Text>}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </GridItem>
      </Grid>

      <Box mt={8} textAlign="center" color="gray.500">
        <Text fontSize="sm">This is a responsive ATG Dashboard template. Replace mock data with your APIs and endpoints.</Text>
      </Box>
    </Box>
  );
}
