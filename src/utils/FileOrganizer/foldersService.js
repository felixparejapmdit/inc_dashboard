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

// ✅ GET all folders (with optional search)
export const getFolders = handleError(async (search = "") => {
  const res = await directus.get("/items/Folders", {
    params: {
      filter: search
        ? {
            name: {
              _contains: search, // 🔍 partial match on name
            },
          }
        : {},
      sort: ["name"],
    },
  });

  return res.data.data;
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
      sort: ["name"],
    },
  });

  return res.data.data;
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
      fields: "generated_code",
    },
  });

  const codes = res.data.data
    .map((item) => item.code)
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
  return res.data;
});
