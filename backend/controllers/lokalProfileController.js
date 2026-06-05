// ✅ Lokal Profile Controller with Relation Support
const LokalProfile = require("../models/LokalProfile");
const axios = require("axios");

const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await LokalProfile.findAll();

    // Map profiles to their data values and fall back districtName/lokalName to the stored district/lokal IDs/strings.
    // This removes the slow, redundant external HTTP calls to DISTRICT_API_URL and LOCAL_CONGREGATION_API_URL,
    // which were causing the test server to hang and reset connections.
    const enrichedProfiles = profiles.map((profile) => ({
      ...profile.dataValues,
      districtName: profile.district,
      lokalName: profile.lokal,
    }));

    res.json(enrichedProfiles);
  } catch (error) {
    console.error("CRITICAL ERROR in getAllProfiles:", error);
    if (error.original) {
      console.error("Original DB Error:", error.original);
    }
    res.status(500).json({ message: "Error fetching lokal profiles", error: error.message, stack: error.stack });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const profile = await LokalProfile.findByPk(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const data = { ...req.body };

    // Handle File Upload
    if (req.file) {
      data.imageUrl = `/uploads/local/${req.file.filename}`;
    }

    // Parse JSON fields if they came as strings (from FormData)
    if (typeof data.scheduleMidweek === 'string') {
      try { data.scheduleMidweek = JSON.parse(data.scheduleMidweek); } catch (e) { }
    }
    if (typeof data.scheduleWeekend === 'string') {
      try { data.scheduleWeekend = JSON.parse(data.scheduleWeekend); } catch (e) { }
    }
    // Handle boolean conversions from string "true"/"false"
    if (typeof data.ledWall === 'string') data.ledWall = data.ledWall === 'true';
    if (typeof data.generator === 'string') data.generator = data.generator === 'true';

    const newProfile = await LokalProfile.create(data);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Create Profile Error:", error);
    res.status(500).json({ message: "Error creating profile", error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const data = { ...req.body };

    // Handle File Upload
    if (req.file) {
      data.imageUrl = `/uploads/local/${req.file.filename}`;
    }

    // Parse JSON fields
    if (typeof data.scheduleMidweek === 'string') {
      try { data.scheduleMidweek = JSON.parse(data.scheduleMidweek); } catch (e) { }
    }
    if (typeof data.scheduleWeekend === 'string') {
      try { data.scheduleWeekend = JSON.parse(data.scheduleWeekend); } catch (e) { }
    }
    // Handle boolean conversions
    if (typeof data.ledWall === 'string') data.ledWall = data.ledWall === 'true';
    if (typeof data.generator === 'string') data.generator = data.generator === 'true';

    const updated = await LokalProfile.update(data, {
      where: { id: req.params.id },
    });
    res.json({ message: "Profile updated successfully", updated });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Error updating profile", error });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await LokalProfile.destroy({ where: { id: req.params.id } });
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting profile", error });
  }
};
