import React from "react";
import {
  Badge,
  Box,
  Checkbox,
  Flex,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { BsBoxSeam } from "react-icons/bs";
import { FaFileAlt, FaFolder, FaLayerGroup, FaQrcode } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

const categoryMeta = {
  Shelves: { icon: FaLayerGroup, colorScheme: "teal", label: "Shelf" },
  Containers: { icon: BsBoxSeam, colorScheme: "orange", label: "Container" },
  Folders: { icon: FaFolder, colorScheme: "yellow", label: "Folder" },
  Documents: { icon: FaFileAlt, colorScheme: "blue", label: "Document" },
};

const QRItemCard = ({ item, category, checked, onToggle }) => {
  const meta = categoryMeta[category] || categoryMeta.Documents;
  const qrValue = String(item?.generated_code || "").trim();
  const hasCode = Boolean(qrValue);
  const itemName = item?.name || item?.title || `Item ${item?.id || ""}`;

  const cardBg = useColorModeValue("white", "gray.800");
  const mutedBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue(
    checked ? `${meta.colorScheme}.300` : "gray.200",
    checked ? `${meta.colorScheme}.500` : "gray.700"
  );
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const textColor = useColorModeValue("gray.900", "white");

  return (
    <Box
      className="qr-item"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      boxShadow={checked ? "0 20px 45px rgba(15, 118, 110, 0.16)" : "sm"}
      opacity={hasCode ? 1 : 0.72}
      p={4}
      transition="all 0.2s ease"
      _hover={{ transform: hasCode ? "translateY(-2px)" : "none", boxShadow: "md" }}
    >
      <VStack align="stretch" spacing={4}>
        <Flex align="center" justify="space-between" gap={3}>
          <Flex
            align="center"
            bg={`${meta.colorScheme}.50`}
            borderRadius="xl"
            color={`${meta.colorScheme}.600`}
            h="42px"
            justify="center"
            w="42px"
          >
            <Icon as={meta.icon} boxSize={5} />
          </Flex>
          <Badge borderRadius="full" colorScheme={hasCode ? meta.colorScheme : "gray"} px={3} py={1}>
            {hasCode ? qrValue : "No code"}
          </Badge>
        </Flex>

        <Flex align="center" justify="center" bg={mutedBg} borderRadius="2xl" minH="164px" p={4}>
          {hasCode ? (
            <QRCodeCanvas value={qrValue} size={140} includeMargin />
          ) : (
            <VStack color={mutedText} spacing={2}>
              <Icon as={FaQrcode} boxSize={8} />
              <Text fontSize="sm" fontWeight="700">
                QR code unavailable
              </Text>
            </VStack>
          )}
        </Flex>

        <Box minH="46px">
          <Text className="qr-title" color={textColor} fontWeight="800" fontSize="sm" noOfLines={2}>
            {itemName}
          </Text>
          <Text color={mutedText} fontSize="xs" mt={1}>
            {meta.label}
          </Text>
        </Box>

        <Checkbox
          colorScheme={meta.colorScheme}
          isChecked={checked}
          isDisabled={!hasCode}
          onChange={onToggle}
        >
          Select for print
        </Checkbox>
      </VStack>
    </Box>
  );
};

export default QRItemCard;
