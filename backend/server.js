require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const IP_Address = process.env.REACT_IP_ADDRESS;

const app = express();
const PORT = 5000;

const userRoutes = require("./routes/userRoutes");
const ldapRoutes = require("./routes/ldapRoutes");
const appRoutes = require("./routes/appRoutes");
// const eventRoutes = require("./routes/eventRoutes");
const suguanRoutes = require("./routes/suguanRoutes");
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

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Increased limit to handle Base64 images

app.use(userRoutes);
app.use(ldapRoutes);
app.use(appRoutes);
// app.use(eventRoutes);
app.use(suguanRoutes);
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
app.use("/uploads", express.static("uploads"));

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server is running on ${IP_Address}:${PORT}`);
});
