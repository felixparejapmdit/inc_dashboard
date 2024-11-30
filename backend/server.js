require("dotenv").config();

const express = require("express");

const path = require("path");

const db = require("./db");
const cors = require("cors");
const bodyParser = require("body-parser");

const IP_Address = process.env.REACT_IP_ADDRESS || "0.0.0.0"; // Default to listening on all interfaces

const app = express();
const PORT = process.env.REACT_PORT || 5000;

const groupRoutes = require("./routes/groupRoutes");
const permissionRoutes = require("./routes/permissionRoutes");

const userGroupsRoutes = require("./routes/userGroupsRoutes");

const permissionCategoriesRoutes = require("./routes/permissionCategoriesRoutes");

const groupPermissionsRoutes = require("./routes/groupPermissionsRoutes");

const permissionsAccessRoutes = require("./routes/permissionsAccessRoutes");

const userRoutes = require("./routes/userRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const appRoutes = require("./routes/appRoutes");

const suguanRoutes = require("./routes/suguanRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const locationRoutes = require("./routes/locationsRoutes");

// const reminderRoutes = require("./routes/reminderRoutes");

const personnelsRoutes = require("./routes/personnelsRoutes"); // Replace with actual route file path
const personnelContactsRoutes = require("./routes/personnelContactsRoutes");
const personnelAddressesRoutes = require("./routes/personnelAddressesRoutes");
const personnelGovIDsRoutes = require("./routes/personnelGovIDsRoutes");
const familyMembersRoutes = require("./routes/familyMembersRoutes");

const departmentRoutes = require("./routes/departmentRoutes");
const sectionsRoutes = require("./routes/sectionsRoutes");
const subsectionsRoutes = require("./routes/subsectionsRoutes");
const designationsRoutes = require("./routes/designationsRoutes");
const districtsRoutes = require("./routes/districtsRoutes");

const citizenshipsRoutes = require("./routes/citizenshipsRoutes");
const nationalitiesRoutes = require("./routes/nationalitiesRoutes");
const languagesRoutes = require("./routes/languagesRoutes");
const contactTypeInfoRoutes = require("./routes/contactTypeInfoRoutes");
const governmentIssuedIdRoutes = require("./routes/governmentIssuedIDRoutes");
const personnelDocumentsRoutes = require("./routes/PersonnelDocumentsRoutes");

const educationalBackgroundRoutes = require("./routes/educationalBackgroundRoutes");
const workExperienceRoutes = require("./routes/workExperienceRoutes");

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // Increased limit to handle Base64 images
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(userRoutes);
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(ldapRoutes);
app.use(appRoutes);
app.use(suguanRoutes);
app.use(eventsRoutes);
app.use(locationRoutes);
// app.use(reminderRoutes);

app.use(personnelsRoutes);
app.use(personnelContactsRoutes);
app.use(personnelAddressesRoutes);
app.use(personnelGovIDsRoutes);
app.use(familyMembersRoutes);

// Management
app.use(departmentRoutes);
app.use(sectionsRoutes);
app.use(subsectionsRoutes);
app.use(designationsRoutes);
app.use(districtsRoutes);
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

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server is running on ${IP_Address}:${PORT}`);
});
