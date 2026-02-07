// ✅ Build API URL dynamically based on HTTPS value
const useHttps = process.env.HTTPS === "true"; // read .env
const protocol = useHttps ? "https" : "http";
const host = process.env.REACT_APP_API_URL;

export const API_URL = `${protocol}://${host}`;
