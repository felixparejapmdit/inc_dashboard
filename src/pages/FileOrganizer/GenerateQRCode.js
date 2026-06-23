import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import { BsBoxSeam } from "react-icons/bs";
import {
  FaFileAlt,
  FaFolder,
  FaLayerGroup,
  FaPrint,
  FaQrcode,
} from "react-icons/fa";
import { jsPDF } from "jspdf";
import { QRCodeCanvas } from "qrcode.react";
import QRPrintToolbar from "../../components/FileOrganizer/QRPrintToolbar";
import QRItemCard from "../../components/FileOrganizer/QRItemCard";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";

const categoryMeta = {
  Shelves: {
    icon: FaLayerGroup,
    colorScheme: "teal",
    title: "Shelf QR codes",
    description: "Print labels for shelf-level storage areas.",
  },
  Containers: {
    icon: BsBoxSeam,
    colorScheme: "orange",
    title: "Container QR codes",
    description: "Print labels for boxes, bins, or storage containers.",
  },
  Folders: {
    icon: FaFolder,
    colorScheme: "yellow",
    title: "Folder QR codes",
    description: "Print labels for folders inside containers.",
  },
  Documents: {
    icon: FaFileAlt,
    colorScheme: "blue",
    title: "Document QR codes",
    description: "Print labels for individual uploaded documents.",
  },
};

const getItemName = (item) => item?.name || item?.title || `Item ${item?.id || ""}`;
const getQrCode = (item) => String(item?.generated_code || "").trim();

const filterItems = (source, term) => {
  const keyword = term.trim().toLowerCase();
  if (!keyword) return source;

  return source.filter((item) => {
    const name = getItemName(item).toLowerCase();
    const code = getQrCode(item).toLowerCase();
    return name.includes(keyword) || code.includes(keyword);
  });
};

