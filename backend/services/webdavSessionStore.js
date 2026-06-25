const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000;
const sessionCache = new Map();
let cleanupTimerStarted = false;

const normalizeUsername = (username) => String(username || "").trim();

const cleanupExpiredSessions = () => {
  const now = Date.now();

  for (const [key, session] of sessionCache.entries()) {
    if (!session || session.expiresAt <= now) {
      sessionCache.delete(key);
    }
  }
};

const storeWebdavSession = ({ username, password }) => {
  const key = normalizeUsername(username);

  if (!key || !password) {
    return null;
  }

  const now = Date.now();
  const expiresAt = now + DEFAULT_TTL_MS;

  sessionCache.set(key, {
    password,
    createdAt: now,
    expiresAt,
  });

  return {
    username: key,
    expiresAt,
  };
};

const getWebdavSession = (username) => {
  const key = normalizeUsername(username);

  if (!key) {
    return null;
  }

  const session = sessionCache.get(key);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessionCache.delete(key);
    return null;
  }

  return session;
};

const clearWebdavSession = (username) => {
  const key = normalizeUsername(username);

  if (!key) {
    return false;
  }

  return sessionCache.delete(key);
};

const startCleanupTimer = () => {
  if (cleanupTimerStarted) {
    return;
  }

  const timer = setInterval(cleanupExpiredSessions, 15 * 60 * 1000);
  if (typeof timer.unref === "function") {
    timer.unref();
  }

  cleanupTimerStarted = true;
  return timer;
};

startCleanupTimer();

module.exports = {
  clearWebdavSession,
  getWebdavSession,
  storeWebdavSession,
};
