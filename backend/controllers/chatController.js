const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ChatHistory = require("../models/ChatHistory");
const { Personnel, File, Department, Section, Designation } = require("../models");
const { Op } = require("sequelize");

const EXPORT_PATH = path.join(__dirname, "..", "scripts", "database_export.json");
const EMBEDDINGS_PATH = path.join(__dirname, "..", "scripts", "database_embeddings.json");

let dbData = {};
try {
  dbData = require(EXPORT_PATH);
} catch (error) {
  console.warn("database_export.json not found or invalid. Chatbot will run without local data.");
}

let embeddingsIndex = null;
let embeddingsMeta = null;
let embeddingsMtimeMs = 0;

function loadEmbeddingsIndex() {
  try {
    const stat = fs.statSync(EMBEDDINGS_PATH);
    const raw = fs.readFileSync(EMBEDDINGS_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed.items;
    embeddingsIndex = Array.isArray(items) ? items : [];
    embeddingsMeta = Array.isArray(parsed)
      ? null
      : { model: parsed?.model, createdAt: parsed?.createdAt };
    embeddingsMtimeMs = stat.mtimeMs;
  } catch (error) {
    embeddingsIndex = null;
    embeddingsMeta = null;
    embeddingsMtimeMs = 0;
  }
  return embeddingsIndex;
}

function getEmbeddingsIndex() {
  try {
    const stat = fs.statSync(EMBEDDINGS_PATH);
    if (stat.mtimeMs !== embeddingsMtimeMs || embeddingsIndex === null) {
      loadEmbeddingsIndex();
    }
  } catch (error) {
    embeddingsIndex = null;
    embeddingsMeta = null;
    embeddingsMtimeMs = 0;
  }
  return embeddingsIndex;
}

function embeddingsAreStale() {
  try {
    const exportStat = fs.statSync(EXPORT_PATH);
    const embedStat = fs.statSync(EMBEDDINGS_PATH);
    return exportStat.mtimeMs > embedStat.mtimeMs;
  } catch (error) {
    return true;
  }
}

function loadModelCatalog() {
  const modelsDir = path.join(__dirname, "..", "models");
  const ignore = new Set(["index.js", "associations.js", "index - Copy1.js"]);
  let files = [];

  try {
    files = fs
      .readdirSync(modelsDir)
      .filter((file) => file.endsWith(".js") && !ignore.has(file));
  } catch (error) {
    console.warn("Unable to read models directory:", error.message);
  }

  const catalog = [];
  for (const file of files) {
    try {
      const model = require(path.join(modelsDir, file));
      if (!model || !model.rawAttributes) continue;

      const tableNameRaw =
        typeof model.getTableName === "function"
          ? model.getTableName()
          : model.tableName;
      const tableName =
        typeof tableNameRaw === "object" && tableNameRaw?.tableName
          ? tableNameRaw.tableName
          : tableNameRaw;

      const modelName = model.name || path.basename(file, ".js");
      const fields = Object.keys(model.rawAttributes || {});

      catalog.push({
        modelName,
        tableName: tableName || modelName,
        fields,
        file,
      });
    } catch (error) {
      console.warn(`Skipping model ${file}:`, error.message);
    }
  }

  return catalog;
}

function buildModelLookup(catalog) {
  const lookup = new Map();

  function addKey(key, entry) {
    if (!key) return;
    const normalized = String(key).toLowerCase();
    if (!lookup.has(normalized)) lookup.set(normalized, entry);
  }

  for (const entry of catalog) {
    addKey(entry.modelName, entry);
    addKey(entry.tableName, entry);
    addKey(path.basename(entry.file, ".js"), entry);

    if (entry.modelName?.endsWith("s")) {
      addKey(entry.modelName.slice(0, -1), entry);
    } else {
      addKey(`${entry.modelName}s`, entry);
    }
  }

  return lookup;
}

function findMatchedModels(query, catalog, lookup) {
  const matched = new Map();
  const lowerQuery = query.toLowerCase();

  for (const [key, entry] of lookup.entries()) {
    if (lowerQuery.includes(key)) matched.set(entry.modelName, entry);
  }

  if (matched.size === 0) {
    for (const entry of catalog) {
      if (lowerQuery.includes(entry.tableName?.toLowerCase())) {
        matched.set(entry.modelName, entry);
      }
    }
  }

  return Array.from(matched.values());
}

function formatModelSummary(models) {
  if (!models.length) return "";

  return models
    .map((model) => {
      const maxFields = 12;
      const fields = model.fields.length
        ? model.fields.slice(0, maxFields).join(", ")
        : "No fields found";
      const extraCount =
        model.fields.length > maxFields ? `, +${model.fields.length - maxFields} more` : "";
      return `**${model.modelName}** (table: ${model.tableName})\nFields: ${fields}${extraCount}`;
    })
    .join("\n\n");
}

function getTablesFromCatalog(catalog) {
  return catalog
    .map((model) => model.tableName)
    .filter(Boolean)
    .map((table) => String(table));
}

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

function formatDateValue(value) {
  if (value === null || value === undefined || value === "") return "";

  const raw = String(value);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function looksLikeDateKey(key) {
  return /date|birthday|anniversary|created_at|updated_at/i.test(key);
}

function pickFields(row, preferredKeys, limit) {
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

function formatRecordLine(index, fields) {
  const parts = fields.map(([key, value]) => {
    const normalized = looksLikeDateKey(key) ? formatDateValue(value) : normalizeValue(value);
    const truncated = normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;
    return `\`${key}=${truncated}\``;
  });

  return `Record ${index}: ${parts.join(", ")}`;
}

function formatSearchResults(resultsByTable) {
  const sections = [];

  for (const [table, records] of Object.entries(resultsByTable)) {
    sections.push(`**Table: ${table}**`);
    records.forEach((record, idx) => {
      sections.push(formatRecordLine(idx + 1, record));
    });
    sections.push("");
  }

  return sections.join("\n").trim();
}

function detectResponseMode(query) {
  const lowered = query.toLowerCase();
  if (/\bdetails?\b|more info|full|show all/.test(lowered)) return "details";
  if (/\bsummary\b|brief|short|overview/.test(lowered)) return "summary";
  return "summary";
}

function getPreferredKeysForMode(mode) {
  const summaryKeys = [
    "id",
    "personnel_id",
    "reference_number",
    "givenname",
    "surname_husband",
    "surname_maiden",
    "lastname",
    "nickname",
  ];

  const defaultKeys = [
    ...summaryKeys,
    "department",
    "section",
    "designation",
    "local_congregation",
  ];

  const preferredKeys = mode === "summary" ? summaryKeys : defaultKeys;
  const limit = mode === "details" ? 14 : mode === "summary" ? 4 : 8;

  return { preferredKeys, limit };
}

function buildContextFromRecords(records, mode) {
  const { preferredKeys, limit } = getPreferredKeysForMode(mode);
  const resultsByTable = {};

  for (const entry of records) {
    if (!entry) continue;
    const table = entry.table || entry.tableName || "unknown";
    const record = entry.record || entry.row || entry.data;
    if (!record) continue;

    if (!resultsByTable[table]) {
      resultsByTable[table] = [];
    }

    resultsByTable[table].push(pickFields(record, preferredKeys, limit));
  }

  return formatSearchResults(resultsByTable);
}

// ✅ LIVE DATABASE SEARCH IMPLEMENTATION
async function searchLiveDatabase(query) {
  const lowerQuery = query.toLowerCase();
  const results = [];
  const limit = 5;

  // 1. Check if asking for FILES
  if (
    lowerQuery.includes("file") ||
    lowerQuery.includes("report") ||
    lowerQuery.includes("document") ||
    lowerQuery.includes("form") ||
    lowerQuery.includes("pdf") ||
    lowerQuery.includes("excel")
  ) {
    try {
      const files = await File.findAll({
        where: {
          [Op.or]: [
            { filename: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ]
        },
        limit: limit,
        attributes: ['id', 'filename', 'description', 'created_at']
      });

      if (files.length > 0) {
        results.push({
          source: 'Live Database (Files)',
          data: files.map(f => `File: ${f.filename} (${f.description || 'No description'}) - Created: ${f.created_at}`).join('\n')
        });
      }
    } catch (error) {
      console.error("Error searching files:", error);
    }
  }

  // 2. Check if asking for PERSONNEL / CONTACTS
  if (
    lowerQuery.includes("who") ||
    lowerQuery.includes("personnel") ||
    lowerQuery.includes("staff") ||
    lowerQuery.includes("contact") ||
    lowerQuery.includes("name") ||
    !lowerQuery.includes("file") // Default to personnel if not file
  ) {
    try {
      // Extract potential name (simple heuristic)
      const excludeWords = ["who", "is", "the", "contact", "for", "personnel", "staff", "show", "me", "all", "list", "name"];
      const searchTerms = lowerQuery.split(" ").filter(w => !excludeWords.includes(w) && w.length > 2);

      if (searchTerms.length > 0) {
        const personnel = await Personnel.findAll({
          where: {
            [Op.or]: [
              { givenname: { [Op.like]: `%${searchTerms[0]}%` } },
              { surname_husband: { [Op.like]: `%${searchTerms[0]}%` } },
              { surname_maiden: { [Op.like]: `%${searchTerms[0]}%` } },
              { nickname: { [Op.like]: `%${searchTerms[0]}%` } }
            ]
          },
          limit: limit,
          attributes: ['personnel_id', 'givenname', 'surname_husband', 'nickname'] // Add specific fields
        });

        if (personnel.length > 0) {
          results.push({
            source: 'Live Database (Personnel)',
            data: personnel.map(p => `Name: ${p.givenname} ${p.surname_husband} (ID: ${p.personnel_id})`).join('\n')
          });
        }
      }
    } catch (error) {
      console.error("Error searching personnel:", error);
    }
  }

  return results;
}

function searchDbData(query, tables, mode = "default") {
  const keywords = query
    .split(/[^a-z0-9_]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

  const records = [];
  let matches = 0;

  for (const table of tables) {
    const rows = dbData?.[table];
    if (!Array.isArray(rows)) continue;

    for (const row of rows) {
      const rowValues = Object.values(row).join(" ").toLowerCase();
      const hit = keywords.length
        ? keywords.some((keyword) => rowValues.includes(keyword))
        : rowValues.includes(query);

      if (hit) {
        records.push({ table, record: row });
        matches += 1;
      }

      if (matches >= 5) break;
    }

    if (matches >= 5) break;
  }

  return {
    contextData: buildContextFromRecords(records, mode),
    matches,
  };
}

const MODEL_CATALOG = loadModelCatalog();
const MODEL_LOOKUP = buildModelLookup(MODEL_CATALOG);

const OLLAMA_HOST = process.env.OLLAMA_HOST || "127.0.0.1";
const OLLAMA_PORT = process.env.OLLAMA_PORT || "11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";
const EMBEDDING_TOP_K = parseInt(process.env.EMBEDDING_TOP_K || "5", 10);
const EMBEDDING_SCORE_THRESHOLD = parseFloat(
  process.env.EMBEDDING_SCORE_THRESHOLD || "0.25"
);
const MAX_EMBED_QUERY_CHARS = parseInt(
  process.env.EMBEDDING_QUERY_MAX_CHARS || "800",
  10
);

loadEmbeddingsIndex();

async function generateEmbedding(text) {
  try {
    const prompt =
      text.length > MAX_EMBED_QUERY_CHARS ? text.slice(0, MAX_EMBED_QUERY_CHARS) : text;
    const response = await axios.post(
      `http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/embeddings`,
      {
        model: OLLAMA_EMBED_MODEL,
        prompt,
      },
      { timeout: 30000 }
    );
    return response.data?.embedding || null;
  } catch (error) {
    console.error("Ollama embedding error:", error.message);
    return null;
  }
}

function cosineSimilarity(vectorA, vectorB) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) return 0;
  if (vectorA.length !== vectorB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i += 1) {
    const a = vectorA[i];
    const b = vectorB[i];
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function searchEmbeddings(query, tables, mode) {
  const index = getEmbeddingsIndex();
  if (!Array.isArray(index) || index.length === 0) {
    return { contextData: "", matches: 0, used: false, reason: "no_index" };
  }

  if (embeddingsAreStale()) {
    return { contextData: "", matches: 0, used: false, reason: "stale" };
  }

  const queryEmbedding = await generateEmbedding(query);
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
    return { contextData: "", matches: 0, used: false, reason: "no_embedding" };
  }

  const allowedTables = tables?.length
    ? new Set(tables.map((table) => String(table).toLowerCase()))
    : null;

  const scored = [];
  for (const item of index) {
    if (!Array.isArray(item?.embedding)) continue;
    const tableName = item.table || item.tableName;
    if (allowedTables && tableName) {
      if (!allowedTables.has(String(tableName).toLowerCase())) continue;
    }
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    scored.push({
      table: tableName || "unknown",
      record: item.record || item.row || item.data,
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const threshold = Number.isFinite(EMBEDDING_SCORE_THRESHOLD)
    ? EMBEDDING_SCORE_THRESHOLD
    : 0.25;
  const topK = Number.isFinite(EMBEDDING_TOP_K) ? EMBEDDING_TOP_K : 5;
  const topMatches = scored.filter((item) => item.score >= threshold).slice(0, topK);

  return {
    contextData: buildContextFromRecords(topMatches, mode),
    matches: topMatches.length,
    used: true,
  };
}

async function generateOllamaResponse(prompt) {
  try {
    const response = await axios.post(
      `http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      },
      { timeout: 30000 }
    );
    return response.data?.response || "";
  } catch (error) {
    console.error("Ollama API error:", error.message);
    return "I'm having trouble reaching the Llama service right now.";
  }
}

async function checkOllamaHealth() {
  try {
    const response = await axios.get(
      `http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/tags`,
      { timeout: 5000 }
    );
    const models =
      Array.isArray(response.data?.models) ?
        response.data.models.map((model) => model?.name).filter(Boolean) :
        [];
    return { ok: response.status === 200, models };
  } catch (error) {
    return { ok: false, models: [] };
  }
}

// AI Chatbot Handler with Model Awareness
exports.chatbotHandler = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const query = message.toLowerCase().trim();
  const matchedModels = findMatchedModels(query, MODEL_CATALOG, MODEL_LOOKUP);

  const wantsModelInfo =
    /model|schema|table|field|column|columns/.test(query) ||
    /list .*models/.test(query);

  if (wantsModelInfo) {
    if (!MODEL_CATALOG.length) {
      return res.json({ reply: "No models were found in the backend/models folder." });
    }

    if (!matchedModels.length) {
      const modelList = MODEL_CATALOG.map((model) => model.modelName).sort();
      const reply = `Models available: ${modelList.join(", ")}. Ask about a specific model to see its fields.`;
      return res.json({ reply });
    }

    const reply = formatModelSummary(matchedModels.slice(0, 5));
    return res.json({ reply });
  }

  const tablesToSearch = matchedModels.length
    ? matchedModels.map((model) => model.tableName)
    : getTablesFromCatalog(MODEL_CATALOG);

  const effectiveTables = tablesToSearch.length
    ? tablesToSearch
    : Object.keys(dbData || {});

  const responseMode = detectResponseMode(query);
  const ollamaStatus = await checkOllamaHealth();

  let searchResult = { contextData: "", matches: 0, used: false, reason: "" };
  if (ollamaStatus.ok && ollamaStatus.models.includes(OLLAMA_EMBED_MODEL)) {
    searchResult = await searchEmbeddings(query, effectiveTables, responseMode);
    if (searchResult.reason === "stale") {
      console.warn("Embeddings index is stale. Rebuild database_embeddings.json.");
    }
  }

  // ✅ Try Live Search first
  const liveResults = await searchLiveDatabase(query);
  let liveContext = "";
  if (liveResults.length > 0) {
    liveContext = liveResults.map(r => `[${r.source}]\n${r.data}`).join("\n\n");
  }

  if (!searchResult.matches) {
    searchResult = searchDbData(query, effectiveTables, responseMode);
  }

  const { contextData } = searchResult;
  const modelContext = matchedModels.length
    ? formatModelSummary(matchedModels.slice(0, 3))
    : "";

  const prompt = `
You are an assistant for the PMD Dashboard Project.
Answer using ONLY the provided data. If the data is insufficient, say so and ask a clarifying question.
Keep responses concise and highlight only important fields. Offer a follow-up hint.

User question: "${message}"

Mode: ${responseMode}

Model info:
${modelContext || "No specific model matched the query."}

Relevant records:
${liveContext || contextData || "No direct records found."}
`.trim();

  const buildFallbackReply = () => {
    const responseParts = [];
    if (modelContext) {
      responseParts.push("Model info:");
      responseParts.push(modelContext);
    }
    if (contextData) {
      const label =
        responseMode === "details"
          ? "Detailed records:"
          : responseMode === "summary"
            ? "Key records:"
            : "Relevant records:";
      responseParts.push(label);
      responseParts.push(contextData);
      responseParts.push(
        "You can ask follow-up questions, or say `details` to see more fields."
      );
    }
    if (!responseParts.length) {
      responseParts.push(
        "No direct records matched your query. Try adding more keywords or specify a model/table name."
      );
    }
    return responseParts.join("\n\n");
  };

  if (!ollamaStatus.ok) {
    return res.json({
      reply:
        "Llama service is not reachable right now. Showing local data only.\n\n" +
        (liveContext ? `**Live Search Results:**\n${liveContext}\n\n` : "") +
        buildFallbackReply(),
    });
  }

  if (!ollamaStatus.models.includes(OLLAMA_MODEL)) {
    return res.json({
      reply:
        `Llama model "${OLLAMA_MODEL}" is not available in Ollama. ` +
        "Please pull it (e.g., `ollama pull llama3.1:8b`).\n\n" +
        buildFallbackReply(),
    });
  }

  const llamaReply = await generateOllamaResponse(prompt);
  if (llamaReply) {
    return res.json({ reply: llamaReply });
  }

  // Fallback to direct data if Llama does not return a response
  const responseParts = [];
  if (modelContext) {
    responseParts.push("Model info:");
    responseParts.push(modelContext);
  }
  if (contextData) {
    const label =
      responseMode === "details"
        ? "Detailed records:"
        : responseMode === "summary"
          ? "Key records:"
          : "Relevant records:";
    responseParts.push(label);
    responseParts.push(contextData);
    responseParts.push(
      "You can ask follow-up questions, or say `details` to see more fields."
    );
  }

  if (liveContext) {
    responseParts.unshift("**Live Search Results:**\n" + liveContext);
  }
  if (!responseParts.length) {
    responseParts.push(
      "No direct records matched your query. Try adding more keywords or specify a model/table name."
    );
  }
  return res.json({ reply: responseParts.join("\n\n") });
};

// Retrieve Chat History API
exports.getChatHistory = async (req, res) => {
  const { user_id } = req.params;
  try {
    const chatHistory = await ChatHistory.findAll({
      where: { user_id },
      order: [["timestamp", "ASC"]],
    });
    res.json(chatHistory);
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Failed to retrieve chat history." });
  }
};
