require("dotenv").config({ path: "../.env" }); // Load environment variables
const fs = require("fs");
const axios = require("axios");

// ✅ Load exported database data safely
const filePath = "database_export.json";
if (!fs.existsSync(filePath)) {
  console.error("❌ Error: database_export.json not found.");
  process.exit(1);
}
const dbData = JSON.parse(fs.readFileSync(filePath, "utf8"));

// ✅ Convert database into structured training text
function formatDatabaseData(data) {
  let formattedText = "### Database Training Data ###\n\n";

  for (const table in data) {
    formattedText += `📌 Table: ${table}\n`;

    data[table].forEach((row, index) => {
      formattedText += `🔹 Row ${index + 1}:\n`;
      for (const column in row) {
        formattedText += `- ${column}: ${row[column]}\n`;
      }
      formattedText += "\n";
    });
  }

  return formattedText;
}

// ✅ Chunk large data to prevent API limits
function chunkText(text, maxLength = 8000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }
  return chunks;
}

// ✅ Ollama API Configuration
const OLLAMA_HOST = "172.18.125.54";
const OLLAMA_PORT = "11434";
const OLLAMA_MODEL = "llama3.1:latest"; // ✅ Use correct model from your available list

// ✅ Train Ollama (Send Data in Chunks)
async function trainOllama() {
  try {
    const formattedData = formatDatabaseData(dbData);
    const chunks = chunkText(formattedData);

    console.log(
      `📢 Sending ${chunks.length} chunks to Ollama (${OLLAMA_HOST}) for processing...`
    );

    for (const chunk of chunks) {
      const response = await axios.post(
        `http://${OLLAMA_HOST}/api/generate`, // ✅ Updated IP & Port
        {
          model: OLLAMA_MODEL, // ✅ Correct model
          prompt: `You are an AI trained to answer queries based on the following database:\n\n${chunk}`,
          stream: false,
        }
      );

      console.log("✅ Ollama Training Response:", response.data);
    }

    console.log("🎉 Training process completed!");
  } catch (error) {
    console.error("❌ Ollama Training Error:", error.message);
  }
}

// ✅ Run Training
trainOllama();
