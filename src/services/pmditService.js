// src/services/pmditService.js
import axios from "axios";

// PMD-IT Snipe-IT API configuration
const PMDIT = {
  name: "PMD-IT",
  baseUrl: "https://172.18.121.36/api/v1",
  token: process.env.REACT_APP_PMDIT_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiY2MzZTlkZTBjYWU5NGY3MDYyMWEwNzRiMTJhNGNjYWIwNzFiMmE5NzcwYTFmYzZjNTYwNmNmZWNkYWUxMjFhYTZiMjIzMWIzZTE4NDJlYmIiLCJpYXQiOjE3NjI4NDE0MTcuMjI0ODk3LCJuYmYiOjE3NjI4NDE0MTcuMjI0OTA1LCJleHAiOjIyMzYyMjcwMTYuMTU2ODA5LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.kwP-Mx5DRzflnOAkpgUFvw471ZhPWSXpQRDEcAktbQYktGIkyjxfgk0sYAuHdF_l4kCHs55SPO25P-Sab2XrFtXgZ_V8iY7rr3ylLPWL4riAoaClufHLUYFOzX_msyBWc7b3xH-ZcFufGTAa6KrHEcAnm5k4Lo9VsuNqOzFsev6uCf9ttWJmtJOk2jToZJfWDOtPHKUPvRvW_PWF0NCDKZQWP8l_yCLsjUZs_xPvydfFD8mq48659JRkg-uxCtl7MTTBhfxYTqeSuAkHXANMImz11LitRWoMWJPB891wY3ck4a1dmiRuc-WsdMdNVUyXQJNknkL14Rm2lsaLPcuezvh33Tog-mtEVZXy6jwdVhRU7u2WSczWA4NvztaVcXOKrSH9J-3xH0zMmX7uTfWz-CDahLVbk-2UCxDInx46_wrxs5Ccc53JqpCysbM0nxsnHnjfbuQhi5gYgyOgCqroUtisWaNBb8uvFFxuRQNz-cbcylwFqCXr6duIbOG8IyFLbBOdpU5pQb3tod3knw8xJ_trREQRGgIeX1c6EYiYrnukl2lSohbn3ZDS8P4eaFGoCc-YcnDSsuOckw6WjxtgZBRbKOwPATZfSmkNFLH822l2V5OKANZ9PaLFJv-xjXAkOHM6t4nm_r84GS5CSl3h4Usa_6eCrD9qQhiFFX7bZkM", // put your token in .env
};

// Generic fetcher for PMD-IT
const fetchPMDITApi = async (endpoint) => {
  try {
    const res = await axios.get(`${PMDIT.baseUrl}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${PMDIT.token}`,
        Accept: "application/json",
      },
      timeout: 15000,
    });
    return res.data;
  } catch (error) {
    console.error(`[PMD-IT ERROR] ${endpoint}:`, error?.response?.data || error.message);
    return null;
  }
};

// Fetch all PMD-IT assets
export const getPMDITAssets = async () => {
  // You can adjust the limit for pagination
  return await fetchPMDITApi("hardware?limit=2000");
};
