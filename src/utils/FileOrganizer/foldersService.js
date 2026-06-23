// utils/FileOrganizer/foldersService.js
import directus from "./directusClient";

// ✅ Reusable error handler
const handleError = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    const err = error?.response?.data?.errors?.[0]?.message || error.message || "Unknown error";
    throw new Error(err);
  }
};

const attachDocumentsToFolders = async (folders) => {
  if (!Array.isArray(folders) || folders.length === 0) return folders;

  const folderIds = folders.map((folder) => folder.id);
  const documentRes = await directus.get("/items/Documents", {
    params: {
      fields: [
        "id",
        "name",
        "generated_code",
        "folder_id",
        "container_id",
        "shelf_id",
        "file_url",
        "created_at",
      ],
      filter: { folder_id: { _in: folderIds } },
      sort: "name",
      limit: -1,
    },
  });

  const documents = documentRes.data.data || [];
  return folders.map((folder) => ({
    ...folder,
    documents: documents.filter(
      (document) => String(document.folder_id) === String(folder.id)
    ),
  }));
};

// ✅ GET all folders (optionally filtered by container_id or search)
export const getFolders = handleError(async (options = {}) => {
  const { container_id = null, search = "" } = options;

  const params = {
    fields: [
      "id",
      "name",
      "description",
      "generated_code",
      "container_id",
      "created_at"
    ],
    sort: "-created_at",
  };

  if (container_id) {
    params.filter = { container_id: { _eq: container_id } };
  } else if (search) {
    params.filter = { name: { _contains: search } };
  }

  const res = await directus.get("/items/Folders", { params });
  const folders = await attachDocumentsToFolders(res.data.data || []);
  console.log("📂 Folders (with documents):", folders); // 👀 Debug
  return folders;
});






// ✅ GET folders by container ID
export const getFoldersByContainerId = handleError(async (containerId) => {
  const res = await directus.get("/items/Folders", {
    params: {
      filter: {
        container_id: {
          _eq: containerId,
        },
      },
      fields: [
        "id",
        "name",
        "description",
        "generated_code",
        "container_id",
        "created_at"
      ],
      sort: ["name"],
    },
  });

  return attachDocumentsToFolders(res.data.data || []);
});




// ✅ GET folder by ID
export const getFolderById = handleError(async (id) => {
  const res = await directus.get(`/items/Folders/${id}`);
  return res.data.data;
});

// ✅ Helper to generate next unique folder code (e.g., f_0004)
export const getNextFolderCode = async () => {
  const res = await directus.get("/items/Folders", {
    params: {
      limit: -1,
      fields: "generated_code",  // Corrected field name
    },
  });

  const codes = res.data.data
    .map((item) => item.generated_code)  // Fixed from item.code
    .filter((code) => code?.startsWith("f_"))
    .map((code) => parseInt(code.replace("f_", ""), 10))
    .filter((num) => !isNaN(num));

  const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
  const nextCode = maxCode + 1;

  return `f_${String(nextCode).padStart(4, "0")}`;
};

// ✅ CREATE folder with auto-generated code and creator ID
export const createFolder = handleError(async (folder) => {
  let attempt = 0;
  let created = null;

  while (!created && attempt < 3) {
    const generated_code = await getNextFolderCode();
    const userId = localStorage.getItem("userId");

    const folderWithCode = {
      ...folder,
      generated_code,
      created_by: userId,
    };

    try {
      const res = await directus.post("/items/Folders", folderWithCode);
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

// ✅ UPDATE folder
export const updateFolder = handleError(async (id, data) => {
  const res = await directus.patch(`/items/Folders/${id}`, data);
  return res.data.data;
});

// ✅ DELETE folder
export const deleteFolder = handleError(async (id) => {
  const res = await directus.delete(`/items/Folders/${id}`);
  return res.data.data;  // Changed from res.data for consistency
});
