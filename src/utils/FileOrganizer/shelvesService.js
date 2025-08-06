// utils/FileOrganizer/shelvesService.js
import directus from "./directusClient";
import QRCode from "qrcode";

// Reusable error handler
const handleError = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    const err =
      error?.response?.data?.errors?.[0]?.message ||
      error.message ||
      "Unknown error";
    throw new Error(err);
  }
};

// ✅ GET all shelves
export const getShelves = handleError(async () => {
  const res = await directus.get("/items/Shelves");
  return res.data.data;
});

// ✅ GET single shelf WITH container count
export const getShelfById = handleError(async (id) => {
  const shelfRes = await directus.get(`/items/Shelves/${id}`);
  const shelf = shelfRes.data.data;

  // Get container count for this shelf
  const countRes = await directus.get("/items/Containers", {
    params: {
      aggregate: {
        count: "*",
      },
      filter: {
        shelf_id: {
          _eq: id,
        },
      },
    },
  });

  const containerCount = countRes.data.data[0]?.count || 0;

  return {
    ...shelf,
    containerCount,
  };
});

// 🔢 Helper: Get next generated_code (e.g., s_0005)
const getNextShelfCode = async () => {
  const res = await directus.get("/items/Shelves", {
    params: {
      sort: "-id",
      limit: 1,
      fields: ["generated_code"],
    },
  });

  const latestCode = res.data.data[0]?.generated_code || "s_0000";
  const latestNum = parseInt(latestCode.split("_")[1] || "0", 10);
  const nextNum = latestNum + 1;
  return `s_${nextNum.toString().padStart(4, "0")}`;
};

// ➕ CREATE shelf (with QR code)
export const createShelf = handleError(async (shelf) => {
  const generated_code = await getNextShelfCode();
  const qrDataUrl = await QRCode.toDataURL(generated_code);

  const userId = localStorage.getItem("userId") || null;

  const payload = {
    ...shelf,
    generated_code,
    qrcode: qrDataUrl,
    created_by: userId,
  };

  const res = await directus.post("/items/Shelves", payload);
  return res.data.data;
});

// ✏️ UPDATE shelf
export const updateShelf = handleError(async (id, updatedShelf) => {
  const res = await directus.patch(`/items/Shelves/${id}`, updatedShelf);
  return res.data.data;
});

// ❌ DELETE shelf
export const deleteShelf = handleError(async (id) => {
  const res = await directus.delete(`/items/Shelves/${id}`);
  return res.data.data;
});
