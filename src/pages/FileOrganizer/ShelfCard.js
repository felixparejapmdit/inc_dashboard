// src/pages/FileOrganizer/ShelfCard.jsx
import React from "react";
import {
  Box,
  Text,
  VStack,
  ScaleFade,
  useColorModeValue,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";

const ShelfCard = ({ shelf }) => {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");

  return (
    <ScaleFade in={true} initialScale={0.95}>
      <Box
        borderWidth="1px"
        borderColor={border}
        borderRadius="xl"
        p={6}
        boxShadow="lg"
        bg={bg}
        _hover={{ transform: "scale(1.02)", transition: "0.3s" }}
        textAlign="center"
        minH="260px"
      >
        <VStack spacing={3}>
          <Text fontWeight="bold" fontSize="xl" color="teal.600">
            {shelf.name}
          </Text>

          {shelf.description && (
            <>
              <Divider />
              <Text fontSize="sm" color="gray.500">
                {shelf.description}
              </Text>
            </>
          )}

          <Tooltip label={`Code: ${shelf.generated_code}`} placement="top">
            <Box border="1px solid #ddd" p={2} borderRadius="md" mt={4}>
              <QRCodeSVG
                value={shelf.generated_code}
                size={120}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
            </Box>
          </Tooltip>
        </VStack>
      </Box>
    </ScaleFade>
  );
};

export default ShelfCard;
