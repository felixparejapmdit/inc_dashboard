// src/pages/FileOrganizer/AddDocumentForm.js
import React, { useState, useEffect } from "react";
import {
  Badge,
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Stack,
  Text,
  VStack,
  Icon,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FaFileUpload } from "react-icons/fa";

import { uploadFileToLocal } from "../../utils/FileOrganizer/uploadService";
import { createDocument, updateDocument } from "../../utils/FileOrganizer/documentsService";

const AddDocumentForm = ({ onSave, editData, folderId, containerId, shelfId }) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    tags: "",
    description: "",
    file_url: "",
  });

  const [fileUpload, setFileUpload] = useState(null);
  const uploadBg = useColorModeValue("blue.50", "gray.700");
  const uploadBorder = useColorModeValue("blue.200", "blue.500");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        type: editData.type || "",
        tags: editData.tags || "",
        description: editData.description || "",
        file_url: editData.file_url || "",
      });
    } else {
      setFormData({
        name: "",
        type: "",
        tags: "",
        description: "",
        file_url: "",
      });
      setFileUpload(null);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setSelectedFile = (file) => {
    if (!file) return;

    setFileUpload(file);
    setFormData((prev) => ({
      ...prev,
      type: file.type || "",
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setSelectedFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedFile = null;

      // On edit, allow using existing file_url if no new file is uploaded
      if (!fileUpload && !formData.file_url) {
        throw new Error("Please upload a file.");
      }

      if (fileUpload) {
        uploadedFile = await uploadFileToLocal(fileUpload);
      }

      const generatedCode = `DOC-${Date.now()}`;

      const payload = {
        code: generatedCode,
        name: formData.name,
        tags: formData.tags,
        description: formData.description,
        type: uploadedFile?.type || formData.type || "application/octet-stream",
        file_url: uploadedFile?.url || formData.file_url,
        date_added: new Date().toISOString(),
        folder_id: folderId,
        container_id: containerId,
        shelf_id: shelfId,
      };

      let result;

      if (editData?.id) {
        result = await updateDocument(editData.id, payload);
        toast({ title: "Document updated", status: "success", duration: 3000, isClosable: true });
      } else {
        result = await createDocument(payload);
        toast({ title: "Document added", status: "success", duration: 3000, isClosable: true });
      }

      onSave(result);

      setFormData({ name: "", type: "", tags: "", description: "", file_url: "" });
      setFileUpload(null);
    } catch (error) {
      console.error("Error saving document:", error.message);
      toast({
        title: "Error",
        description: error.message || "Could not save document.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack spacing={5}>
        <FormControl isRequired>
          <FormLabel>Document Title</FormLabel>
          <Input
            name="name"
            placeholder="Example: Contract, Memo, Meeting Notes"
            value={formData.name}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            placeholder="Short note about this document"
            value={formData.description}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Tags</FormLabel>
          <Input
            name="tags"
            placeholder="finance, report, urgent"
            value={formData.tags}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl isRequired={!editData}>
          <FormLabel>Upload File</FormLabel>
          <Box
            as="label"
            htmlFor="file-organizer-upload"
            bg={uploadBg}
            border="2px dashed"
            borderColor={uploadBorder}
            borderRadius="2xl"
            cursor="pointer"
            display="block"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            p={6}
            textAlign="center"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
          >
            <Input
              id="file-organizer-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              display="none"
            />
            <VStack spacing={3}>
              <Icon as={FaFileUpload} boxSize={8} color="blue.500" />
              <Text fontWeight="800">
                {fileUpload ? fileUpload.name : "Drop a file here or click to browse"}
              </Text>
              <Text color={mutedText} fontSize="sm">
                Use a clear title and tags so this document is easy to find later.
              </Text>
              {(fileUpload || formData.file_url) && (
                <Badge borderRadius="full" colorScheme="blue" px={3} py={1}>
                  {fileUpload?.type || formData.type || "Existing file selected"}
                </Badge>
              )}
            </VStack>
          </Box>
        </FormControl>

        <Button type="submit" colorScheme="blue" size="lg">
          {editData ? "Update Document" : "Add Document"}
        </Button>
      </Stack>
    </Box>
  );
};

export default AddDocumentForm;
