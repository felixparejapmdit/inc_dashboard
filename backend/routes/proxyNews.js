const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");
const { XMLParser } = require("fast-xml-parser");

const router = express.Router();
// Initialize Redis with error handling to prevent crashes if not available
const redis = new Redis({
    retryStrategy: (times) => {
        // Retry connection but don't crash immediately; exponentially back off
        return Math.min(times * 50, 2000);
    }
});

redis.on("error", (err) => {
    // Suppress unhandled error events to prevent crash
    // console.warn("Redis connection error:", err.message);
});

router.get("/proxy-news", async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: "RSS url is required" });
    }

    const cacheKey = `rss:${url}`;

    try {
        // 🔁 Redis cache (5 minutes)
        let cached = null;
        try {
            // Only try to get from redis if connected/ready, or let ioredis handle it
            if (redis.status === 'ready') {
                cached = await redis.get(cacheKey);
            }
        } catch (e) {
            console.warn("Redis get failed:", e.message);
        }

        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                "User-Agent": "ATG-News-Aggregator",
            },
        });

        const xml = response.data;

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "",
        });

        const parsed = parser.parse(xml);
        const items =
            parsed?.rss?.channel?.item ||
            parsed?.feed?.entry ||
            [];

        // 🔒 ALWAYS RETURN ARRAY
        const normalized = Array.isArray(items)
            ? items.map((i) => ({
                title: i.title?.["#text"] || i.title || "Untitled",
                link: i.link?.href || i.link || "#",
                pubDate: i.pubDate || i.updated || "",
                image:
                    i["media:thumbnail"]?.url ||
                    i["media:content"]?.url || // Sometimes array, sometimes object
                    (Array.isArray(i["media:content"]) ? i["media:content"].find(m => m.medium === 'image')?.url : i["media:content"]?.url) ||
                    i.enclosure?.url ||
                    null,
                category: i.category || "General",
                description: i.description || i.summary || i.content || "",
            }))
            : [];

        try {
            if (redis.status === 'ready') {
                await redis.setex(cacheKey, 300, JSON.stringify(normalized));
            }
        } catch (e) {
            console.warn("Redis set failed:", e.message);
        }

        res.json(normalized);
    } catch (err) {
        console.error("Proxy RSS error:", err.message);
        res.status(500).json([]);
    }
});

module.exports = router;
