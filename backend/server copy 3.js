require("dotenv").config();

const fs = require("fs");
const https = require("https");
const http = require("http");
const express = require("express");
//const fileUpload = require("express-fileupload");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2"); // ✅ MySQL for querying personnel/family data

const app = express();

const { Op } = require("sequelize");
const axios = require("axios"); // ✅ Axios to communicate with Ollama API

const IP_BIND = "0.0.0.0";
const PORT_HTTP = 5000;
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

//const chatRoutes = require("./routes/chatRoutes");

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


const uploadLocalRoute = require('./routes/uploadLocal');


app.use(express.json()); // Middleware to parse JSON request bodies

app.use(cors({ origin: "*" }));

// Instead of body-parser
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));


app.get("/api/test-upload", (req, res) => {
  res.send("✅ Upload route working!");
});

// ✅ Register the route
app.use("/api",uploadLocalRoute);




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

//app.use(chatRoutes);
app.use(settingRoutes);
app.use(authRoutes);

app.use(lokalProfileRoutes);
app.use(housingRoutes);
app.use(fileRoutes);
app.use(phoneDirectoryRoutes);

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "uploads/avatar");
fs.mkdirSync(uploadDir, { recursive: true });

// FIX: Clean up the connection block
const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  authPlugins: {
    mysql_native_password: () => () => ""
  }
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ✅ Middleware
app.use(bodyParser.json());

// Test route
app.get("/api/test-upload", (req, res) => {
  res.send("✅ Upload route working!");
});

// Example: Add your route imports here
// const userRoutes = require("./routes/userRoutes");
// app.use(userRoutes);

// Start HTTP server
http.createServer(app).listen(PORT_HTTP, IP_BIND, () => {
  console.log(`✅ HTTP Server running at http://localhost:${PORT_HTTP}`);
});

// Start HTTPS server if enabled
if (sslOptions) {
  https.createServer(sslOptions, app).listen(PORT_HTTPS, IP_BIND, () => {
    console.log(`✅ HTTPS Server running at https://localhost:${PORT_HTTPS}`);
  });
}


app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


// // Start HTTP server
// http.createServer(app).listen(PORT_HTTP, "0.0.0.0", () => {
//   console.log(`✅ HTTP Server running at http://0.0.0.0:${PORT_HTTP}`);
// });

// // Start HTTPS server if enabled
// if (sslOptions) {
//   https.createServer(sslOptions, app).listen(PORT_HTTPS, "0.0.0.0", () => {
//     console.log(`✅ HTTPS Server running at https://0.0.0.0:${PORT_HTTPS}`);
//   });
// }