const GenerateQRCode = () => {
  const toast = useToast();
  const printRef = useRef(null);

  const [category, setCategory] = useState(
    localStorage.getItem("qrCategory") || "Shelves"
  );
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const meta = categoryMeta[category] || categoryMeta.Shelves;

  const pageBg = useColorModeValue("#f6f8fb", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const headingColor = useColorModeValue("gray.900", "white");

  const selectableItems = useMemo(
    () => filteredItems.filter((item) => Boolean(getQrCode(item))),
    [filteredItems]
  );

  const selectedPrintableItems = useMemo(
    () =>
      selectedItems
        .map((id) => items.find((item) => String(item.id) === String(id)))
        .filter((item) => item && getQrCode(item)),
    [items, selectedItems]
  );

  const allPrintableSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) =>
      selectedItems.some((id) => String(id) === String(item.id))
    );

  useEffect(() => {
    loadCategoryData(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const loadCategoryData = async (cat) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getAllData(cat);
      const nextItems = Array.isArray(data) ? data : [];

      setItems(nextItems);
      setFilteredItems(filterItems(nextItems, searchTerm));
      setSelectedItems([]);
      localStorage.setItem("qrCategory", cat);
    } catch (error) {
      setItems([]);
      setFilteredItems([]);
      setSelectedItems([]);
      setErrorMessage(error.message || "Unable to load QR items.");
      toast({
        title: "Unable to load QR items",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setFilteredItems(filterItems(items, term));
  };

  const toggleItemSelection = (id) => {
    const selectedItem = items.find((item) => String(item.id) === String(id));
    if (!getQrCode(selectedItem)) return;

    setSelectedItems((prev) =>
      prev.some((itemId) => String(itemId) === String(id))
        ? prev.filter((itemId) => String(itemId) !== String(id))
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const printableIds = selectableItems.map((item) => item.id);

    setSelectedItems((prev) => {
      if (allPrintableSelected) {
        return prev.filter(
          (id) => !printableIds.some((printableId) => String(printableId) === String(id))
        );
      }

      return Array.from(
        new Set([...prev, ...printableIds].map((id) => String(id)))
      );
    });
  };

  const showNoSelectionToast = () => {
    toast({
      title: "Select at least one QR code",
      description: "Choose one or more printable items first.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDownloadPDF = async () => {
    if (selectedPrintableItems.length === 0) {
      showNoSelectionToast();
      return;
    }

    if (!printRef.current) return;

    const doc = new jsPDF();
    let y = 14;

    const canvases = printRef.current.querySelectorAll("canvas");
    const labels = printRef.current.querySelectorAll("strong");

    for (let i = 0; i < canvases.length; i += 1) {
      const canvas = canvases[i];
      const label = labels[i]?.innerText || `QR ${i + 1}`;

      try {
        const imgData = canvas.toDataURL("image/png");
        doc.setFontSize(12);
        doc.text(label, 12, y);
        doc.addImage(imgData, "PNG", 12, y + 5, 48, 48);
        y += 62;

        if (y > 250 && i < canvases.length - 1) {
          doc.addPage();
          y = 14;
        }
      } catch (err) {
        console.error("Failed to convert QR canvas to image:", err);
      }
    }

    doc.save(`${category.toLowerCase()}_qr_codes.pdf`);
  };

  const handlePrintSelected = () => {
    if (selectedPrintableItems.length === 0) {
      showNoSelectionToast();
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow || !printRef.current) return;

    const clonedContent = printRef.current.cloneNode(true);
    const originalCanvases = printRef.current.querySelectorAll("canvas");
    const clonedCanvases = clonedContent.querySelectorAll("canvas");

    clonedCanvases.forEach((canvas, index) => {
      try {
        const originalCanvas = originalCanvases[index];
        if (!originalCanvas) return;

        const image = new Image();
        image.src = originalCanvas.toDataURL("image/png");
        image.alt = "QR code";
        image.style.width = "145px";
        image.style.height = "145px";
        image.style.display = "block";
        image.style.margin = "0 auto 10px";
        canvas.parentNode.replaceChild(image, canvas);
      } catch (err) {
        console.error("QR canvas conversion failed", err);
      }
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Codes</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 18px;
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
              gap: 16px;
            }
            .qr-box {
              border: 1px solid #d7dee8;
              border-radius: 14px;
              padding: 14px;
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-box strong {
              display: block;
              font-size: 13px;
              margin-bottom: 8px;
            }
            .qr-box span {
              color: #64748b;
              display: block;
              font-size: 11px;
            }
          </style>
        </head>
        <body>${clonedContent.innerHTML}</body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 700);
  };

  return (
    <Box bg={pageBg} minH="100vh" mt={12} px={{ base: 3, md: 5 }} py={6} w="full">
      <Box w="full">
        <Flex
          align={{ base: "flex-start", lg: "center" }}
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="3xl"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.08)"
          direction={{ base: "column", lg: "row" }}
          gap={6}
          justify="space-between"
          p={{ base: 5, md: 8 }}
        >
          <HStack align="flex-start" spacing={4}>
            <Flex
              align="center"
              bg={`${meta.colorScheme}.50`}
              borderRadius="2xl"
              color={`${meta.colorScheme}.600`}
              h="58px"
              justify="center"
              w="58px"
            >
              <Icon as={FaQrcode} boxSize={7} />
            </Flex>
            <Box>
              <Badge borderRadius="full" colorScheme={meta.colorScheme} mb={3} px={3} py={1}>
                QR labels
              </Badge>
              <Heading color={headingColor} size="xl">
                Generate QR Codes
              </Heading>
              <Text color={mutedText} fontSize={{ base: "md", md: "lg" }} mt={2}>
                Select file organizer items, then print or download clean QR labels.
              </Text>
            </Box>
          </HStack>

          <Stack direction={{ base: "column", sm: "row" }} spacing={3} w={{ base: "100%", lg: "auto" }}>
            <Button
              colorScheme={meta.colorScheme}
              isDisabled={selectedPrintableItems.length === 0}
              leftIcon={<FaPrint />}
              onClick={handlePrintSelected}
              size="lg"
            >
              Print selected
            </Button>
            <Button
              colorScheme="blue"
              isDisabled={selectedPrintableItems.length === 0}
              leftIcon={<DownloadIcon />}
              onClick={handleDownloadPDF}
              size="lg"
              variant="outline"
            >
              Download PDF
            </Button>
          </Stack>
        </Flex>

        <Box mt={6}>
          <QRPrintToolbar
            category={category}
            search={searchTerm}
            selectableItems={selectableItems.length}
            selectedCount={selectedPrintableItems.length}
            setCategory={setCategory}
            setSearch={handleSearch}
            totalItems={filteredItems.length}
          />
        </Box>

        <Flex align="center" justify="space-between" mt={8} gap={4} flexWrap="wrap">
          <Box>
            <Heading color={headingColor} size="md">
              {meta.title}
            </Heading>
            <Text color={mutedText} fontSize="sm">
              {meta.description}
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              isDisabled={selectableItems.length === 0}
              onClick={handleSelectAll}
              variant="outline"
            >
              {allPrintableSelected ? "Deselect shown" : "Select printable"}
            </Button>
            <Button
              colorScheme="red"
              isDisabled={selectedPrintableItems.length === 0}
              onClick={() => setSelectedItems([])}
              variant="ghost"
            >
              Clear
            </Button>
          </HStack>
        </Flex>

        {loading ? (
          <Center minH="340px">
            <VStack spacing={4}>
              <Spinner color={`${meta.colorScheme}.500`} size="xl" />
              <Text color={mutedText}>Loading QR items...</Text>
            </VStack>
          </Center>
        ) : errorMessage ? (
          <Alert borderRadius="2xl" mt={5} status="error">
            <AlertIcon />
            {errorMessage}
          </Alert>
        ) : filteredItems.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} mt={5} spacing={5}>
            {filteredItems.map((item) => (
              <QRItemCard
                key={`${category}-${item.id}`}
                category={category}
                checked={selectedItems.some((id) => String(id) === String(item.id))}
                item={item}
                onToggle={() => toggleItemSelection(item.id)}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center
            bg={panelBg}
            border="1px dashed"
            borderColor={borderColor}
            borderRadius="2xl"
            flexDirection="column"
            mt={5}
            minH="300px"
            p={8}
            textAlign="center"
          >
            <Icon as={meta.icon} boxSize={10} color={`${meta.colorScheme}.400`} mb={4} />
            <Heading size="md">No QR items found</Heading>
            <Text color={mutedText} maxW="420px" mt={2}>
              {searchTerm
                ? "Try a different search word or QR code."
                : `No ${category.toLowerCase()} are available yet.`}
            </Text>
          </Center>
        )}

        <Box ref={printRef} display="none">
          {selectedPrintableItems.map((item) => (
            <div key={`${category}-print-${item.id}`} className="qr-box">
              <strong>{getItemName(item)}</strong>
              <QRCodeCanvas value={getQrCode(item)} size={148} includeMargin />
              <span>{getQrCode(item)}</span>
            </div>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default GenerateQRCode;
