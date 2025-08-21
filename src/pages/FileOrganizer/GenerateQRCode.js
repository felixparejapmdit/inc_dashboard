// src/pages/FileOrganizer/GenerateQRCode.js
import {
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import QRPrintToolbar from "../../components/FileOrganizer/QRPrintToolbar";
import QRItemCard from "../../components/FileOrganizer/QRItemCard";
import { getAllData } from "../../utils/FileOrganizer/globalSearchService";
import { jsPDF } from "jspdf";

const GenerateQRCode = () => {
  const toast = useToast();
  const printRef = useRef();

  // ✅ State
  const [category, setCategory] = useState(
    localStorage.getItem("qrCategory") || "Shelves"
  );
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Load data whenever category changes
  useEffect(() => {
    loadCategoryData(category);
  }, [category]);

  const loadCategoryData = async (cat) => {
    try {
      const data = await getAllData(cat);
      setItems(data);
      setFilteredItems(data);
      setSelectedItems([]);
      localStorage.setItem("qrCategory", cat);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    }
  };

  // ✅ Search filter
  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = items.filter((item) =>
      (item.name || item.title || "")
        .toLowerCase()
        .includes(term.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  // ✅ Toggle selection
  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ✅ Select / Deselect all
  const handleSelectAll = () => {
    const allFilteredIds = filteredItems.map((item) => item.id);
    const allSelected = allFilteredIds.every((id) =>
      selectedItems.includes(id)
    );
    setSelectedItems(allSelected ? [] : allFilteredIds);
  };

  // ✅ Download selected QR as PDF
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    const doc = new jsPDF();
    let y = 10;

    const canvases = printRef.current.querySelectorAll("canvas");
    const labels = printRef.current.querySelectorAll("strong");

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      const label = labels[i]?.innerText || `QR ${i + 1}`;

      try {
        const imgData = canvas.toDataURL("image/png");
        doc.text(label, 10, y);
        doc.addImage(imgData, "PNG", 10, y + 5, 50, 50);
        y += 60;

        if (y > 250 && i < canvases.length - 1) {
          doc.addPage();
          y = 10;
        }
      } catch (err) {
        console.error("Failed to convert canvas to image:", err);
      }
    }

    doc.save("selected_qr_codes.pdf");
  };

  // ✅ Print selected QR codes
  const handlePrintSelected = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");

    if (!printWindow || !printRef.current) return;

    const clonedContent = printRef.current.cloneNode(true);

    // Remove unwanted elements
    const unwantedElements = clonedContent.querySelectorAll(
      "*:not(canvas):not(p):not(span):not(div):not(strong)"
    );
    unwantedElements.forEach((el) => el.remove());

    // Replace canvases with images
    const originalCanvases = printRef.current.querySelectorAll("canvas");
    const clonedCanvases = clonedContent.querySelectorAll("canvas");

    clonedCanvases.forEach((canvas, index) => {
      try {
        const originalCanvas = originalCanvases[index];
        if (!originalCanvas) return;

        const image = new Image();
        image.src = originalCanvas.toDataURL("image/png");
        image.style.display = "block";
        image.style.margin = "auto";
        image.style.width = "150px";
        image.style.height = "150px";

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
            body {
              font-family: sans-serif;
              padding: 20px;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 30px;
            }
            .qr-box {
              text-align: center;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .qr-box img {
              width: 30%;
              height: auto;
              display: block;
              margin: 10px auto;
            }
            .qr-box p,
            .qr-box span,
            .qr-box strong {
              font-size: 14px;
              font-weight: bold;
              margin: 5px 0 0 0;
            }
            @media print {
              body {
                padding: 10mm;
                gap: 20px;
              }
              .qr-box {
                page-break-inside: avoid;
              }
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
    <Box p={8} mt={12}>
      <Heading size="lg" mb={4}>
        Generate QR Codes
      </Heading>

      <QRPrintToolbar
        category={category}
        setCategory={setCategory}
        search={searchTerm}
        setSearch={handleSearch}
        onDownloadPDF={handleDownloadPDF}
      />

      <HStack mt={4} spacing={4} flexWrap="wrap">
        <Button variant="outline" onClick={handleSelectAll}>
          {filteredItems.every((item) => selectedItems.includes(item.id))
            ? "Deselect All"
            : "Select All"}
        </Button>
        <Button colorScheme="red" onClick={() => setSelectedItems([])}>
          Clear Selection
        </Button>
      </HStack>

      <SimpleGrid mt={6} columns={[1, 2, 3, 4]} spacing={6}>
        {filteredItems.map((item) => (
          <QRItemCard
            key={item.id}
            item={item}
            category={category}
            checked={selectedItems.includes(item.id)}
            onToggle={() => toggleItemSelection(item.id)}
          />
        ))}
      </SimpleGrid>

      {selectedItems.length > 0 && (
        <>
          <Stack direction="row" spacing={4} mt={8}>
            <Button colorScheme="teal" onClick={handlePrintSelected}>
              Print Selected
            </Button>
            <Button colorScheme="blue" onClick={handleDownloadPDF}>
              Download as PDF
            </Button>
          </Stack>

          {/* Hidden print container */}
          <Box ref={printRef} display="none">
            {selectedItems.map((id) => {
              const item = items.find((i) => i.id === id);
              return (
                <div key={id} className="qr-box">
                  <strong>{item.name || item.title}</strong>
                  <div>
                    <QRItemCard
                      item={item}
                      category={category}
                      checked={true}
                      onToggle={() => {}}
                    />
                  </div>
                </div>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
};

export default GenerateQRCode;
