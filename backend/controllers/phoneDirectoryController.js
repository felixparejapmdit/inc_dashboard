const PhoneDirectory = require("../models/PhoneDirectory");

const { Sequelize, Op, fn, col } = require("sequelize"); // Import Sequelize and Op

const sequelize = require("../config/database"); // Ensure Sequelize instance is imported

// Get all entries
exports.getPhoneDirectories = async (req, res) => {
  try {
    const entries = await PhoneDirectory.findAll({ order: [["id", "ASC"]] });
    res.json(entries);
  } catch (error) {
    console.error("❌ Error fetching entries:", error);
    res.status(500).json({ message: "Database error" });
  }
};

exports.getUniqueNames = async (req, res) => {
  try {
    const names = await PhoneDirectory.findAll({
      attributes: [[sequelize.fn("DISTINCT", sequelize.col("name")), "name"]],
      order: [["name", "ASC"]],
    });

    console.log(names); // Check the structure here

    res.json(names.map((entry) => entry.name));
  } catch (error) {
    console.error("❌ Error fetching names:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// ✅ Import Phone Directory Entries
exports.importPhoneDirectory = async (req, res) => {
  try {
    const { data } = req.body;

    let insertedCount = 0;
    let skippedCount = 0;

    for (const row of data) {
      const { name, extension } = row;

      // Validate required fields
      if (!name || !extension) {
        continue; // skip invalid rows
      }

      const existingEntry = await PhoneDirectory.findOne({
        where: {
          name: row.name,
          extension: row.extension,
        },
      });

      if (!existingEntry) {
        await PhoneDirectory.create(row);
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    res.status(200).json({
      message: "Import complete.",
      inserted: insertedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("❌ Error importing phone directory:", error);
    res.status(500).json({ message: "Error importing data." });
  }
};

// Create new entry
exports.createPhoneDirectory = async (req, res) => {
  const {
    name,
    location,
    prefix,
    extension,
    phone_name,
    dect_number,
    is_active,
  } = req.body;

  if (!name || !location || !prefix || !extension || !phone_name) {
    return res
      .status(400)
      .json({ message: "All fields except DECT number are required" });
  }

  try {
    const newEntry = await PhoneDirectory.create({
      name,
      location,
      prefix,
      extension,
      phone_name,
      dect_number,
      is_active,
    });

    res.status(201).json({
      message: "Phone directory entry added successfully",
      data: newEntry,
    });
  } catch (error) {
    console.error("❌ Error creating entry:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};

// Update entry
exports.updatePhoneDirectory = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    location,
    prefix,
    extension,
    phone_name,
    dect_number,
    is_active,
  } = req.body;

  try {
    const entry = await PhoneDirectory.findByPk(id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    Object.assign(entry, {
      name: name ?? entry.name,
      location: location ?? entry.location,
      prefix: prefix ?? entry.prefix,
      extension: extension ?? entry.extension,
      phone_name: phone_name ?? entry.phone_name,
      dect_number: dect_number ?? entry.dect_number,
      is_active: is_active ?? entry.is_active,
    });

    await entry.save();
    res.json({ message: "Entry updated", data: entry });
  } catch (error) {
    console.error("❌ Error updating entry:", error);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete entry
exports.deletePhoneDirectory = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await PhoneDirectory.findByPk(id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await entry.destroy();
    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting entry:", error);
    res.status(500).json({ message: "Database error" });
  }
};
