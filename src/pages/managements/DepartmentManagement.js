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

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    image_url: "",
  });
  const [editingDepartment, setEditingDepartment] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/departments`
      );
      setDepartments(response.data);
    } catch (error) {
      toast({
        title: "Error loading departments",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleAddDepartment = async () => {
    try {
      await axios.post("/api/departments", newDepartment);
      fetchDepartments();
      setNewDepartment({ name: "", image_url: "" });
      toast({
        title: "Department added",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error adding department",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUpdateDepartment = async () => {
    try {
      await axios.put(
        `/api/departments/${editingDepartment.id}`,
        editingDepartment
      );
      fetchDepartments();
      setEditingDepartment(null);
      toast({
        title: "Department updated",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error updating department",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await axios.delete(`/api/departments/${id}`);
      fetchDepartments();
      toast({
        title: "Department deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting department",
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
            placeholder="Department Name"
            value={newDepartment.name}
            onChange={(e) =>
              setNewDepartment({ ...newDepartment, name: e.target.value })
            }
            mr={2}
          />
          <Input
            placeholder="Image URL"
            value={newDepartment.image_url}
            onChange={(e) =>
              setNewDepartment({ ...newDepartment, image_url: e.target.value })
            }
            mr={2}
          />
          <Button onClick={handleAddDepartment} colorScheme="blue">
            Add Department
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
            {departments.map((department) => (
              <Tr key={department.id}>
                <Td>
                  {editingDepartment &&
                  editingDepartment.id === department.id ? (
                    <Input
                      value={editingDepartment.name}
                      onChange={(e) =>
                        setEditingDepartment({
                          ...editingDepartment,
                          name: e.target.value,
                        })
                      }
                    />
                  ) : (
                    department.name
                  )}
                </Td>
                <Td>
                  {editingDepartment &&
                  editingDepartment.id === department.id ? (
                    <Input
                      value={editingDepartment.image_url}
                      onChange={(e) =>
                        setEditingDepartment({
                          ...editingDepartment,
                          image_url: e.target.value,
                        })
                      }
                    />
                  ) : (
                    department.image_url
                  )}
                </Td>
                <Td>
                  {editingDepartment &&
                  editingDepartment.id === department.id ? (
                    <Button
                      onClick={handleUpdateDepartment}
                      colorScheme="green"
                      mr={2}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingDepartment(department)}
                      colorScheme="yellow"
                      mr={2}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeleteDepartment(department.id)}
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

export default DepartmentManagement;
