// src/services/snipeService.js
import axios from "axios";

// ======================================================
// ✅ Detect protocol based on .env
// ======================================================
const PROTOCOL =
  process.env.REACT_APP_SNIPEIT_PROTOCOL ||
  (process.env.HTTPS === "true" ? "https" : "http");

// ======================================================
// ✅ Build team config dynamically from .env
// ======================================================
export const TEAMS = {
  buildingAdmin: {
    name: "Building Admin",
    baseUrl: `${PROTOCOL}://${process.env.REACT_APP_BUILDING_ADMIN_IP}/api/v1`,
    token: process.env.REACT_APP_BUILDING_ADMIN_TOKEN,
    color: "blue",
  },

  videoStreaming: {
    name: "Video Streaming Service (VSS)",
    baseUrl: `${PROTOCOL}://${process.env.REACT_APP_VIDEO_STREAMING_IP}/api/v1`,
    token: process.env.REACT_APP_VIDEO_STREAMING_TOKEN,
    color: "red",
  },

  pmdIT: {
    name: "PMD-IT",
    baseUrl: `${PROTOCOL}://${process.env.REACT_APP_PMDIT_IP}/api/v1`,
    token: process.env.REACT_APP_PMDIT_TOKEN,
    color: "teal",
  },

  eis: {
    name: "EIS",
    baseUrl: `${PROTOCOL}://${process.env.REACT_APP_EIS_IP}/api/v1`,
    token: process.env.REACT_APP_EIS_TOKEN,
    color: "purple",
  },
};

// ======================================================
// ✅ Generic API caller
// ======================================================
const fetchApi = async (team, endpoint) => {
  try {
    const res = await axios.get(`${team.baseUrl}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${team.token}`,
        Accept: "application/json",
      },
      timeout: 15000,
    });

    return res.data;
  } catch (err) {
    console.error(
      `[SNIPE-IT ERROR] ${team.name} (${team.baseUrl}) →`,
      err?.response?.status,
      err?.response?.data?.message || err.message
    );
    return null;
  }
};

// ======================================================
// ✅ Asset count
// ======================================================
export const fetchTeamAssetsCount = async (team) => {
  const data = await fetchApi(team, "hardware?limit=1");
  return data?.total || 0;
};

// ======================================================
// ✅ Sum all hardware costs
// ======================================================
export const fetchTeamTotalCost = async (team) => {
  const data = await fetchApi(team, "hardware?limit=10000");

  if (!data?.rows) return 0;

  let totalCost = 0;

  data.rows.forEach((asset) => {
    if (asset.purchase_cost) {
      totalCost += parseFloat(asset.purchase_cost);
    }
  });

  return totalCost;
};

// ======================================================
// ✅ Dashboard Data (Summary per team)
// ======================================================
export const fetchAllTeamData = async () => {
  const promises = Object.values(TEAMS).map(async (team) => {
    const assetCount = await fetchTeamAssetsCount(team);
    const totalCost = await fetchTeamTotalCost(team);

    return {
      team: team.name,
      assetCount,
      totalCost,
      color: team.color,
    };
  });

  return await Promise.all(promises);
};

// ======================================================
// ✅ Top 10 Most Expensive Assets
// ======================================================
export const fetchTop10Assets = async () => {
  let allAssets = [];

  for (const team of Object.values(TEAMS)) {
    const data = await fetchApi(team, "hardware?limit=2000");

    if (data?.rows) {
      data.rows.forEach((asset) => {
        allAssets.push({
          name: asset.name || "No Name",
          team: team.name,
          cost: parseFloat(asset.purchase_cost || 0),
          purchase_date: asset.purchase_date || "N/A",
        });
      });
    }
  }

  return allAssets
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);
};
