const axios = require("axios");

const DIRECTUS_INTERNAL_URL = (process.env.DIRECTUS_INTERNAL_URL || "http://directus:8055").replace(
  /\/+$/,
  ""
);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "content-encoding",
]);

const buildTargetUrl = (req) => {
  const baseUrl = DIRECTUS_INTERNAL_URL.endsWith("/")
    ? DIRECTUS_INTERNAL_URL
    : `${DIRECTUS_INTERNAL_URL}/`;

  return new URL(req.url || "/", baseUrl).toString();
};

exports.proxyDirectusRequest = async (req, res) => {
  const targetUrl = buildTargetUrl(req);
  const hasBody = !["GET", "HEAD", "DELETE"].includes(req.method);

  try {
    const response = await axios.request({
      method: req.method,
      url: targetUrl,
      data: hasBody ? req.body : undefined,
      headers: {
        Accept: req.headers.accept || "application/json",
        Authorization: req.headers.authorization,
        "Content-Type": req.headers["content-type"],
      },
      responseType: "arraybuffer",
      timeout: 15000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
    });

    res.status(response.status);

    Object.entries(response.headers || {}).forEach(([key, value]) => {
      if (value !== undefined && !HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    return res.send(Buffer.isBuffer(response.data) ? response.data : Buffer.from(response.data));
  } catch (error) {
    const message = error.message || "Network Error to Directus";
    console.error(`[Directus Proxy] ${req.method} ${targetUrl} failed: ${message}`);

    return res.status(503).json({
      message: "Directus proxy failed. Check backend logs.",
      directus_error: message,
    });
  }
};
