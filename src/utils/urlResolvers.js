const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getBrowserOrigin = (port) => {
  if (typeof window === "undefined") {
    return `http://127.0.0.1:${port}`;
  }

  return window.location.origin || `http://127.0.0.1:${port}`;
};

export const resolveApiBaseUrl = (fallbackPort = 5000) => {
  const envValue = stripTrailingSlash(process.env.REACT_APP_API_URL);
  return envValue || getBrowserOrigin(fallbackPort);
};

export const resolveDirectusBaseUrl = () => {
  const envValue = stripTrailingSlash(process.env.REACT_APP_DIRECTUS_URL);
  return envValue || "/api/directus";
};

export const joinUrl = (baseUrl, targetPath) => {
  if (!targetPath) return "";
  if (/^https?:\/\//i.test(targetPath)) return targetPath;

  const base = stripTrailingSlash(baseUrl);
  if (!base) return targetPath;

  return `${base}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;
};
