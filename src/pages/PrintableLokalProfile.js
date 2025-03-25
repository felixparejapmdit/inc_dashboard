import { Box, Text, Image, VStack, HStack } from "@chakra-ui/react";

const PrintableLokalProfile = ({ profile }) => {
  if (!profile) return null;

  return (
    <Box p={6} fontFamily="Arial">
      <HStack justify="space-between" mb={4}>
        <Box>
          <Text fontWeight="bold" fontSize="xl">
            Distrito:
          </Text>
          <Text>{profile.districtName}</Text>
          <Text fontWeight="bold" fontSize="xl">
            Lokal:
          </Text>
          <Text>{profile.lokalName}</Text>
        </Box>

        <Box>
          <Image
            src={profile.imageUrl || ""}
            alt="Lokal"
            boxSize="250px"
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/250x200?text=Lokal+Image"
          />
        </Box>
      </HStack>

      <VStack align="start" spacing={2}>
        <Text>
          <b>Anniversary:</b> {profile.anniversary}
        </Text>
        <Text>
          <b>Serial Number:</b> {profile.serialNumber}
        </Text>
        <Text>
          <b>Destinado:</b> {profile.destinado}
        </Text>
        <Text>
          <b>Contact:</b> {profile.destinadoContact}
        </Text>
        <Text>
          <b>District Chronicler:</b> {profile.districtChronicler}
        </Text>
        <Text>
          <b>Contact:</b> {profile.chroniclerContact}
        </Text>
        <Text>
          <b>District Minister:</b> {profile.districtMinister}
        </Text>
        <Text>
          <b>Contact:</b> {profile.ministerContact}
        </Text>
        <Text>
          <b>Seating Capacity:</b> {profile.seatingCapacity}
        </Text>
        <Text>
          <b>Distance from Central:</b> {profile.distanceFromCentral}
        </Text>
        <Text>
          <b>Travel Time:</b> {profile.travelTimeFromCentral}
        </Text>
        <Text>
          <b>Internet Speed:</b> {profile.internetSpeed}
        </Text>
        <Text>
          <b>LED Wall:</b> {profile.ledWall ? "Yes" : "No"}
        </Text>
        <Text>
          <b>Generator:</b> {profile.generator ? "Yes" : "No"}
        </Text>
        <Text>
          <b>Prepared By:</b> {profile.preparedBy}
        </Text>
        <Text>
          <b>Date:</b> {new Date(profile.datePrepared).toLocaleDateString()}
        </Text>
      </VStack>

      <Box mt={4}>
        <Text fontWeight="bold" color="green.600">
          Midweek Schedule
        </Text>
        {["Tuesday", "Wednesday", "Thursday"].map((day) => (
          <Text key={day}>
            {day}: {profile.scheduleMidweek?.[day] || "-"}
          </Text>
        ))}
      </Box>

      <Box mt={4}>
        <Text fontWeight="bold" color="green.600">
          Weekend Schedule
        </Text>
        {["Friday", "Saturday", "Sunday"].map((day) => (
          <Text key={day}>
            {day}: {profile.scheduleWeekend?.[day] || "-"}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default PrintableLokalProfile;
