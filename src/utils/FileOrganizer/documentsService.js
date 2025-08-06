import directus from "./directusClient";

// ✅ Common error handler
const handleError = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    const err = error?.response?.data?.errors?.[0]?.message || error.message || "Unknown error";
    throw new Error(err);
  }
};

// ✅ GET all documents
export const getDocuments = handleError(async (params = {}) => {
  const res = await directus.get("/items/Documents", { params });
  return res.data.data;
});

// ✅ GET documents by folder ID
export const getDocumentsByFolderId = handleError(async (folderId) => {
  const res = await directus.get("/items/Documents", {
    params: {
      filter: {
        folder_id: {
          _eq: folderId,
        },
      },
      sort: ["name"],
    },
  });

  return res.data.data;
});

// ✅ GET single document by ID
export const getDocumentById = handleError(async (id) => {
  const res = await directus.get(`/items/Documents/${id}`);
  return res.data.data;
});

// ✅ Helper to generate next unique document code (e.g., d_0001)
export const getNextDocumentCode = async () => {
  const res = await directus.get("/items/Documents", {
    params: {
      limit: -1,
      fields: "generated_code",
    },
  });

  const codes = res.data.data
    .map((item) => item.generated_code)
    .filter((code) => code?.startsWith("d_"))
    .map((code) => parseInt(code.replace("d_", ""), 10))
    .filter((num) => !isNaN(num));

  const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
  const nextCode = maxCode + 1;

  return `d_${String(nextCode).padStart(4, "0")}`;
};

// ✅ CREATE document with auto-generated code and created_by
export const createDocument = handleError(async (document) => {
  let attempt = 0;
  let created = null;

  while (!created && attempt < 3) {
    const generated_code = await getNextDocumentCode();
    const userId = localStorage.getItem("userId");

    const documentWithCode = {
      ...document,
      generated_code,
      created_by: userId,
    };

    try {
      const res = await directus.post("/items/Documents", documentWithCode);
      created = res.data.data;
    } catch (err) {
      if (err.response?.data?.errors?.[0]?.message?.includes("unique")) {
        attempt++;
        continue;
      }
      throw err;
    }
  }

  return created;
});

// ✅ UPDATE document
export const updateDocument = handleError(async (id, data) => {
  const res = await directus.patch(`/items/Documents/${id}`, data);
  return res.data.data;
});

// ✅ DELETE document
export const deleteDocument = handleError(async (id) => {
  const res = await directus.delete(`/items/Documents/${id}`);
  return res.data;
});
