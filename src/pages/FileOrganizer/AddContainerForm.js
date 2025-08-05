import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { createContainer } from "../../utils/FileOrganizer/containersService";

const AddContainerForm = ({ shelves, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    shelf_id: "",
  });

  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "shelf_id" ? Number(value) : value, // convert shelf_id to number
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.shelf_id || isNaN(form.shelf_id)) {
      toast({
        title: "Name and Shelf are required.",
        status: "warning",
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await createContainer({
        ...form,
        created_by: 1, // Replace with actual user ID in production
      });

      onAdd(res);
      toast({
        title: "Container added successfully.",
        status: "success",
        isClosable: true,
      });

      setForm({ name: "", description: "", shelf_id: "" });
    } catch (error) {
      toast({
        title: "Error adding container.",
        description: error.message,
        status: "error",
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="start">
        <FormControl isRequired>
          <FormLabel>Shelf</FormLabel>
          <Select
            name="shelf_id"
            value={form.shelf_id}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, shelf_id: Number(e.target.value) }))
            }
            placeholder="Select Shelf"
          >
            {shelves.map((shelf) => (
              <option key={shelf.id} value={shelf.id}>
                {shelf.name}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Container Name</FormLabel>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter container name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter description (optional)"
          />
        </FormControl>

        <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
          Add Container
        </Button>
      </VStack>
    </Box>
  );
};

export default AddContainerForm;
