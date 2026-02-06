const redis = require("redis");

// ⚠️ REDIS DISABLED GLOBALLY
const client = {
  isOpen: false,
  connect: async () => console.log("⚠️ Redis caching is DISABLED."),
  on: (event, callback) => { /* no-op */ },
  get: async (key) => null, // Always return null (cache miss)
  set: async (key, value, options) => "OK", // Pretend to save
  del: async (key) => 0,
  quit: async () => { },
  disconnect: async () => { }
};

// Start connection (Shim)
const connectRedis = async () => {
  console.log("⚠️ Redis caching is DISABLED.");
};

module.exports = {
  client,
  connectRedis,
};
