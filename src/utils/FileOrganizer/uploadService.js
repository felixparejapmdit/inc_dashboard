// utils/uploadService.js
import directus from "./directusClient";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await directus.post("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};
