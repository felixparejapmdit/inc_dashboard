import axios from "axios";

// Detect protocol based on window location
const protocol = window.location.protocol === "https:" 
  ? process.env.REACT_APP_API_PROTOCOL_HTTPS 
  : process.env.REACT_APP_API_PROTOCOL_HTTP;

const apiUrl = `${protocol}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
    headers: { "Access-Control-Allow-Origin": "*" }, 
    httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
  });
  

export default api;
