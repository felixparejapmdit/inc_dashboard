import React, { useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Text,
  Button,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";

const QRCodeModal = ({ isOpen, onClose, title, code, name }) => {
  const qrRef = useRef(null);

  const handleDownloadPNG = () => {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngFile;
      downloadLink.download = `${name || "qr-code"}.png`;
      downloadLink.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const svgElement = qrRef.current.innerHTML;
    printWindow.document.write(`
      <html>
        <head><title>Print QR Code</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
          ${svgElement}
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" overflow="hidden">
        <ModalHeader textAlign="center" fontWeight="bold" fontSize="lg">
          {title || `QR Code`}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {/* QR Image */}
          <Box
            ref={qrRef}
            display="flex"
            justifyContent="center"
            p={4}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
            mb={4}
            bg="white"
          >
            <QRCodeSVG
              value={code}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </Box>

          {/* Generated Code */}
          <Box
            textAlign="center"
            p={3}
            border="1px dashed"
            borderColor="gray.300"
            borderRadius="md"
            bg="gray.50"
          >
            <Text fontSize="sm" color="gray.600" mb={2}>
              Generated Code
            </Text>
            <Text
              fontSize="md"
              fontWeight="semibold"
              color="gray.800"
              wordBreak="break-all"
            >
              {code}
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button mr={3} onClick={handleDownloadPNG} colorScheme="blue">
            Download PNG
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default QRCodeModal;
