// controllers/appController.js
const App = require("../models/Apps");
const ApplicationType = require("../models/ApplicationType");
const { Op } = require("sequelize");
const sequelize = require("../config/database"); // Ensure you import sequelize if needed for raw queries

// Get all apps
exports.getAllApps = async (req, res) => {
  try {
    const apps = await App.findAll({
      include: [
        {
          model: ApplicationType,
          as: "applicationType",
          attributes: ["name"],
        },
      ],
      order: [
        ["app_type", "ASC"], // Sort by application type
        ["name", "ASC"], // Then by name
      ],
    });

    const transformedApps = apps.map((app) => ({
      id: app.id,
      name: app.name,
      url: app.url,
      description: app.description,
      icon: app.icon,
      app_type: app.app_type,
      app_type_name: app.applicationType ? app.applicationType.name : "Others",
    }));

    res.json(transformedApps);
  } catch (error) {
    console.error("Error fetching apps:", error);
    res.status(500).json({ message: "Database error", error });
  }
};

exports.getAppsWithTypes = async (req, res) => {
  try {
    const apps = await App.findAll({
      include: [
        {
          model: ApplicationType,
          as: "appType",
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["app_type", "ASC"],
        ["name", "ASC"],
      ],
    });

    // Categorize apps by application type
    const categorizedApps = apps.reduce((acc, app) => {
      const category = app.appType?.name || "Others";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: app.id,
        name: app.name,
        url: app.url,
        description: app.description,
        icon: app.icon,
        app_type: app.app_type,
      });
      return acc;
    }, {});

    res.status(200).json(categorizedApps);
  } catch (error) {
    console.error("Error fetching categorized apps:", error);
    res.status(500).json({ message: "Error fetching apps", error });
  }
};

// Get available apps for the logged-in user and categorize them
exports.getAvailableApps1 = async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user ID provided" });
  }

  try {
    // Fetch all app types dynamically
    const appTypes = await sequelize.query(
      `SELECT id, name FROM applicationtypes ORDER BY id ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Fetch available apps for the logged-in user
    const availableApps = await sequelize.query(
      `
      SELECT apps.*, apps.app_type
      FROM apps
      INNER JOIN available_apps ON apps.id = available_apps.app_id
      WHERE available_apps.user_id = :userId
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Categorize apps dynamically based on `app_type`
    let categorizedApps = {};
    appTypes.forEach((type) => {
      categorizedApps[type.name] = availableApps.filter(
        (app) => app.app_type === type.id
      );
    });

    //console.log("Fetched Categorized Apps:", categorizedApps);
    res.json(categorizedApps);
  } catch (error) {
    console.error("Error fetching available apps for user:", error);
    res.status(500).json({ message: "Database error" });
  }
};

exports.getAvailableApps = async (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user ID provided" });
  }

  try {
    // Fetch all app types dynamically
    const appTypes = await sequelize.query(
      `SELECT id, name FROM applicationtypes ORDER BY id ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Fetch available apps for the logged-in user
    const availableApps = await sequelize.query(
      `
      SELECT apps.*, apps.app_type 
      FROM apps 
      INNER JOIN available_apps ON apps.id = available_apps.app_id 
      WHERE available_apps.user_id = :userId
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Fetch files data (filename and generated_code)
    const filesData = await sequelize.query(
      `SELECT filename, url, generated_code FROM files`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // ✅ Fetch phone_directories data (include name and phone_name)
    const phoneDirectoryData = await sequelize.query(
      `SELECT name, phone_name, prefix, extension, dect_number FROM phone_directories`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // Combine available apps and files into a single structure
    const combinedData = [
      ...availableApps.map((app) => ({
        ...app,
        type: "app", // Mark apps for distinction
      })),
      ...filesData.map((file) => ({
        ...file,
        type: "file", // Mark files for distinction
      })),
      ...phoneDirectoryData.map((directory) => ({
        ...directory,
        type: "phone_directory",
      })),
    ];

    // Categorize apps dynamically based on `app_type`
    let categorizedApps = {};

    // Initialize the categorizedApps object with categories based on appTypes
    appTypes.forEach((type) => {
      categorizedApps[type.name] = combinedData.filter(
        (item) => item.type === "app" && item.app_type === type.id // Filter for apps by app_type
      );
    });

    // Add files to a "Files" category
    categorizedApps["Files"] = combinedData.filter(
      (item) => item.type === "file"
    );

    // ✅ Add phone directories to "Phone Directories" category
    categorizedApps["Phone Directories"] = combinedData.filter(
      (item) => item.type === "phone_directory"
    );

    // Send the dynamically categorized response
    res.json(categorizedApps);

    console.log("Categorized Apps and Files:", categorizedApps);
  } catch (error) {
    console.error("Error fetching available apps for user:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Add a new app
exports.addApp = async (req, res) => {
  const { name, url, description, icon, app_type } = req.body;

  if (!name || !url || !app_type) {
    return res.status(400).json({
      message: "Name, URL, and App Type fields are required.",
    });
  }

  // ✅ URL validation regex pattern allowing full URLs with paths, file extensions, and query params
  const urlPattern =
    /^(https?:\/\/)(localhost|[a-zA-Z0-9.-]+)(:\d+)?(\/[\w-./?%&=]*)?$/;

  if (!urlPattern.test(url)) {
    return res.status(400).json({
      message: "Invalid URL format. Must be a valid http or https link.",
    });
  }

  try {
    // ✅ Check for existing app with the same name or URL
    const existingApp = await App.findOne({
      where: { [Op.or]: [{ name }, { url }] },
    });

    if (existingApp) {
      return res.status(400).json({
        message: "An app with the same name or URL already exists.",
      });
    }

    // ✅ Create new app if no duplicates found
    const newApp = await App.create({ name, url, description, icon, app_type });
    res.status(201).json({ message: "App added successfully.", app: newApp });
  } catch (error) {
    console.error("Error adding app:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Update an existing app
exports.updateApp = async (req, res) => {
  const appId = req.params.id;
  const { name, url, description, icon, app_type } = req.body;

  if (!name || !url || !app_type) {
    return res.status(400).json({
      message: "Name, URL, and App Type fields are required.",
    });
  }

  // ✅ URL validation regex (same as `addApp`)
  const urlPattern =
    /^(https?:\/\/)(localhost|[a-zA-Z0-9.-]+)(:\d+)?(\/[\w-./?%&=]*)?$/;

  if (!urlPattern.test(url)) {
    return res.status(400).json({
      message: "Invalid URL format. Must be a valid http or https link.",
    });
  }

  try {
    // ✅ Check if another app (excluding the current one) has the same name or URL
    const existingApp = await App.findOne({
      where: {
        [Op.or]: [{ name }, { url }],
        id: { [Op.ne]: appId }, // Ensure it's not the same app being updated
      },
    });

    if (existingApp) {
      return res.status(400).json({
        message: "Another app with the same name or URL already exists.",
      });
    }

    const [updated] = await App.update(
      { name, url, description, icon, app_type },
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
