// controllers/snipeitProxyController.js
const axios = require("axios");
const https = require("https");

// ✅ Create an HTTPS agent to bypass SSL verification (internal only)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  timeout: 15000,
});

exports.proxySnipeitRequest = async (req, res) => {
  const { baseUrl, endpoint, token } = req.body;

  if (!baseUrl || !endpoint || !token) {
    return res
      .status(400)
      .json({ message: "Missing required parameters for Snipe-IT proxy." });
  }

  try {
    const fullUrl = `${baseUrl}/${endpoint}`;
    const isHttps = baseUrl.startsWith("https");

    console.log(`[PROXY] Fetching: ${fullUrl}`);

    // ✅ Perform backend request to Snipe-IT
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      ...(isHttps && { httpsAgent }),
      timeout: 15000,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 503;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network Error to Snipe-IT Host";

    console.error(`[PROXY ERROR] Status: ${status}, Message: ${message}`);

    return res.status(status).json({
      message: "Snipe-IT Proxy Failed. Check logs for details.",
      snipeit_error: message,
      status,
    });
  }
};
