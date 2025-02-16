const { Op } = require("sequelize");
const sequelize = require("../config/database"); // Import the Sequelize instance
const Setting = require("../models/Setting"); // Import your Setting model

// ✅ Fetch Drag & Drop Setting
exports.getDragDropSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: { setting_key: "enableDragDropMobile" },
    });

    res.json({ enableDragDropMobile: setting?.setting_value === "true" });
  } catch (error) {
    console.error("❌ Error fetching Drag & Drop setting:", error);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
};

// ✅ Update Drag & Drop Setting
exports.updateDragDropSetting = async (req, res) => {
  const { enableDragDropMobile } = req.body;

  if (typeof enableDragDropMobile !== "boolean") {
    return res
      .status(400)
      .json({ error: "Invalid data format. Expecting a boolean value." });
  }

  try {
    console.log(`Updating Drag & Drop setting to: ${enableDragDropMobile}`);

    const [updated] = await Setting.update(
      { setting_value: enableDragDropMobile ? "true" : "false" },
      { where: { setting_key: "enableDragDropMobile" } }
    );

    if (updated === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    res.json({ message: "Drag & Drop setting updated successfully." });
  } catch (error) {
    console.error("❌ Error updating Drag & Drop setting:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
};
