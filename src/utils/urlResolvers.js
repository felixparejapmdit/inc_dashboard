const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getBrowserOrigin = (port) => {
  if (typeof window === "undefined") {
    return `http://127.0.0.1:${port}`;
  }

  const protocol = window.location.protocol || "http:";
  const hostname = window.location.hostname || "127.0.0.1";
  const host = hostname.includes(":") ? `[${hostname}]` : hostname;
  return `${protocol}//${host}:${port}`;
};

export const resolveApiBaseUrl = (fallbackPort = 5003) => {
  const envValue = stripTrailingSlash(process.env.REACT_APP_API_URL);
  return envValue || getBrowserOrigin(fallbackPort);
};

export const resolveDirectusBaseUrl = (fallbackPort = 8055) => {
  const envValue = stripTrailingSlash(process.env.REACT_APP_DIRECTUS_URL);
  return envValue || getBrowserOrigin(fallbackPort);
};

export const joinUrl = (baseUrl, targetPath) => {
  if (!targetPath) return "";
  if (/^https?:\/\//i.test(targetPath)) return targetPath;

  const base = stripTrailingSlash(baseUrl);
  if (!base) return targetPath;

  return `${base}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;
};
