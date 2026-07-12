// controllers/appController.js

// ✅ Import Redis client (DISABLED)
// const { client: redisClient, connectRedis } = require("../config/redisClient");

// Connect Redis once (DISABLED)
// connectRedis().catch((err) => console.error("Redis connection failed:", err));


const App = require("../models/Apps");
const ApplicationType = require("../models/ApplicationType");
const { Op } = require("sequelize");
const sequelize = require("../config/database"); // Ensure you import sequelize if needed for raw queries
const UserGroupMapping = require("../models/UserGroupMapping");

const getAllApplicationTypes = () =>
  sequelize.query(`SELECT id, name FROM applicationtypes ORDER BY id ASC`, {
    type: sequelize.QueryTypes.SELECT,
  });

const getVisibleApplicationTypesForUser = async (userId) => {
  const groupMapping = await UserGroupMapping.findOne({
    where: { user_id: userId },
    attributes: ["group_id"],
  });

  if (!groupMapping?.group_id) {
    return getAllApplicationTypes();
  }

  try {
    return await sequelize.query(
      `
      SELECT at.id, at.name
      FROM applicationtypes at
      LEFT JOIN group_application_type_mappings gatm
        ON gatm.application_type_id = at.id
        AND gatm.group_id = :groupId
      WHERE COALESCE(gatm.is_visible, 1) = 1
      ORDER BY at.id ASC
      `,
      {
        replacements: { groupId: groupMapping.group_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  } catch (error) {
    if (error?.parent?.code === "ER_NO_SUCH_TABLE") {
      console.warn(
        "group_application_type_mappings table not found. Showing all application types.",
      );
      return getAllApplicationTypes();
    }
    throw error;
  }
};

const filterAppsByVisibleTypes = (apps, applicationTypes) => {
  const visibleTypeIds = new Set(applicationTypes.map((type) => Number(type.id)));
  return apps.filter(
    (app) =>
      visibleTypeIds.has(Number(app.app_type)) &&
      Number(app.is_active ?? 1) === 1,
  );
};

const serializeApp = (app, applicationTypeName = "Others") => ({
  id: app.id,
  name: app.name,
  url: app.url,
  description: app.description,
  icon: app.icon,
  app_type: app.app_type,
  is_active: Number(app.is_active ?? 1) === 1,
  app_type_name: applicationTypeName,
});

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
        ["is_active", "DESC"],
        ["app_type", "ASC"], // Sort by application type
        ["name", "ASC"], // Then by name
      ],
    });

    const accessCounts = await sequelize.query(
      `
      SELECT app_id, COUNT(DISTINCT user_id) AS access_count
      FROM available_apps
      GROUP BY app_id
      `,
      { type: sequelize.QueryTypes.SELECT },
    );
    const accessCountMap = new Map(
      accessCounts.map((row) => [Number(row.app_id), Number(row.access_count) || 0]),
    );

    const transformedApps = apps.map((app) =>
      ({
        ...serializeApp(app, app.applicationType ? app.applicationType.name : "Others"),
        access_count: accessCountMap.get(Number(app.id)) || 0,
      }),
    );

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
        ["is_active", "DESC"],
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
      acc[category].push(serializeApp(app, category));
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
    // Fetch only the app types visible to this user's group.
    const appTypes = await getVisibleApplicationTypesForUser(userId);

    const visibleTypeIds = appTypes.map((type) => Number(type.id));

    // Group visibility controls the dashboard. Show all apps inside visible app types.
    const availableApps = visibleTypeIds.length === 0
      ? []
      : filterAppsByVisibleTypes(await sequelize.query(
        `
        SELECT apps.*, apps.app_type
        FROM apps
        WHERE apps.app_type IN (:visibleTypeIds)
          AND COALESCE(apps.is_active, 1) = 1
        ORDER BY apps.app_type ASC, apps.name ASC
        `,
        {
          replacements: { visibleTypeIds },
          type: sequelize.QueryTypes.SELECT,
        }
      ), appTypes);

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
        AND COALESCE(apps.is_active, 1) = 1
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
        (item) => item.type === "app" && Number(item.app_type) === Number(type.id)
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

    // 1️⃣ CACHE REMOVED: Redis disabled
    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) { ... }

    console.log(`🧠 Fetching fresh available apps for user ${userId}...`);

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


    // Fetch only the app types visible to this user's group.
    const appTypes = await getVisibleApplicationTypesForUser(userId);

    // Fetch available apps for the logged-in user
    const availableApps = filterAppsByVisibleTypes(await sequelize.query(
      `
      SELECT apps.*, apps.app_type 
      FROM apps 
      INNER JOIN available_apps ON apps.id = available_apps.app_id 
      WHERE available_apps.user_id = :userId
        AND COALESCE(apps.is_active, 1) = 1
      `,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
      }
    ), appTypes);

    const baseUrl = process.env.REACT_APP_API_URL;
    // Fetch files data (filename and generated_code)
    // Fetch files data (filename, url, generated_code, thumbnail)
    let filesData = await sequelize.query(
      `
    SELECT id, filename, url, generated_code, thumbnail AS thumbnail_url 
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
  pd.id,
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
  p.personnel_id AS id,
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
        id: directory.id ? directory.id : `pd_gen_${Math.random()}`, // Ensure ID exists
        type: "phone_directory",
      })),
    ];

    // Categorize apps dynamically based on `app_type`
    let categorizedApps = {};

    // Initialize the categorizedApps object with categories based on appTypes
    appTypes.forEach((type) => {
      categorizedApps[type.name] = combinedData.filter(
        (item) => item.type === "app" && Number(item.app_type) === Number(type.id)
      );
    });

    // 🛡️ Fallback: Collect apps that passed validation but didn't match any specific App Type
    // This ensures apps with deleted/invalid types or active types not in the fetched list (if filtered) still show up.
    const knownTypeIds = new Set(appTypes.map((t) => Number(t.id)));
    const uncategorizedApps = combinedData.filter(
      (item) => item.type === "app" && !knownTypeIds.has(Number(item.app_type))
    );

    if (uncategorizedApps.length > 0) {
      if (!categorizedApps["Others"]) {
        categorizedApps["Others"] = [];
      }
      categorizedApps["Others"].push(...uncategorizedApps);
    }

    // Add files to a "Files" category
    categorizedApps["Files"] = combinedData.filter(
      (item) => item.type === "file"
    );

    // ✅ Add phone directories to "Phone Directories" category
    categorizedApps["Phone Directories"] = combinedData.filter(
      (item) => item.type === "phone_directory"
    );

    // 9️⃣ Cache Removed
    // await redisClient.set(cacheKey, JSON.stringify(categorizedApps), { EX: 3600 });
    // console.log(`✅ Cached available apps for user ${userId} in Redis`);

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
  const { name, url, description, icon, app_type, is_active } = req.body;

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
    const newApp = await App.create({
      name,
      url,
      description,
      icon,
      app_type,
      is_active: is_active ?? true,
    });
    res.status(201).json({ message: "App added successfully.", app: newApp });
  } catch (error) {
    console.error("Error adding app:", error);

    if (error?.name === "SequelizeUniqueConstraintError" || error?.parent?.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "An app with the same name or URL already exists.",
        error: error.parent?.sqlMessage || error.message,
      });
    }

    return res.status(500).json({
      message: "Database error",
      error: error.parent?.sqlMessage || error.message,
      code: error.parent?.code || error.code || null,
    });
  }
};

// Update an existing app
exports.updateApp = async (req, res) => {
  const appId = Number(req.params.id);
  const { name, url, description, icon, app_type, is_active } = req.body;

  if (!Number.isInteger(appId) || appId <= 0) {
    return res.status(400).json({ message: "Invalid app id." });
  }

  try {
    const currentApp = await App.findByPk(appId);
    if (!currentApp) {
      return res.status(404).json({ message: "App not found." });
    }

    const nextName = name ?? currentApp.name;
    const nextUrl = url ?? currentApp.url;
    const nextDescription = description ?? currentApp.description;
    const nextIcon = icon ?? currentApp.icon;
    const nextAppType = app_type ?? currentApp.app_type;
    const nextIsActive = is_active ?? currentApp.is_active;

    if (!nextName || !nextUrl || !nextAppType) {
      return res.status(400).json({
        message: "Name, URL, and App Type fields are required.",
      });
    }

    // ✅ URL validation regex (same as `addApp`)
    const urlPattern =
      /^(https?:\/\/)(localhost|[a-zA-Z0-9.-]+)(:\d+)?(\/[\w-./?%&=]*)?$/;

    if (!urlPattern.test(nextUrl)) {
      return res.status(400).json({
        message: "Invalid URL format. Must be a valid http or https link.",
      });
    }

    // ✅ Check if another app (excluding the current one) has the same name or URL
    const existingApp = await App.findOne({
      where: {
        [Op.or]: [{ name: nextName }, { url: nextUrl }],
        id: { [Op.ne]: appId }, // Ensure it's not the same app being updated
      },
    });

    if (existingApp) {
      return res.status(400).json({
        message: "Another app with the same name or URL already exists.",
      });
    }

    const [updated] = await App.update(
      {
        name: nextName,
        url: nextUrl,
        description: nextDescription,
        icon: nextIcon,
        app_type: nextAppType,
        is_active: nextIsActive,
      },
      { where: { id: appId } }
    );

    const updatedApp = await App.findByPk(appId);
    if (!updatedApp) {
      return res.status(404).json({ message: "App not found." });
    }

    if (!updated) {
      console.log(`App ${appId} save was a no-op; returning the current record.`);
    }

    res.json({ message: "App updated successfully.", app: updatedApp });
  } catch (error) {
    console.error("Error updating app:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete an app
exports.deleteApp = async (req, res) => {
  const appId = Number(req.params.id);

  if (!Number.isInteger(appId) || appId <= 0) {
    return res.status(400).json({ message: "Invalid app id." });
  }

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

// Parses a route :id param into a positive integer, or returns null.
const parsePositiveIntParam = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Get which users currently have access to a given app
exports.getAppAccess = async (req, res) => {
  const appId = parsePositiveIntParam(req.params.id);
  if (!appId) {
    return res.status(400).json({ message: "Invalid app id." });
  }

  try {
    const app = await App.findByPk(appId);
    if (!app) {
      console.warn(`App access requested for missing app id ${appId}. Returning empty access list.`);
      return res.status(200).json({ userIds: [] });
    }

    const rows = await sequelize.query(
      "SELECT DISTINCT user_id FROM available_apps WHERE app_id = :appId ORDER BY user_id",
      { replacements: { appId }, type: sequelize.QueryTypes.SELECT }
    );

    res.json({ userIds: rows.map((row) => row.user_id) });
  } catch (error) {
    console.error("Error fetching app access:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Replace which users have access to a given app (delete-then-insert, mirroring
// the existing per-user "available apps" save in userRoutes.js, just flipped
// to be scoped by app_id instead of user_id). Runs inside a transaction so a
// failed insert can't leave the app with zero access rows, and silently drops
// any user id that no longer exists rather than failing the whole save.
exports.updateAppAccess = async (req, res) => {
  const appId = parsePositiveIntParam(req.params.id);
  const { userIds } = req.body;

  if (!appId) {
    return res.status(400).json({ message: "Invalid app id." });
  }

  if (!Array.isArray(userIds) || !userIds.every((id) => Number.isInteger(Number(id)))) {
    return res.status(400).json({ message: "userIds must be an array of user IDs." });
  }

  const requestedUserIds = [...new Set(userIds.map((id) => Number(id)))];

  const transaction = await sequelize.transaction();
  try {
    const app = await App.findByPk(appId, { transaction });
    if (!app) {
      await transaction.rollback();
      return res.status(404).json({ message: "App not found." });
    }

    let validUserIds = [];
    if (requestedUserIds.length > 0) {
      const existingUsers = await sequelize.query(
        "SELECT ID AS id FROM users WHERE ID IN (:requestedUserIds)",
        { replacements: { requestedUserIds }, type: sequelize.QueryTypes.SELECT, transaction }
      );
      validUserIds = existingUsers.map((row) => Number(row.id));

      const skipped = requestedUserIds.filter((id) => !validUserIds.includes(id));
      if (skipped.length > 0) {
        console.warn(`updateAppAccess: skipping unknown user id(s) [${skipped.join(", ")}] for app ${appId}.`);
      }
    }

    await sequelize.query("DELETE FROM available_apps WHERE app_id = :appId", {
      replacements: { appId },
      transaction,
    });

    if (validUserIds.length > 0) {
      await sequelize.getQueryInterface().bulkInsert(
        "available_apps",
        validUserIds.map((userId) => ({ user_id: userId, app_id: appId })),
        { transaction }
      );
    }

    await transaction.commit();
    res.json({ message: "App access updated successfully.", userIds: validUserIds });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating app access:", error);
    res.status(500).json({ message: "Database error" });
  }
};
