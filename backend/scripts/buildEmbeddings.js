const axios = require("axios");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: __dirname + "/../../.env" });

const EXPORT_PATH = path.join(__dirname, "database_export.json");
const OUTPUT_PATH = path.join(__dirname, "database_embeddings.json");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "127.0.0.1";
const OLLAMA_PORT = process.env.OLLAMA_PORT || "11434";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

const MAX_TEXT_CHARS = parseInt(process.env.EMBEDDING_TEXT_MAX_CHARS || "1200", 10);
const MAX_FIELDS = parseInt(process.env.EMBEDDING_TEXT_MAX_FIELDS || "30", 10);

const IMPORTANT_FIELDS = [
  "id",
  "personnel_id",
  "reference_number",
  "givenname",
  "surname_husband",
  "surname_maiden",
  "lastname",
  "nickname",
  "department",
  "section",
  "designation",
  "local_congregation",
];

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }
  return String(value);
}

function pickFieldsForText(row, preferredKeys, limit) {
  const entries = Object.entries(row).filter(
    ([, val]) => val !== null && val !== undefined && val !== "null" && val !== ""
  );

  const picked = [];
  const used = new Set();

  for (const key of preferredKeys) {
    const match = entries.find(([entryKey]) => entryKey === key);
    if (match) {
      picked.push(match);
      used.add(match[0]);
    }
  }

  for (const entry of entries) {
    if (picked.length >= limit) break;
    if (!used.has(entry[0])) {
      picked.push(entry);
      used.add(entry[0]);
    }
  }

  return picked;
}

function buildRecordText(table, row) {
  const picked = pickFieldsForText(row, IMPORTANT_FIELDS, MAX_FIELDS);
  const fieldText = picked
    .map(([key, value]) => `${key}: ${normalizeValue(value)}`)
    .join(" | ");
  const text = `Table: ${table}. ${fieldText}`;
  return text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;
}

async function embedText(text) {
  const response = await axios.post(
    `http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/embeddings`,
    {
      model: OLLAMA_EMBED_MODEL,
      prompt: text,
    },
    { timeout: 30000 }
  );

  return response.data?.embedding;
}

async function buildEmbeddings() {
  if (!fs.existsSync(EXPORT_PATH)) {
    console.error("database_export.json not found. Run exportData.js first.");
    process.exit(1);
  }

  const raw = fs.readFileSync(EXPORT_PATH, "utf8");
  const dbData = JSON.parse(raw);
  const tables = Object.keys(dbData || {});

  const items = [];
  let processed = 0;

  for (const table of tables) {
    const rows = dbData[table];
    if (!Array.isArray(rows)) continue;

    for (const row of rows) {
      const text = buildRecordText(table, row);
      try {
        const embedding = await embedText(text);
        if (Array.isArray(embedding)) {
          items.push({ table, record: row, text, embedding });
        }
      } catch (error) {
        console.warn(`Embedding failed for table ${table}:`, error.message);
      }

      processed += 1;
      if (processed % 50 === 0) {
        console.log(`Embedded ${processed} records...`);
      }
    }
  }

  const payload = {
    model: OLLAMA_EMBED_MODEL,
    createdAt: new Date().toISOString(),
    items,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  console.log(`Embeddings saved to ${OUTPUT_PATH}`);
}

buildEmbeddings().catch((error) => {
  console.error("Failed to build embeddings:", error);
  process.exit(1);
});
