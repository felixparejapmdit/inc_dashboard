import React from "react";
import { Box, Text, Checkbox, VStack } from "@chakra-ui/react";
import { QRCodeCanvas } from "qrcode.react"; // ✅ Correct import

const QRItemCard = ({ item, category, checked, onToggle }) => {
  const qrValue = `${item.generated_code}`;

  return (
   <Box
  className="qr-item"
  border="1px solid #ccc"
  p={4}
  borderRadius="md"
  bg="white"
  shadow="md"
>
  <VStack spacing={2}>
    <QRCodeCanvas value={qrValue} size={128} />
    <Text className="qr-title" fontWeight="bold" fontSize="sm">
      {item.name || `ID: ${item.id}`}
    </Text>
    <Checkbox isChecked={checked} onChange={onToggle}>
      Select
    </Checkbox>
  </VStack>
</Box>

  );
};

export default QRItemCard;
