const axios = require("axios");
const {
  DIRECTUS_INTERNAL_URL,
  getDirectusAuthorizationHeader,
} = require("../services/directusAuthService");

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

const getForwardHeaders = async (req, { forceServerAuth = false } = {}) => {
  const serverAuthorization = await getDirectusAuthorizationHeader({ forceRefresh: forceServerAuth });
  const authorization = serverAuthorization || (!forceServerAuth ? req.headers.authorization : null);

  return {
    Accept: req.headers.accept || "application/json",
    Authorization: authorization,
    Cookie: req.headers.cookie,
    "Content-Type": req.headers["content-type"],
  };
};

const forwardRequest = async (req, targetUrl, forceServerAuth = false) => {
  const headers = await getForwardHeaders(req, { forceServerAuth });

  return axios.request({
    method: req.method,
    url: targetUrl,
    data: !["GET", "HEAD", "DELETE"].includes(req.method) ? req.body : undefined,
    headers,
    responseType: "arraybuffer",
    timeout: 15000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  });
};

exports.proxyDirectusRequest = async (req, res) => {
  const targetUrl = buildTargetUrl(req);

  try {
    let response = await forwardRequest(req, targetUrl);

    if (response.status === 401) {
      const retriedResponse = await forwardRequest(req, targetUrl, true);
      if (retriedResponse.status !== 401) {
        response = retriedResponse;
      }
    }

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
