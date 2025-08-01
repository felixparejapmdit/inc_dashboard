require("dotenv").config();

const fs = require("fs");
const https = require("https");
const http = require("http");
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2"); // ✅ MySQL for querying personnel/family data

const app = express();

const { Op } = require("sequelize");
const axios = require("axios"); // ✅ Axios to communicate with Ollama API

const IP_BIND = "0.0.0.0";
const PORT_HTTP = 80;
const PORT_HTTPS = 443;

// SSL config
let sslOptions = null;
if (process.env.HTTPS === "true") {
  sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE),
  };
}
app.use(
  cors({
    origin: "*", // Allow all origins (update for production)
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const API_URL = "http://172.18.125.54:11434/api/generate"; // Ollama local API

const importRoutes = require("./routes/importRoutes");

const districtsRoutes = require("./routes/districtsRoutes");
const localCongregationRoutes = require("./routes/localCongregationRoutes");

const chatRoutes = require("./routes/chatRoutes");

const groupRoutes = require("./routes/groupRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

const userGroupsRoutes = require("./routes/userGroupsRoutes");

const settingRoutes = require("./routes/settingsRoutes");

const permissionCategoriesRoutes = require("./routes/permissionCategoriesRoutes");

const groupPermissionsRoutes = require("./routes/groupPermissionsRoutes");

const permissionsAccessRoutes = require("./routes/permissionsAccessRoutes");

const userRoutes = require("./routes/userRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const appRoutes = require("./routes/appRoutes");

const suguanRoutes = require("./routes/suguanRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const locationRoutes = require("./routes/locationsRoutes");
const phonelocationRoutes = require("./routes/phonelocationsRoutes");
const applicationTypeRoutes = require("./routes/applicationTypeRoutes");

const reminderRoutes = require("./routes/reminderRoutes");

const personnelsRoutes = require("./routes/personnelsRoutes"); // Replace with actual route file path
const personnelContactsRoutes = require("./routes/personnelContactsRoutes");
const personnelAddressesRoutes = require("./routes/personnelAddressesRoutes");
const personnelGovIDsRoutes = require("./routes/personnelGovIDsRoutes");
const familyMembersRoutes = require("./routes/familyMembersRoutes");

const personnelImageRoutes = require("./routes/personnelImageRoutes");

const departmentRoutes = require("./routes/departmentRoutes");
const sectionsRoutes = require("./routes/sectionsRoutes");
const subsectionsRoutes = require("./routes/subsectionsRoutes");
const designationsRoutes = require("./routes/designationsRoutes");

const citizenshipsRoutes = require("./routes/citizenshipsRoutes");
const nationalitiesRoutes = require("./routes/nationalitiesRoutes");
const languagesRoutes = require("./routes/languagesRoutes");
const contactTypeInfoRoutes = require("./routes/contactTypeInfoRoutes");
const governmentIssuedIdRoutes = require("./routes/governmentIssuedIDRoutes");
const personnelDocumentsRoutes = require("./routes/PersonnelDocumentsRoutes");

const educationalBackgroundRoutes = require("./routes/educationalBackgroundRoutes");
const workExperienceRoutes = require("./routes/workExperienceRoutes");

const lokalProfileRoutes = require("./routes/lokalProfileRoutes");

const housingRoutes = require("./routes/housingRoutes.js");
const fileRoutes = require("./routes/fileRoutes.js");

const phoneDirectoryRoutes = require("./routes/phoneDirectoryRoutes");

const authRoutes = require("./routes/authRoutes");

app.use(express.json()); // Middleware to parse JSON request bodies

app.use(cors({ origin: "*" }));

// Instead of body-parser
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

app.use(userRoutes);
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(ldapRoutes);
app.use(appRoutes);
app.use(reminderRoutes);
app.use(suguanRoutes);
app.use(eventsRoutes);
app.use(locationRoutes);
app.use(phonelocationRoutes);
app.use(applicationTypeRoutes);

app.use(personnelsRoutes);
app.use(personnelContactsRoutes);
app.use(personnelAddressesRoutes);
app.use(personnelGovIDsRoutes);
app.use(familyMembersRoutes);

app.use(personnelImageRoutes);

// Management
app.use(departmentRoutes);
app.use(sectionsRoutes);
app.use(subsectionsRoutes);
app.use(designationsRoutes);
app.use(citizenshipsRoutes);
app.use(nationalitiesRoutes);
app.use(languagesRoutes);

app.use(contactTypeInfoRoutes);
app.use(governmentIssuedIdRoutes);
app.use(personnelDocumentsRoutes);

// API Routes
app.use(educationalBackgroundRoutes);
app.use(workExperienceRoutes);

app.use(groupRoutes);
app.use(permissionRoutes);
app.use(permissionCategoriesRoutes);

app.use("/api/permissions_access", permissionsAccessRoutes);

app.use("/api/groups", groupPermissionsRoutes);

app.use("/api/user-groups", userGroupsRoutes);

app.use("/uploads", express.static("uploads"));

app.use("/api", importRoutes);

app.use(districtsRoutes);
app.use(localCongregationRoutes);

app.use(chatRoutes);
app.use(settingRoutes);
app.use(authRoutes);

app.use(lokalProfileRoutes);
app.use(housingRoutes);
app.use(fileRoutes);
app.use(phoneDirectoryRoutes);

// ✅ Connect to MySQL database
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) console.error("❌ Database connection failed:", err);
  else console.log("✅ Connected to MySQL Database");
});

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const Personnel = require("./models/personnels");
const FamilyMember = require("./models/FamilyMember");

// ✅ API Endpoint: Chatbot with Database Search
// app.post("/api/chat", async (req, res) => {
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
// });

// ✅ Function to Call Ollama API
// async function generateOllamaResponse(prompt) {
//   try {
//     const response = await axios.post(
//       "http://172.18.121.50/api/generate", // ✅ Replace with your Ollama IP
//       {
//         model: "llama3.1", // or your chosen model
//         prompt,
//         stream: false,
//       }
//     );
//     return response.data.response;
//   } catch (error) {
//     console.error("❌ Ollama API error:", error);
//     return "I'm having trouble processing your request.";
//   }
// }

// --- Start server ---
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server is running on ${IP_Address}:${PORT}`);
// });

// Start HTTPS server
// https.createServer(sslOptions, app).listen(PORT, IP_BIND, () => {
//   // For logging, use the API URL to show the full public access URL
//   const publicURL = process.env.REACT_APP_API_URL || `https://localhost`;
//   console.log(`✅ HTTPS Server running at ${publicURL}:${PORT}`);
// });

// Start HTTP server
http.createServer(app).listen(PORT_HTTP, IP_BIND, () => {
  console.log(`✅ HTTP Server running at http://localhost:${PORT_HTTP}`);
});

// Start HTTPS server
if (sslOptions) {
  https.createServer(sslOptions, app).listen(PORT_HTTPS, IP_BIND, () => {
    console.log(`✅ HTTPS Server running at https://localhost:${PORT_HTTPS}`);
  });
}
