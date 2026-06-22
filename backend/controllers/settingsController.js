const Setting = require("../models/Setting");

// Fetch the current Drag & Drop setting
exports.getDragDropSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: { setting_key: "enableDragDropMobile" },
    });

    res.json({ enableDragDropMobile: setting?.setting_value === "true" });
  } catch (error) {
    console.error("Error fetching Drag & Drop setting:", error);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
};

// Update the Drag & Drop setting
exports.updateDragDropSetting = async (req, res) => {
  const { enableDragDropMobile } = req.body;

  if (typeof enableDragDropMobile !== "boolean") {
    return res.status(400).json({
      error: "Invalid data format. Expecting a boolean value.",
    });
  }

  try {
    const settingValue = enableDragDropMobile ? "true" : "false";

    const [updated] = await Setting.update(
      { setting_value: settingValue },
      { where: { setting_key: "enableDragDropMobile" } }
    );

    if (updated === 0) {
      await Setting.create({
        setting_key: "enableDragDropMobile",
        setting_value: settingValue,
      });
    }

    res.json({ message: "Drag & Drop setting updated successfully." });
  } catch (error) {
    console.error("Error updating Drag & Drop setting:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
};
