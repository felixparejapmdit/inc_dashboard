const axios = require("axios");

const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const DIRECTUS_INTERNAL_URL = stripTrailingSlash(
  process.env.DIRECTUS_INTERNAL_URL || "http://directus:8055"
);
const DIRECTUS_PROXY_TOKEN = String(process.env.DIRECTUS_PROXY_TOKEN || "").trim();
const DIRECTUS_ADMIN_EMAIL = String(process.env.DIRECTUS_ADMIN_EMAIL || "").trim();
const DIRECTUS_ADMIN_PASSWORD = String(process.env.DIRECTUS_ADMIN_PASSWORD || "");

let cachedAccessToken = "";
let cachedExpiresAt = 0;
let pendingLogin = null;

const getLoginUrl = () => `${DIRECTUS_INTERNAL_URL}/auth/login`;

const loginWithAdminCredentials = async () => {
  if (!DIRECTUS_ADMIN_EMAIL || !DIRECTUS_ADMIN_PASSWORD) {
    return null;
  }

  const response = await axios.post(
    getLoginUrl(),
    {
      email: DIRECTUS_ADMIN_EMAIL,
      password: DIRECTUS_ADMIN_PASSWORD,
      mode: "json",
    },
    {
      timeout: 15000,
      validateStatus: () => true,
    }
  );

  if (response.status !== 200) {
    throw new Error(
      response.data?.error?.message ||
        response.data?.message ||
        `Directus login failed with status ${response.status}`
    );
  }

  const loginData = response.data?.data || response.data || {};
  const accessToken = loginData.access_token;
  const expiresValue = Number(loginData.expires || 0);
  const expiresMs =
    expiresValue > 1000 ? expiresValue : expiresValue > 0 ? expiresValue * 1000 : 0;

  if (!accessToken) {
    throw new Error("Directus login did not return an access token");
  }

  cachedAccessToken = accessToken;
  cachedExpiresAt = expiresMs > 0 ? Date.now() + expiresMs - 30000 : Date.now() + 10 * 60 * 1000;

  return accessToken;
};

const getCachedServerToken = async ({ forceRefresh = false } = {}) => {
  if (DIRECTUS_PROXY_TOKEN) {
    return DIRECTUS_PROXY_TOKEN;
  }

  if (!forceRefresh && cachedAccessToken && Date.now() < cachedExpiresAt) {
    return cachedAccessToken;
  }

  if (!pendingLogin) {
    pendingLogin = loginWithAdminCredentials().finally(() => {
      pendingLogin = null;
    });
  }

  return pendingLogin;
};

const getDirectusAuthorizationHeader = async ({ forceRefresh = false } = {}) => {
  const serverToken = await getCachedServerToken({ forceRefresh });

  if (serverToken) {
    return `Bearer ${serverToken}`;
  }

  return null;
};

module.exports = {
  getDirectusAuthorizationHeader,
  DIRECTUS_INTERNAL_URL,
};
