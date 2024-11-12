const appModel = require("../models/Apps");

// Get all apps
exports.getAllApps = (req, res) => {
  appModel.getAllApps((err, results) => {
    if (err) {
      console.error("Error fetching apps:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
};

// Get available apps for the logged-in user
exports.getAvailableApps = (req, res) => {
  const userId = req.headers["x-user-id"];
  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user ID provided" });
  }

  appModel.getAvailableApps(userId, (err, results) => {
    if (err) {
      console.error("Error fetching available apps for user:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results || []);
  });
};

// Add a new app
exports.addApp = (req, res) => {
  const { name, url, description, icon } = req.body;
  if (!name || !url || !description) {
    return res
      .status(400)
      .json({ message: "All fields (name, url, description) are required." });
  }

  appModel.addApp({ name, url, description, icon }, (err, result) => {
    if (err) {
      console.error("Error adding app:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.status(201).json({ message: "App added successfully.", app: result });
  });
};

// Update an existing app
exports.updateApp = (req, res) => {
  const appId = req.params.id;
  const { name, url, description, icon } = req.body;
  if (!name || !url) {
    return res
      .status(400)
      .json({ message: "Name and URL fields are required." });
  }

  appModel.updateApp(appId, { name, url, description, icon }, (err, result) => {
    if (err) {
      console.error("Error updating app:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (!result) {
      return res.status(404).json({ message: "App not found." });
    }
    res.json({ message: "App updated successfully.", app: result });
  });
};

// Delete an app
exports.deleteApp = (req, res) => {
  const appId = req.params.id;

  appModel.deleteApp(appId, (err, result) => {
    if (err) {
      console.error("Error deleting app:", err);
      return res.status(500).json({ message: "Database error" });
    }
    if (!result) {
      return res.status(404).json({ message: "App not found." });
    }
    res.status(200).json({ message: "App deleted successfully." });
  });
};
