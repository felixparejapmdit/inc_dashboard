import React from 'react';
import { Box, Text, Image, VStack, HStack, SimpleGrid } from "@chakra-ui/react";

const PrintableLokalProfile = ({ profile, innerRef }) => {
  if (!profile) return <div ref={innerRef} />;

  return (
    <Box ref={innerRef} p={8} fontFamily="Arial, sans-serif" bg="white" color="black" maxW="210mm" mx="auto">
      {/* Header with Organization Branding (Placeholder) */}
      <HStack justify="space-between" mb={6} borderBottom="2px solid" borderColor="teal.500" pb={4}>
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="widest">Profile Record</Text>
          <Text fontWeight="extrabold" fontSize="3xl" color="teal.700" lineHeight={1.2}>
            {profile.lokalName}
          </Text>
          <Text fontSize="lg" fontWeight="medium" color="gray.600">
            District of {profile.districtName}
          </Text>
        </VStack>
        <Box textAlign="right">
          <Text fontSize="sm" color="gray.400">Serial Number</Text>
          <Text fontWeight="bold" fontSize="xl">{profile.serialNumber || "N/A"}</Text>
        </Box>
      </HStack>

      <HStack align="start" spacing={8} mb={8}>
        {/* Main Image */}
        <Box flex="1" borderRadius="md" overflow="hidden" border="1px solid" borderColor="gray.200">
          <Image
            src={profile.imageUrl || ""}
            alt="Lokal Facade"
            w="100%"
            h="auto"
            maxH="300px"
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/600x400?text=No+Image+Available"
          />
        </Box>

        {/* Key Info Summary */}
        <VStack flex="1" align="stretch" spacing={3} p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold" color="teal.600" borderBottom="1px solid" borderColor="gray.200" pb={1}>Key Information</Text>
          <HStack justify="space-between">
            <Text color="gray.600">Anniversary:</Text>
            <Text fontWeight="medium">{profile.anniversary}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="gray.600">Seating Capacity:</Text>
            <Text fontWeight="medium">{profile.seatingCapacity}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="gray.600">Designated Minister:</Text>
            <Text fontWeight="medium">{profile.destinado}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text color="gray.600">Contact Number:</Text>
            <Text fontWeight="medium">{profile.destinadoContact}</Text>
          </HStack>
        </VStack>
      </HStack>

      {/* Detailed Grid */}
      <Box mb={8}>
        <Text fontWeight="bold" fontSize="lg" mb={3} color="teal.700">Operational Details</Text>
        <SimpleGrid columns={2} spacing={6}>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>FACILITIES</Text>
            <VStack align="start" spacing={1}>
              <Text><b>Internet Speed:</b> {profile.internetSpeed}</Text>
              <Text><b>LED Wall:</b> {profile.ledWall ? "Available" : "None"}</Text>
              <Text><b>Generator:</b> {profile.generator ? "Available" : "None"}</Text>
            </VStack>
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>CONTACTS</Text>
            <VStack align="start" spacing={1}>
              <Text><b>District Minister:</b> {profile.districtMinister}</Text>
              <Text><b>Contact:</b> {profile.ministerContact}</Text>
              <Text><b>District Chronicler:</b> {profile.districtChronicler}</Text>
              <Text><b>Contact:</b> {profile.chroniclerContact}</Text>
            </VStack>
          </Box>
          <Box>
            <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={1}>LOGISTICS</Text>
            <VStack align="start" spacing={1}>
              <Text><b>Distance from Central:</b> {profile.distanceFromCentral} km</Text>
              <Text><b>Travel Time:</b> {profile.travelTimeFromCentral}</Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Schedules */}
      <HStack align="start" spacing={10} mb={10}>
        <Box flex="1">
          <Text fontWeight="bold" color="teal.600" mb={2} borderBottom="1px solid" borderColor="teal.100">Midweek Schedule</Text>
          {["Tuesday", "Wednesday", "Thursday"].map((day) => (
            profile.scheduleMidweek?.[day] && (
              <HStack key={day} justify="space-between" py={1} borderBottom="1px dashed" borderColor="gray.100">
                <Text fontSize="sm" fontWeight="medium">{day}</Text>
                <Text fontSize="sm">{profile.scheduleMidweek[day]}</Text>
              </HStack>
            )
          ))}
        </Box>
        <Box flex="1">
          <Text fontWeight="bold" color="teal.600" mb={2} borderBottom="1px solid" borderColor="teal.100">Weekend Schedule</Text>
          {["Friday", "Saturday", "Sunday"].map((day) => (
            profile.scheduleWeekend?.[day] && (
              <HStack key={day} justify="space-between" py={1} borderBottom="1px dashed" borderColor="gray.100">
                <Text fontSize="sm" fontWeight="medium">{day}</Text>
                <Text fontSize="sm">{profile.scheduleWeekend[day]}</Text>
              </HStack>
            )
          ))}
        </Box>
      </HStack>

      {/* Footer */}
      <Box pt={4} borderTop="1px solid" borderColor="gray.300">
        <HStack justify="space-between" fontSize="xs" color="gray.500">
          <Text>Prepared By: {profile.preparedBy}</Text>
          <Text>Date Generated: {new Date().toLocaleDateString()}</Text>
        </HStack>
      </Box>
    </Box>
  );
};

export default PrintableLokalProfile;
