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

const SubsectionManagement = () => {
  const [subsections, setSubsections] = useState([]);
  const [newSubsection, setNewSubsection] = useState({
    name: "",
    department_id: "",
    section_id: "",
    image_url: "",
  });
  const [editingSubsection, setEditingSubsection] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchSubsections();
  }, []);

  const fetchSubsections = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subsections`
      );
      setSubsections(response.data);
    } catch (error) {
      toast({
        title: "Error loading subsections",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddSubsection = async () => {
    try {
      await axios.post("/api/subsections", newSubsection);
      fetchSubsections();
      setNewSubsection({
        name: "",
        department_id: "",
        section_id: "",
        image_url: "",
      });
      toast({
        title: "Subsection added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateSubsection = async () => {
    try {
      await axios.put(
        `/api/subsections/${editingSubsection.id}`,
        editingSubsection
      );
      fetchSubsections();
      setEditingSubsection(null);
      toast({
        title: "Subsection updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating subsection",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteSubsection = async (id) => {
    try {
      await axios.delete(`/api/subsections/${id}`);
      fetchSubsections();
      toast({
        title: "Subsection deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting subsection",
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
            placeholder="Subsection Name"
            value={newSubsection.name}
            onChange={(e) =>
              setNewSubsection({ ...newSubsection, name: e.target.value })
            }
            mr={2}
          />
          <Input
            placeholder="Department ID"
            value={newSubsection.department_id}
            onChange={(e) =>
              setNewSubsection({
                ...newSubsection,
                department_id: e.target.value,
              })
            }
            mr={2}
          />
          <Input
            placeholder="Section ID"
            value={newSubsection.section_id}
            onChange={(e) =>
              setNewSubsection({ ...newSubsection, section_id: e.target.value })
            }
            mr={2}
          />
          <Input
            placeholder="Image URL"
            value={newSubsection.image_url}
            onChange={(e) =>
              setNewSubsection({ ...newSubsection, image_url: e.target.value })
            }
            mr={2}
          />
          <Button onClick={handleAddSubsection} colorScheme="blue">
            Add Subsection
          </Button>
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Department ID</Th>
              <Th>Section ID</Th>
              <Th>Image URL</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subsections.map((subsection) => (
              <Tr key={subsection.id}>
                <Td>
                  {editingSubsection &&
                  editingSubsection.id === subsection.id ? (
                    <Input
                      value={editingSubsection.name}
                      onChange={(e) =>
                        setEditingSubsection({
                          ...editingSubsection,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    subsection.name
                  )}
                </Td>
                <Td>{subsection.department_id}</Td>
                <Td>{subsection.section_id}</Td>
                <Td>{subsection.image_url}</Td>
                <Td>
                  {editingSubsection &&
                  editingSubsection.id === subsection.id ? (
                    <Button
                      onClick={handleUpdateSubsection}
                      colorScheme="green"
                      mr={2}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingSubsection(subsection)}
                      colorScheme="yellow"
                      mr={2}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteSubsection(subsection.id)}
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

export default SubsectionManagement;
