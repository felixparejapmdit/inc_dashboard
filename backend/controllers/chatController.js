const axios = require("axios");
const { Op } = require("sequelize");
const Personnel = require("../models/personnels");
const FamilyMember = require("../models/FamilyMember");

// ✅ Ollama API Configuration
const OLLAMA_HOST = process.env.OLLAMA_HOST || "172.18.121.50";
const OLLAMA_PORT = process.env.OLLAMA_PORT || "11434";
const OLLAMA_MODEL = "llama3.1";
const dbData = require("../scripts/database_export.json"); // ✅ Load the trained database

// ✅ Function to Call Ollama API
async function generateOllamaResponse(prompt) {
  try {
    const response = await axios.post(`http://${OLLAMA_HOST}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    });
    return response.data.response;
  } catch (error) {
    console.error("❌ Ollama API error:", error);
    return "I'm having trouble processing your request.";
  }
}

// ✅ Chatbot API Logic
// exports.chatbotHandler = async (req, res) => {
//   const userMessage = req.body.message.toLowerCase();
//   const words = userMessage.split(" ");

//   // 🔍 **Extract a potential name from the user input**
//   const searchName = words.find((word) => word.length > 2); // Get a potential name

//   if (searchName) {
//     try {
//       // 🔍 Search personnel using Sequelize
//       const personnels = await Personnel.findAll({
//         where: {
//           [Op.or]: [
//             { givenname: { [Op.like]: `%${searchName}%` } },
//             { surname_husband: { [Op.like]: `%${searchName}%` } },
//             { nickname: { [Op.like]: `%${searchName}%` } },
//           ],
//         },
//         attributes: [
//           "reference_number",
//           "gender",
//           "civil_status",
//           "wedding_anniversary",
//           "givenname",
//           "surname_husband",
//           "nickname",
//           "date_of_birth",
//           "place_of_birth",
//         ],
//       });

//       // 🔍 Search family members using Sequelize
//       const familyMembers = await FamilyMember.findAll({
//         where: {
//           givenname: { [Op.like]: `%${searchName}%` },
//         },
//         attributes: [
//           "givenname",
//           "lastname",
//           "relationship_type",
//           "date_of_birth",
//           "gender",
//         ],
//       });

//       if (personnels.length === 0 && familyMembers.length === 0) {
//         return res.json({ reply: `No records found for "${searchName}".` });
//       }

//       // 📝 Format personnel details
//       let personnelInfo = personnels
//         .map(
//           (p) =>
//             `${p.givenname} ${p.surname_husband} (Nickname: ${
//               p.nickname || "N/A"
//             }) is a ${p.gender} with civil status ${p.civil_status}. Born on ${
//               p.date_of_birth
//             }, in ${p.place_of_birth}. Reference Number: ${
//               p.reference_number
//             }. Wedding Anniversary: ${p.wedding_anniversary || "N/A"}.`
//         )
//         .join("\n");

//       // 📝 Format family member details
//       let familyInfo = familyMembers
//         .map(
//           (f) =>
//             `${f.givenname} ${f.lastname} is a ${f.relationship_type}. Gender: ${f.gender}. Born on ${f.date_of_birth}.`
//         )
//         .join("\n");

//       // 🧠 **Send structured response to Ollama**
//       const ollamaPrompt = `
//       User asked about "${searchName}". Here is the information:

//       **Personnel Details:**
//       ${personnelInfo || "No personnel found."}

//       **Family Member Details:**
//       ${familyInfo || "No family members found."}
//       `;

//       const ollamaResponse = await generateOllamaResponse(ollamaPrompt);
//       res.json({ reply: ollamaResponse });
//     } catch (error) {
//       console.error("❌ Database query error:", error);
//       res.json({ reply: "Sorry, I couldn't retrieve the data." });
//     }
//     return;
//   }

//   // 🟢 **Default response if no match**
//   const ollamaResponse = await generateOllamaResponse(userMessage);
//   res.json({ reply: ollamaResponse });
// };

// ✅ Chatbot API Logic
exports.chatbotHandler = async (req, res) => {
  const userMessage = req.body.message.toLowerCase();

  // 🔍 **Step 1: Ask Ollama First**
  const ollamaResponse = await generateOllamaResponse(
    `User asked: ${userMessage}. Search through the trained database to answer.`
  );

  if (ollamaResponse && !ollamaResponse.includes("I don't know")) {
    return res.json({ reply: ollamaResponse });
  }

  // 🔍 **Step 2: Search in database_export.json**
  let matchedData = "";
  for (const table in dbData) {
    dbData[table].forEach((row) => {
      for (const column in row) {
        if (
          row[column] &&
          row[column].toString().toLowerCase().includes(userMessage)
        ) {
          matchedData += `📌 Found in ${table}:\n`;
          for (const key in row) {
            matchedData += `- ${key}: ${row[key]}\n`;
          }
          matchedData += "\n";
        }
      }
    });
  }

  if (matchedData) {
    return res.json({ reply: matchedData });
  }

  return res.json({ reply: "I couldn't find anything related to your query." });
};
