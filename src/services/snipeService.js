/**
 * Optimized Snipe-IT Frontend Service (via Backend Proxy)
 * - Fetches each team's hardware data only once per dashboard load
 * - Calculates asset count, total cost, and top assets from the same dataset
 */

// ======================================================
// ✅ TEAM CONFIGURATION (from environment variables)
// ======================================================
export const TEAMS = {
  buildingAdmin: {
    name: "Building Admin",
    baseUrl: `${process.env.REACT_APP_SNIPEIT_PROTOCOL}://${process.env.REACT_APP_BUILDING_ADMIN_IP}/api/v1`,
    token: process.env.REACT_APP_BUILDING_ADMIN_TOKEN,
    color: "blue",
  },
  videoStreaming: {
    name: "Video Streaming Service (VSS)",
    baseUrl: `${process.env.REACT_APP_SNIPEIT_PROTOCOL}://${process.env.REACT_APP_VIDEO_STREAMING_IP}/api/v1`,
    token: process.env.REACT_APP_VIDEO_STREAMING_TOKEN,
    color: "red",
  },
  pmdIT: {
    name: "PMD-IT",
    baseUrl: `${process.env.REACT_APP_SNIPEIT_PROTOCOL}://${process.env.REACT_APP_PMDIT_IP}/api/v1`,
    token: process.env.REACT_APP_PMDIT_TOKEN,
    color: "teal",
  },
  eis: {
    name: "EIS",
    baseUrl: `${process.env.REACT_APP_SNIPEIT_PROTOCOL}://${process.env.REACT_APP_EIS_IP}/api/v1`,
    token: process.env.REACT_APP_EIS_TOKEN,
    color: "purple",
  },
};

// ======================================================
// ✅ Generic API Caller via Backend Proxy
// ======================================================
const fetchApi = async (team, endpoint) => {
  try {
    const backendUrl =
      process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";

    const response = await fetch(`${backendUrl}/api/proxy-snipeit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      },
      body: JSON.stringify({
        baseUrl: team.baseUrl,
        endpoint,
        token: team.token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Proxy Error: ${errorData.message || response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`[SNIPE-IT ERROR] ${team.name} → ${error.message || "Unknown error"}`);
    return null;
  }
};

// ======================================================
// ✅ Fetch all team data including other Snipe-IT endpoints
// ======================================================
export const fetchAllTeamDataOptimized = async () => {
  let allAssets = [];

  // Initialize grand totals
  let grandTotalAssets = 0;
  let grandTotalCost = 0;
  let totalGlobalLicenses = 0;
  let totalGlobalAccessories = 0;
  let totalGlobalConsumables = 0;
  let totalGlobalComponents = 0;

  const promises = Object.values(TEAMS).map(async (team) => {
    try {
      // Fetch Hardware
      const hardwareData = await fetchApi(team, "hardware?limit=10000");
      const hardwareRows = hardwareData?.rows?.map((asset) => ({
        name: asset.name || "No Name",
        team: team.name,
        cost: parseFloat(asset.purchase_cost) || 0,
        purchase_date: asset.purchase_date
          ? typeof asset.purchase_date === "string"
            ? asset.purchase_date
            : asset.purchase_date.formatted || asset.purchase_date.date || "N/A"
          : "N/A",
      })) || [];

      allAssets.push(...hardwareRows);

      const assetCount = hardwareData?.total || hardwareRows.length;
      const totalCost = hardwareRows.reduce((sum, a) => sum + a.cost, 0);

      // Fetch Licenses
      const licenseData = await fetchApi(team, "licenses?limit=10000");
      const licenses = licenseData?.total || 0;

      // Fetch Accessories
      const accessoryData = await fetchApi(team, "accessories?limit=10000");
      const accessories = accessoryData?.total || 0;

      // Fetch Consumables
      const consumableData = await fetchApi(team, "consumables?limit=10000");
      const consumables = consumableData?.total || 0;

      // Fetch Components
      const componentData = await fetchApi(team, "components?limit=10000");
      const components = componentData?.total || 0;

      // Update grand totals
      grandTotalAssets += assetCount;
      grandTotalCost += totalCost;
      totalGlobalLicenses += licenses;
      totalGlobalAccessories += accessories;
      totalGlobalConsumables += consumables;
      totalGlobalComponents += components;

      return {
        team: team.name,
        color: team.color,
        assetCount,
        totalCost,
        licenses,
        accessories,
        consumables,
        components,
        rows: hardwareRows, // used for topAssets
      };
    } catch (err) {
      console.error(`Error fetching data for team ${team.name}:`, err);
      return {
        team: team.name,
        color: team.color,
        assetCount: 0,
        totalCost: 0,
        licenses: 0,
        accessories: 0,
        consumables: 0,
        components: 0,
        rows: [],
      };
    }
  });

  const results = await Promise.allSettled(promises);
  const teamData = results.map(res => res.status === "fulfilled" ? res.value : {
    team: "Unknown",
    color: "gray",
    assetCount: 0,
    totalCost: 0,
    licenses: 0,
    accessories: 0,
    consumables: 0,
    components: 0,
    rows: [],
  });

  // Calculate top 10 assets globally
  const topAssets = allAssets.sort((a, b) => b.cost - a.cost).slice(0, 10);

  return {
    teamData,
    topAssets,
    allAssets,
    grandTotalAssets,
    grandTotalCost,
    totalGlobalLicenses,
    totalGlobalAccessories,
    totalGlobalConsumables,
    totalGlobalComponents
  };
};




