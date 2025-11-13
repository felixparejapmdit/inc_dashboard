const redis = require("redis");

// Create Redis client
const client = redis.createClient({
  socket: {
    host: "127.0.0.1", // localhost
    port: 6379,        // default Redis port
  },
});

// Event listeners
client.on("error", (err) => console.error("❌ Redis error:", err));
client.on("connect", () => console.log("🔌 Connecting to Redis..."));
client.on("ready", () => console.log("✅ Redis is ready and connected!"));
client.on("end", () => console.log("🛑 Redis connection closed"));

// Function to connect (async)
const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

module.exports = {
  client,
  connectRedis,
};
