// utils/FileOrganizer/uploadService.js

import axios from "axios";
import { resolveApiBaseUrl } from "../urlResolvers";

const BASE_URL = resolveApiBaseUrl();

export const uploadFileToLocal = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${BASE_URL}/api/upload-local`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
