import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({ name: "", image_url: "" });
  const [editingSection, setEditingSection] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/sections`
      );
      setSections(response.data);
    } catch (error) {
      toast({
        title: "Error loading sections",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddSection = async () => {
    try {
      await axios.post("/api/sections", newSection);
      fetchSections();
      setNewSection({ name: "", image_url: "" });
      toast({
        title: "Section added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateSection = async () => {
    try {
      await axios.put(`/api/sections/${editingSection.id}`, editingSection);
      fetchSections();
      setEditingSection(null);
      toast({
        title: "Section updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteSection = async (id) => {
    try {
      await axios.delete(`/api/sections/${id}`);
      fetchSections();
      toast({
        title: "Section deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting section",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Box p={5}>
      <Stack spacing={4}>
        <Flex>
          <Input
            placeholder="Section Name"
            value={newSection.name}
            onChange={(e) =>
              setNewSection({ ...newSection, name: e.target.value })
            }
            mr={2}
          />
          <Input
            placeholder="Image URL"
            value={newSection.image_url}
            onChange={(e) =>
              setNewSection({ ...newSection, image_url: e.target.value })
            }
            mr={2}
          />
          <Button onClick={handleAddSection} colorScheme="blue">
            Add Section
          </Button>
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Image URL</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sections.map((section) => (
              <Tr key={section.id}>
                <Td>
                  {editingSection && editingSection.id === section.id ? (
                    <Input
                      value={editingSection.name}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    section.name
                  )}
                </Td>
                <Td>
                  {editingSection && editingSection.id === section.id ? (
                    <Input
                      value={editingSection.image_url}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          image_url: e.target.value,
                        })
                      }
                    />
                  ) : (
                    section.image_url
                  )}
                </Td>
                <Td>
                  {editingSection && editingSection.id === section.id ? (
                    <Button
                      onClick={handleUpdateSection}
                      colorScheme="green"
                      mr={2}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingSection(section)}
                      colorScheme="yellow"
                      mr={2}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteSection(section.id)}
                    colorScheme="red"
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Stack>
    </Box>
  );
};

export default SectionManagement;
