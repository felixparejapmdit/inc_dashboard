// controllers/appController.js

// ✅ Import Redis client
const { client: redisClient, connectRedis } = require("../config/redisClient");

// Connect Redis once
connectRedis().catch((err) => console.error("Redis connection failed:", err));


const App = require("../models/Apps");
const ApplicationType = require("../models/ApplicationType");
const { Op } = require("sequelize");
const sequelize = require("../config/database"); // Ensure you import sequelize if needed for raw queries
const UserGroupMapping = require("../models/UserGroupMapping");

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


exports.getAvailableApps2 = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    // ✅ Validate userId first before making any DB calls
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user ID provided" });
    }

    // ✅ Check if the user is VIP (Group ID = 2)
    const isVIP = await UserGroupMapping.findOne({
      where: { user_id: userId, group_id: 2 },
    });

    // ✅ Fetch all app types dynamically
    const appTypes = await sequelize.query(
      `SELECT id, name FROM applicationtypes ORDER BY id ASC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    // ✅ Fetch available apps for the logged-in user
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

    const baseUrl = process.env.REACT_APP_API_URL;

    // ✅ Fetch files data (filename, url, generated_code, thumbnail)
    let filesData = await sequelize.query(
      `
      SELECT filename, url, generated_code, thumbnail AS thumbnail_url 
      FROM files
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    // ✅ Normalize thumbnail paths
    filesData = filesData.map((file) => ({
      ...file,
      thumbnail_url: file.thumbnail_url
        ? `${baseUrl}/${file.thumbnail_url.replace(/\\/g, "/")}`
        : null,
      type: "file",
    }));

    // ✅ Build Phone Directory Query with VIP filter
    const query = `
      -- First Query: Matched phone directories
      SELECT 
        pd.name, 
        pd.phone_name,
        pd.prefix, 
        pd.extension, 
        pd.dect_number, 
        pi.image_url AS avatar, 
        p.personnel_id
      FROM phone_directories pd
      LEFT JOIN personnels p 
        ON (
          pd.name LIKE CONCAT('%', SUBSTRING_INDEX(p.givenname, ' ', 1), '%', p.surname_husband, '%') 
          OR 
          pd.name LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(p.givenname, ' ', 2), ' ', -1), '%', p.surname_husband, '%')
        )
      LEFT JOIN personnel_images pi 
        ON pi.personnel_id = p.personnel_id 
        AND pi.type = '2x2 Picture'
      WHERE pd.extension IS NOT NULL
      ${isVIP ? "" : 'AND pd.location != "VIP Area"'}

      UNION ALL

      -- Second Query: Avoid duplicates
      SELECT 
        CONCAT(p.givenname, ' ', p.surname_husband) AS name,
        MAX(pd.phone_name) AS phone_name,
        MAX(pd.prefix) AS prefix, 
        MAX(pd.extension) AS extension, 
        MAX(pd.dect_number) AS dect_number, 
        MAX(pi.image_url) AS avatar, 
        p.personnel_id
      FROM personnels p
      LEFT JOIN personnel_images pi 
        ON pi.personnel_id = p.personnel_id 
        AND pi.type = '2x2 Picture'
      LEFT JOIN personnel_contacts pc 
        ON pc.personnel_id = p.personnel_id
      LEFT JOIN phone_directories pd 
        ON (
          pd.name LIKE CONCAT('%', SUBSTRING_INDEX(p.givenname, ' ', 1), '%', p.surname_husband, '%') 
          OR pd.name LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(p.givenname, ' ', 2), ' ', -1), '%', p.surname_husband, '%')
          OR (pc.contact_location = pd.location AND pc.extension = pd.extension)
        )
      WHERE 
        -- 1. Exclude duplicates
        NOT EXISTS (
          SELECT 1 FROM phone_directories pd2
          WHERE pd2.extension IS NOT NULL AND (
            REPLACE(SUBSTRING_INDEX(pd2.name, ' ', 1), '-', '') = REPLACE(SUBSTRING_INDEX(p.givenname, ' ', 1), '-', '')
            AND SUBSTRING_INDEX(pd2.name, ' ', -1) = p.surname_husband
          )
        )
        AND NOT EXISTS (
          SELECT 1 FROM phone_directories pd5
          WHERE pd5.extension IS NOT NULL
            AND REPLACE(SUBSTRING_INDEX(SUBSTRING_INDEX(p.givenname, ' ', 2), ' ', -1), '-', '') = REPLACE(SUBSTRING_INDEX(pd5.name, ' ', 1), '-', '')
            AND p.surname_husband = SUBSTRING_INDEX(pd5.name, ' ', -1)
        )
        AND NOT EXISTS (
          SELECT 1 FROM phone_directories pd6
          WHERE pd6.extension IS NOT NULL
            AND TRIM(REPLACE(CONCAT(p.givenname, ' ', p.surname_husband), '-', '')) = TRIM(REPLACE(pd6.name, '-', ''))
        )
        AND NOT EXISTS (
          SELECT 1 FROM phone_directories pd7
          LEFT JOIN personnels p7 
            ON (
              pd7.name LIKE CONCAT('%', SUBSTRING_INDEX(p7.givenname, ' ', 1), '%', p7.surname_husband, '%') 
              OR pd7.name LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(p7.givenname, ' ', 2), ' ', -1), '%', p7.surname_husband, '%')
            )
          WHERE pd7.extension IS NOT NULL
            AND p7.personnel_id = p.personnel_id
            AND pd7.phone_name = CONCAT(p.givenname, ' ', p.surname_husband)
        )
        ${isVIP ? "" : 'AND pd.location != "VIP Area"'}
      GROUP BY p.personnel_id, p.givenname, p.surname_husband
    `;

    const phoneDirectoryData = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    // ✅ Combine apps, files, and phone directories into one structure
    const combinedData = [
      ...availableApps.map((app) => ({ ...app, type: "app" })),
      ...filesData,
      ...phoneDirectoryData.map((directory) => ({
        ...directory,
        type: "phone_directory",
      })),
    ];

    // ✅ Categorize data dynamically
    let categorizedApps = {};

    appTypes.forEach((type) => {
      categorizedApps[type.name] = combinedData.filter(
        (item) => item.type === "app" && item.app_type === type.id
      );
    });

    categorizedApps["Files"] = combinedData.filter((item) => item.type === "file");
    categorizedApps["Phone Directories"] = combinedData.filter(
      (item) => item.type === "phone_directory"
    );

    // ✅ Send the response
    res.json(categorizedApps);
  } catch (error) {
    console.error("Error fetching available apps for user:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};


exports.getAvailableApps = async (req, res) => {
  const userId = req.headers["x-user-id"];

  console.log("Received user ID in header:", userId);
   // ✅ Validate early before making any Sequelize queries
    if (!userId || userId === "undefined" || userId === "null") {
      console.error("❌ Missing or invalid user ID:", userId);
      return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

     const cacheKey = `available_apps_${userId}`;
try {

   // 1️⃣ Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`📦 Serving available apps for user ${userId} from Redis cache`);
      return res.status(200).json(JSON.parse(cachedData));
    }

  const isVIP = await UserGroupMapping.findOne({
    where: {
      user_id: userId,
      group_id: 2,
    },
  });

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user ID provided" });
  }

  
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

    const baseUrl = process.env.REACT_APP_API_URL;
    // Fetch files data (filename and generated_code)
// Fetch files data (filename, url, generated_code, thumbnail)
let filesData = await sequelize.query(
  `
    SELECT filename, url, generated_code, thumbnail AS thumbnail_url 
    FROM files
  `,
  {
    type: sequelize.QueryTypes.SELECT,
  }
);

// Normalize thumbnail path
filesData = filesData.map((file) => ({
  ...file,
  thumbnail_url: file.thumbnail_url
    ? `${baseUrl}/${file.thumbnail_url.replace(/\\/g, '/')}`
    : null,
  type: "file", // tag it now so you don't repeat below
}));

    // Base query
    // let query = `
    //   SELECT name, phone_name, prefix, extension, dect_number
    //   FROM phone_directories
    // `;

    // Build query conditionally
    let query = `
-- First Query: Matched phone directories
SELECT 
  pd.name, 
  pd.phone_name,
  pd.prefix, 
  pd.extension, 
  pd.dect_number, 
  pi.image_url AS avatar, 
  p.personnel_id
FROM 
  phone_directories pd
LEFT JOIN 
  personnels p 
    ON (
      pd.name LIKE CONCAT('%', SUBSTRING_INDEX(p.givenname, ' ', 1), '%', p.surname_husband, '%') 
      OR 
      pd.name LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(p.givenname, ' ', 2), ' ', -1), '%', p.surname_husband, '%')
    )
LEFT JOIN 
  personnel_images pi 
    ON pi.personnel_id = p.personnel_id 
    AND pi.type = '2x2 Picture'
WHERE 
  pd.extension IS NOT NULL
  ${isVIP ? "" : 'AND pd.location != "VIP Area"'}

UNION ALL

-- Second Query: Avoid duplicates
SELECT 
  CONCAT(p.givenname, ' ', p.surname_husband) AS name,
  MAX(pd.phone_name) AS phone_name,
  MAX(pd.prefix) AS prefix, 
  MAX(pd.extension) AS extension, 
  MAX(pd.dect_number) AS dect_number, 
  MAX(pi.image_url) AS avatar, 
  p.personnel_id
FROM 
  personnels p
LEFT JOIN 
  personnel_images pi 
    ON pi.personnel_id = p.personnel_id 
    AND pi.type = '2x2 Picture'
LEFT JOIN 
  personnel_contacts pc 
    ON pc.personnel_id = p.personnel_id
LEFT JOIN 
  phone_directories pd 
    ON (
      pd.name LIKE CONCAT('%', SUBSTRING_INDEX(p.givenname, ' ', 1), '%', p.surname_husband, '%') 
      OR pd.name LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(p.givenname, ' ', 2), ' ', -1), '%', p.surname_husband, '%')
      OR (pc.contact_location = pd.location AND pc.extension = pd.extension)
    )
WHERE 
  -- 1. Exclude if first name + surname match (hyphen-safe)
  NOT EXISTS (
    SELECT 1
    FROM phone_directories pd2
    WHERE 
      pd2.extension IS NOT NULL AND (
        REPLACE(SUBSTRING_INDEX(pd2.name, ' ', 1), '-', '') = REPLACE(SUBSTRING_INDEX(p.givenname, ' ', 1), '-', '')
        AND SUBSTRING_INDEX(pd2.name, ' ', -1) = p.surname_husband
      )
  )

  -- 2. Exclude if second part of givenname + surname match
  AND NOT EXISTS (
    SELECT 1
    FROM phone_directories pd5
    WHERE 
      pd5.extension IS NOT NULL
      AND REPLACE(SUBSTRING_INDEX(SUBSTRING_INDEX(p.givenname, ' ', 2), ' ', -1), '-', '') = REPLACE(SUBSTRING_INDEX(pd5.name, ' ', 1), '-', '')
      AND p.surname_husband = SUBSTRING_INDEX(pd5.name, ' ', -1)
  )

  -- 3. Exclude if full name (givenname + surname_husband) already exists in pd.name
  AND NOT EXISTS (
    SELECT 1
    FROM phone_directories pd6
    WHERE 
      pd6.extension IS NOT NULL
      AND TRIM(REPLACE(CONCAT(p.givenname, ' ', p.surname_husband), '-', '')) = TRIM(REPLACE(pd6.name, '-', ''))
  )
-- 4. Exclude if phone_name and personnel_id already exist in matched list
AND NOT EXISTS (
  SELECT 1
  FROM phone_directories pd7
  LEFT JOIN personnels p7 
    ON (
      pd7.name LIKE CONCAT('%', SUBSTRING_INDEX(p7.givenname, ' ', 1), '%', p7.surname_husband, '%') 
      OR pd7.name LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(p7.givenname, ' ', 2), ' ', -1), '%', p7.surname_husband, '%')
    )
  WHERE 
    pd7.extension IS NOT NULL
    AND p7.personnel_id = p.personnel_id
    AND pd7.phone_name = CONCAT(p.givenname, ' ', p.surname_husband)
)

  ${isVIP ? "" : 'AND pd.location != "VIP Area"'}
GROUP BY 
  p.personnel_id, p.givenname, p.surname_husband
`;

    // Execute query
    const phoneDirectoryData = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

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

    // 9️⃣ Cache the result in Redis for 5 minutes
    await redisClient.set(cacheKey, JSON.stringify(categorizedApps), { EX: 3600 });
    console.log(`✅ Cached available apps for user ${userId} in Redis`);

    // Send the dynamically categorized response
    res.json(categorizedApps);

    //console.log("Categorized Apps and Files:", categorizedApps);
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
