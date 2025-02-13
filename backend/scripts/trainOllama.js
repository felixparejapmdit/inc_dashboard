require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const axios = require("axios");
const cliProgress = require("cli-progress");

// ✅ Load exported database data safely
const filePath = "database_export.json";

if (!fs.existsSync(filePath)) {
  console.error("❌ Error: database_export.json not found.");
  process.exit(1);
}
const dbData = JSON.parse(fs.readFileSync(filePath, "utf8"));

// ✅ Format the entire database into readable training text
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
const OLLAMA_HOST = "172.18.121.50";
const OLLAMA_MODEL = "llama3.1"; // ✅ Use correct model from your available list

// ✅ Function to send chunk with retry mechanism
async function sendChunkWithRetry(chunk, retryCount = 3) {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      await axios.post(`http://${OLLAMA_HOST}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: `Learn and understand the following database structure:\n\n${chunk}`,
        stream: false,
      });

      return true; // Success
    } catch (error) {
      console.error(
        `❌ Error sending chunk (Attempt ${attempt}): ${error.message}`
      );

      if (attempt < retryCount) {
        console.log(`🔄 Retrying in 1 second...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.error(
          "❌ Failed after multiple attempts. Skipping this chunk."
        );
        return false; // Failure
      }
    }
  }
}

// ✅ Train Ollama with all database data
async function trainOllama() {
  try {
    const formattedData = formatDatabaseData(dbData);
    const chunks = chunkText(formattedData);
    const totalChunks = chunks.length;

    console.log(`📢 Training Ollama with ${totalChunks} chunks...`);

    // ✅ Create a CLI Progress Bar
    const progressBar = new cliProgress.SingleBar(
      {
        format:
          "🚀 Training Progress | {bar} | {percentage}% | {value}/{total} Chunks",
        barCompleteChar: "█",
        barIncompleteChar: "-",
        hideCursor: true,
      },
      cliProgress.Presets.shades_classic
    );

    progressBar.start(totalChunks, 0);

    for (let i = 0; i < totalChunks; i++) {
      const success = await sendChunkWithRetry(chunks[i]);

      if (success) {
        progressBar.increment(); // ✅ Update Progress Bar
      }
    }

    progressBar.stop(); // ✅ Stop the progress bar when training is done
    console.log("🎉 Training process completed!");
  } catch (error) {
    console.error("❌ Ollama Training Error:", error.message);
  }
}

// ✅ Run Training
trainOllama();
