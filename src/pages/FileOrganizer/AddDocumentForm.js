// src/pages/FileOrganizer/AddDocumentForm.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Input,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Stack,
  useToast,
} from "@chakra-ui/react";

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

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        type: editData.type || "",
        tags: editData.tags || "",
        description: editData.description || "",
        file_url: editData.file_url || "",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileUpload(file);
    setFormData((prev) => ({
      ...prev,
      type: file.type || "",
    }));
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
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Document Title</FormLabel>
          <Input name="name" value={formData.name} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea name="description" value={formData.description} onChange={handleChange} />
        </FormControl>

        <FormControl>
          <FormLabel>Tags</FormLabel>
          <Input name="tags" value={formData.tags} onChange={handleChange} />
        </FormControl>

        <FormControl isRequired={!editData}>
          <FormLabel>Upload File</FormLabel>
          <Input type="file" accept="*/*" onChange={handleFileChange} />
        </FormControl>

        <Button type="submit" colorScheme="blue">
          {editData ? "Update Document" : "Add Document"}
        </Button>
      </Stack>
    </Box>
  );
};

export default AddDocumentForm;
