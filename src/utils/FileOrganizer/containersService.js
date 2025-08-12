// utils/FileOrganizer/containersService.js
import directus from "./directusClient";
import QRCode from "qrcode";

// ✅ Reusable error handler
const handleError = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    const err = error?.response?.data?.errors?.[0]?.message || error.message || "Unknown error";
    throw new Error(err);
  }
};

// ✅ GET all containers (optionally filtered by shelf_id)
export const getContainers = handleError(async (shelf_id = null) => {
  const params = {
    fields: [
      "id",
      "name",
      "description",
      "generated_code",
      "shelf_id",
      "created_at",
      "folders.id",
      "folders.name",
      "folders.created_at"
    ],
    sort: "-created_at",
  };

  if (shelf_id) {
    params.filter = { shelf_id: { _eq: shelf_id } };
  }

  const res = await directus.get("/items/Containers", { params });
  console.log("📦 Containers (with folders):", res.data.data); // 👀 Debug
  return res.data.data;
});

// ✅ GET single container by ID (with folders)
export const getContainerById = handleError(async (id) => {
  const res = await directus.get(`/items/Containers/${id}`, {
    params: {
      fields: [
        "id",
        "name",
        "description",
        "generated_code",
        "shelf_id",
        "created_at",
        "folders.id",
        "folders.name",
        "folders.created_at"
      ],
    },
  });
  return res.data.data;
});

// ✅ GET container by ID WITH folder count
export const getContainerByIdWithFolderCount = handleError(async (id) => {
  const containerRes = await directus.get(`/items/Containers/${id}`, {
    params: {
      fields: [
        "id",
        "name",
        "description",
        "generated_code",
        "shelf_id",
        "created_at"
      ],
    },
  });

  const container = containerRes.data.data;

  const countRes = await directus.get("/items/Folders", {
    params: {
      aggregate: { count: "*" },
      filter: { container_id: { _eq: id } },
    },
  });

  const folderCount = countRes.data.data[0]?.count || 0;

  return {
    ...container,
    folderCount,
  };
});


// ✅ Helper to generate next unique container code (e.g., c_0004)
export const getNextContainerCode = async () => {
  const res = await directus.get("/items/Containers", {
    params: {
      limit: -1,
      fields: "generated_code",
    },
  });

  const codes = res.data.data
    .map((item) => item.generated_code)
    .filter((code) => code?.startsWith("c_"))
    .map((code) => parseInt(code.replace("c_", ""), 10))
    .filter((num) => !isNaN(num));

  const maxCode = codes.length > 0 ? Math.max(...codes) : 0;
  const nextCode = maxCode + 1;

  return `c_${String(nextCode).padStart(4, "0")}`;
};

// ✅ CREATE container with code and creator ID
export const createContainer = handleError(async (container) => {
  let attempt = 0;
  let created = null;

  while (!created && attempt < 3) {
    const generated_code = await getNextContainerCode();
    const userId = localStorage.getItem("userId");

    const containerWithCode = {
      ...container,
      generated_code,
      created_by: userId,
    };

    try {
      const res = await directus.post("/items/Containers", containerWithCode);
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

// ✅ UPDATE container
export const updateContainer = handleError(async (id, updatedContainer) => {
  const res = await directus.patch(`/items/Containers/${id}`, updatedContainer);
  return res.data.data;
});

// ✅ DELETE container
export const deleteContainer = handleError(async (id) => {
  const res = await directus.delete(`/items/Containers/${id}`);
  return res.data.data;
});
