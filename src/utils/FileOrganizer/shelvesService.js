// utils/FileOrganizer/shelvesService.js
import directus from "./directusClient";
import QRCode from "qrcode";

// Reusable error handler
const handleError = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    const err = error?.response?.data?.errors?.[0]?.message || error.message || "Unknown error";
    throw new Error(err);
  }
};

// GET all shelves
export const getShelves = handleError(async () => {
  const res = await directus.get("/items/Shelves");
  return res.data.data;
});

// GET single shelf
export const getShelfById = handleError(async (id) => {
  const res = await directus.get(`/items/Shelves/${id}`);
  return res.data.data;
});

// Helper to fetch max shelf number
const getNextShelfCode = async () => {
  const res = await directus.get("/items/Shelves", {
    params: {
      sort: "-id",
      limit: 1,
      fields: ["generated_code"],
    },
  });

  const latestCode = res.data.data[0]?.generated_code || "";
  const latestNum = parseInt(latestCode?.split("_")[1] || "0", 10);
  const nextNum = latestNum + 1;
  return `s_${nextNum.toString().padStart(4, "0")}`;
};

// CREATE shelf with generated_code and QR code
export const createShelf = async (shelf) => {
  // Get existing shelves to count
  const allShelves = await getShelves();
  const nextNumber = allShelves.length + 1;
  const padded = String(nextNumber).padStart(4, "0");
  const generated_code = `s_${padded}`;

  // Generate QR Code that contains the generated_code (e.g., s_0001)
  const qrDataUrl = await QRCode.toDataURL(generated_code);

  // Get user ID from local storage
  const userId = localStorage.getItem("userId");


  const shelfWithCodeAndQR = {
    ...shelf,
    generated_code,
    qrcode: qrDataUrl, // <-- stores the QR image (if schema supports)
    created_by: userId,
  };

  const res = await directus.post("/items/Shelves", shelfWithCodeAndQR);
  return res.data.data;
};


// UPDATE shelf
export const updateShelf = handleError(async (id, updatedShelf) => {
  const res = await directus.patch(`/items/Shelves/${id}`, updatedShelf);
  return res.data.data;
});

// DELETE shelf
export const deleteShelf = handleError(async (id) => {
  const res = await directus.delete(`/items/Shelves/${id}`);
  return res.data.data;
});
