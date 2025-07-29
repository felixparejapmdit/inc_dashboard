import {
  Box,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useToast,
  VStack,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Select,
  Input,
  FormLabel,
  Checkbox,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import axios from "axios";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import PrintableLokalProfile from "./PrintableLokalProfile"; // Make sure this path is correct
import { FiPrinter } from "react-icons/fi";

import { fetchData, postData, putData, deleteData } from "../utils/fetchData";

const API_URL = process.env.REACT_APP_API_URL;
const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;

const LokalProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [localCongregations, setLocalCongregations] = useState([]);
  const [formData, setFormData] = useState({
    district: "",
    lokal: "",
    anniversary: "",
    serialNumber: "",
    destinado: "",
    destinadoContact: "",
    districtChronicler: "",
    chroniclerContact: "",
    districtMinister: "",
    ministerContact: "",
    seatingCapacity: "",
    distanceFromCentral: "",
    travelTimeFromCentral: "",
    internetSpeed: "",
    ledWall: false,
    generator: false,
    preparedBy: "",
    signature: "",
    datePrepared: new Date().toISOString().substr(0, 10),
    scheduleMidweek: {
      Tuesday: "",
      Wednesday: "",
      Thursday: "",
    },
    scheduleWeekend: {
      Friday: "",
      Saturday: "",
      Sunday: "",
    },
  });

  const toast = useToast();
  const [profileToPrint, setProfileToPrint] = useState(null);
  const printRef = useRef(null); // important: start as null

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Lokal_Profile_Summary",
  });

  useEffect(() => {
    if (profileToPrint) {
      // small timeout allows the PrintableLokalProfile to render in the DOM before printing
      setTimeout(() => {
        handlePrint();
      }, 100);
    }
  }, [profileToPrint]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/lokal_profiles`);
      setProfiles(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not fetch profiles.",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [districtRes, lokalRes] = await Promise.all([
        axios.get(`${DISTRICT_API_URL}/api/districts`),
        axios.get(`${LOCAL_CONGREGATION_API_URL}/api/all-congregations`),
      ]);
      setDistricts(districtRes.data);
      setLocalCongregations(lokalRes.data);
    } catch (error) {
      console.warn("Warning: Failed to fetch district/lokal info", error);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchDropdowns();
  }, []);

  const openModal = (profile = null) => {
    setEditProfile(profile);
    setFormData(
      profile || {
        district: "",
        lokal: "",
        anniversary: "",
        serialNumber: "",
        destinado: "",
        destinadoContact: "",
        districtChronicler: "",
        chroniclerContact: "",
        districtMinister: "",
        ministerContact: "",
        seatingCapacity: "",
        distanceFromCentral: "",
        travelTimeFromCentral: "",
        internetSpeed: "",
        ledWall: false,
        generator: false,
        preparedBy: "",
        signature: "",
        datePrepared: new Date().toISOString().substr(0, 10),
        scheduleMidweek: {},
        scheduleWeekend: {},
      }
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProfile(null);
  };

  const handleSave = async () => {
    try {
      if (editProfile) {
        await axios.put(
          `${API_URL}/api/lokal_profiles/${editProfile.id}`,
          formData
        );
        toast({ title: "Updated", status: "success" });
      } else {
        await axios.post(`${API_URL}/api/lokal_profiles`, formData);
        toast({ title: "Created", status: "success" });
      }
      fetchProfiles();
      closeModal();
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this profile?")) return;
    try {
      await axios.delete(`${API_URL}/api/lokal_profiles/${id}`);
      fetchProfiles();
      toast({ title: "Deleted", status: "info" });
    } catch (err) {
      toast({ title: "Error deleting profile", status: "error" });
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Box p={6} bg="gray.50" minH="100vh">
        <HStack justify="space-between" mb={4}>
          <Heading size="lg">Lokal Profiles</Heading>
          <HStack spacing={3}>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="teal"
              onClick={() => openModal()}
            >
              Add New
            </Button>
          </HStack>
        </HStack>

        {loading ? (
          <Spinner size="lg" />
        ) : (
          <Table variant="simple" colorScheme="gray">
            <Thead bg="gray.100">
              <Tr>
                <Th>#</Th>
                <Th>District</Th>
                <Th>Lokal</Th>
                <Th>Serial No</Th>
                <Th>Prepared By</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {profiles.map((profile, index) => (
                <Tr key={profile.id}>
                  <Td>{index + 1}</Td>
                  <Td>
                    {districts.find((d) => d.id === profile.district)?.name ||
                      "N/A"}
                  </Td>
                  <Td>
                    {localCongregations.find((l) => l.id === profile.lokal)
                      ?.name || "N/A"}
                  </Td>

                  <Td>{profile.serialNumber}</Td>
                  <Td>{profile.preparedBy}</Td>
                  <Td>{new Date(profile.datePrepared).toLocaleDateString()}</Td>
                  <Td>
                    <HStack>
                      <IconButton
                        icon={<EditIcon />}
                        onClick={() => openModal(profile)}
                        aria-label="Edit"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => handleDelete(profile.id)}
                        aria-label="Delete"
                      />
                      <IconButton
                        icon={<FiPrinter />}
                        colorScheme="teal"
                        aria-label="Print"
                        onClick={() => {
                          // Set profile only — let useEffect handle printing
                          setProfileToPrint({
                            ...profile,
                            districtName: districts.find(
                              (d) => d.id === profile.district
                            )?.name,
                            lokalName: localCongregations.find(
                              (l) => l.id === profile.lokal
                            )?.name,
                          });
                        }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        <Modal isOpen={isModalOpen} onClose={closeModal} size="6xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editProfile ? "Edit" : "Add"} Lokal Profile
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box display="flex" flexWrap="wrap" gap={6}>
                {/* LEFT COLUMN */}
                <VStack flex="1" spacing={4} align="stretch">
                  <Box>
                    <FormLabel>District</FormLabel>
                    <Select
                      placeholder="Select District"
                      value={formData.district}
                      onChange={(e) => {
                        const districtId = parseInt(e.target.value);
                        setFormData({
                          ...formData,
                          district: districtId,
                          lokal: "",
                        });
                      }}
                    >
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <FormLabel>Lokal</FormLabel>
                    <Select
                      placeholder="Select Lokal"
                      value={formData.lokal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lokal: parseInt(e.target.value),
                        })
                      }
                      isDisabled={!formData.district}
                    >
                      {localCongregations
                        .filter((l) => l.district_id === formData.district)
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                    </Select>
                  </Box>
                  {/* Lokal Image Upload with Preview */}
                  <Box
                    border="2px dashed #ccc"
                    borderRadius="md"
                    w="100%"
                    h="260px"
                    bg="gray.100"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    cursor="pointer"
                    onClick={() =>
                      document.getElementById("image-upload").click()
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleImageUpload(file);
                    }}
                  >
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Uploaded"
                        style={{
                          maxHeight: "100%",
                          maxWidth: "100%",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      <Text color="gray.500">
                        Click or Drag & Drop an image here
                      </Text>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </Box>

                  <Input
                    placeholder="Seating Capacity"
                    type="number"
                    value={formData.seatingCapacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seatingCapacity: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Distance from Central"
                    value={formData.distanceFromCentral}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        distanceFromCentral: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Travel Time from Central"
                    value={formData.travelTimeFromCentral}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        travelTimeFromCentral: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="Internet Speed"
                    value={formData.internetSpeed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        internetSpeed: e.target.value,
                      })
                    }
                  />

                  <HStack>
                    <Checkbox
                      isChecked={formData.ledWall}
                      onChange={(e) =>
                        setFormData({ ...formData, ledWall: e.target.checked })
                      }
                    >
                      LED Wall
                    </Checkbox>
                    <Checkbox
                      isChecked={formData.generator}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          generator: e.target.checked,
                        })
                      }
                    >
                      Generator
                    </Checkbox>
                  </HStack>
                </VStack>

                {/* RIGHT COLUMN */}
                <VStack flex="1" spacing={4} align="stretch">
                  <Input
                    placeholder="Anniversary"
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) =>
                      setFormData({ ...formData, anniversary: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Serial Number"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, serialNumber: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Destinado"
                    value={formData.destinado}
                    onChange={(e) =>
                      setFormData({ ...formData, destinado: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Destinado Contact"
                    value={formData.destinadoContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destinadoContact: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="District Chronicler"
                    value={formData.districtChronicler}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        districtChronicler: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Chronicler Contact"
                    value={formData.chroniclerContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chroniclerContact: e.target.value,
                      })
                    }
                  />

                  <Input
                    placeholder="District Minister"
                    value={formData.districtMinister}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        districtMinister: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Minister Contact"
                    value={formData.ministerContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ministerContact: e.target.value,
                      })
                    }
                  />

                  {/* Midweek Schedule Fields */}
                  <Box>
                    <FormLabel color="green.600">
                      Midweek{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </FormLabel>
                    {["Tuesday", "Wednesday", "Thursday"].map((day) => (
                      <Box key={day} mb={2}>
                        <FormLabel fontSize="sm" mb={1}>
                          {day}
                        </FormLabel>
                        <Input
                          placeholder="e.g. 6:00am, 7:00pm"
                          value={formData.scheduleMidweek[day]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduleMidweek: {
                                ...formData.scheduleMidweek,
                                [day]: e.target.value,
                              },
                            })
                          }
                        />
                      </Box>
                    ))}
                  </Box>

                  {/* Weekend Schedule Fields */}
                  <Box>
                    <FormLabel color="green.600">
                      Weekend{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </FormLabel>
                    {["Friday", "Saturday", "Sunday"].map((day) => (
                      <Box key={day} mb={2}>
                        <FormLabel fontSize="sm" mb={1}>
                          {day}
                        </FormLabel>
                        <Input
                          placeholder="e.g. 6:00am, 7:00pm"
                          value={formData.scheduleWeekend[day]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduleWeekend: {
                                ...formData.scheduleWeekend,
                                [day]: e.target.value,
                              },
                            })
                          }
                        />
                      </Box>
                    ))}
                  </Box>

                  <Input
                    placeholder="Prepared By"
                    value={formData.preparedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, preparedBy: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Signature"
                    value={formData.signature}
                    onChange={(e) =>
                      setFormData({ ...formData, signature: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    value={formData.datePrepared}
                    onChange={(e) =>
                      setFormData({ ...formData, datePrepared: e.target.value })
                    }
                  />
                </VStack>
              </Box>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="teal" mr={3} onClick={handleSave}>
                Save
              </Button>
              <Button onClick={closeModal}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <div style={{ display: "none" }}>
          <div ref={printRef}>
            {profileToPrint && (
              <PrintableLokalProfile profile={profileToPrint} />
            )}
          </div>
        </div>
      </Box>
    </>
  );
};

export default LokalProfile;
