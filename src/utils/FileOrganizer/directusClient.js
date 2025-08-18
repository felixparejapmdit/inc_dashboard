// utils/FileOrganizer/directusClient.js
import axios from "axios";

const API_URL = "https://test-directus.pmdmc.net"; // your Directus server
const AUTH_TOKEN = "63XbFHOFHSAMnL3HnVT8dARDfVqP2oIE"; // your static API token

const directus = axios.create({
  baseURL: API_URL, // ← REMOVE `/items` from here
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export default directus;
