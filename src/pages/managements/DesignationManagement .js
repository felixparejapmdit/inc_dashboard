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

const DesignationManagement = () => {
  const [designations, setDesignations] = useState([]);
  const [newDesignation, setNewDesignation] = useState({
    name: "",
    section_id: "",
    subsection_id: "",
  });
  const [editingDesignation, setEditingDesignation] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/designations`
      );
      setDesignations(response.data);
    } catch (error) {
      toast({
        title: "Error loading designations",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddDesignation = async () => {
    try {
      await axios.post("/api/designations", newDesignation);
      fetchDesignations();
      setNewDesignation({ name: "", section_id: "", subsection_id: "" });
      toast({
        title: "Designation added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateDesignation = async () => {
    try {
      await axios.put(
        `/api/designations/${editingDesignation.id}`,
        editingDesignation
      );
      fetchDesignations();
      setEditingDesignation(null);
      toast({
        title: "Designation updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating designation",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteDesignation = async (id) => {
    try {
      await axios.delete(`/api/designations/${id}`);
      fetchDesignations();
      toast({
        title: "Designation deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting designation",
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
            placeholder="Designation Name"
            value={newDesignation.name}
            onChange={(e) =>
              setNewDesignation({ ...newDesignation, name: e.target.value })
            }
            mr={2}
          />
          <Input
            placeholder="Section ID"
            value={newDesignation.section_id}
            onChange={(e) =>
              setNewDesignation({
                ...newDesignation,
                section_id: e.target.value,
              })
            }
            mr={2}
          />
          <Input
            placeholder="Subsection ID"
            value={newDesignation.subsection_id}
            onChange={(e) =>
              setNewDesignation({
                ...newDesignation,
                subsection_id: e.target.value,
              })
            }
            mr={2}
          />
          <Button onClick={handleAddDesignation} colorScheme="blue">
            Add Designation
          </Button>
        </Flex>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Section ID</Th>
              <Th>Subsection ID</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {designations.map((designation) => (
              <Tr key={designation.id}>
                <Td>
                  {editingDesignation &&
                  editingDesignation.id === designation.id ? (
                    <Input
                      value={editingDesignation.name}
                      onChange={(e) =>
                        setEditingDesignation({
                          ...editingDesignation,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    designation.name
                  )}
                </Td>
                <Td>{designation.section_id}</Td>
                <Td>{designation.subsection_id}</Td>
                <Td>
                  {editingDesignation &&
                  editingDesignation.id === designation.id ? (
                    <Button
                      onClick={handleUpdateDesignation}
                      colorScheme="green"
                      mr={2}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingDesignation(designation)}
                      colorScheme="yellow"
                      mr={2}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteDesignation(designation.id)}
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

export default DesignationManagement;
