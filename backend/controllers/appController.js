// controllers/appController.js
const App = require("../models/Apps");
const { Op } = require("sequelize");
const sequelize = require("../config/database"); // Ensure you import sequelize if needed for raw queries

// Get all apps
exports.getAllApps = async (req, res) => {
  try {
    const apps = await App.findAll();
    res.json(apps);
  } catch (error) {
    console.error("Error fetching apps:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Get available apps for the logged-in user
exports.getAvailableApps = async (req, res) => {
  const userId = req.headers["x-user-id"]; // Retrieve user ID from custom header
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user ID provided" });
  }

  try {
    // Fetch available apps for the logged-in user using a JOIN on available_apps table
    const availableApps = await sequelize.query(
      `
      SELECT apps.* 
      FROM apps 
      INNER JOIN available_apps ON apps.id = available_apps.app_id 
      WHERE available_apps.user_id = :userId
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(availableApps);
  } catch (error) {
    console.error("Error fetching available apps for user:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Add a new app
exports.addApp = async (req, res) => {
  const { name, url, description, icon } = req.body;

  if (!name || !url || !description) {
    return res
      .status(400)
      .json({ message: "All fields (name, url, description) are required." });
  }

  // Updated URL validation regex pattern to allow localhost and ports
  const urlPattern =
    /^(https?:\/\/)(localhost|[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:\d+)?(\/[\w-]*)*\/?$/;
  if (!urlPattern.test(url)) {
    return res
      .status(400)
      .json({ message: "Invalid URL format. Must start with http or https." });
  }

  try {
    const newApp = await App.create({ name, url, description, icon });
    res.status(201).json({ message: "App added successfully.", app: newApp });
  } catch (error) {
    console.error("Error adding app:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Update an existing app
exports.updateApp = async (req, res) => {
  const appId = req.params.id;
  const { name, url, description, icon } = req.body;

  if (!name || !url) {
    return res
      .status(400)
      .json({ message: "Name and URL fields are required." });
  }

  try {
    const [updated] = await App.update(
      { name, url, description, icon },
      { where: { id: appId } }
    );

    if (!updated) {
      return res.status(404).json({ message: "App not found." });
    }

    const updatedApp = await App.findByPk(appId);
    res.json({ message: "App updated successfully.", app: updatedApp });
  } catch (error) {
    console.error("Error updating app:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete an app
exports.deleteApp = async (req, res) => {
  const appId = req.params.id;

  try {
    const deleted = await App.destroy({ where: { id: appId } });
    if (!deleted) {
      return res.status(404).json({ message: "App not found." });
    }
    res.status(200).json({ message: "App deleted successfully." });
  } catch (error) {
    console.error("Error deleting app:", error);
    res.status(500).json({ message: "Database error" });
  }
};
