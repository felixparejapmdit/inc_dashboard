// ✅ Lokal Profile Controller with Relation Support
const LokalProfile = require("../models/LokalProfile");
const axios = require("axios");

const DISTRICT_API_URL = process.env.REACT_APP_DISTRICT_API_URL;
const LOCAL_CONGREGATION_API_URL =
  process.env.REACT_APP_LOCAL_CONGREGATION_API_URL;

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await LokalProfile.findAll();

    let districts = [];
    let lokals = [];

    try {
      const [districtRes, lokalRes] = await Promise.all([
        axios.get(DISTRICT_API_URL),
        axios.get(LOCAL_CONGREGATION_API_URL),
      ]);
      districts = districtRes.data || [];
      lokals = lokalRes.data || [];
    } catch (apiError) {
      console.warn(
        "Warning: Failed to fetch district/lokal info",
        apiError.message
      );
      // Proceeding with empty district/lokal fallback
    }

    const enrichedProfiles = profiles.map((profile) => ({
      ...profile.dataValues,
      // Handle District: Lookup by ID (loose match) or use raw string
      districtName:
        districts.find((d) => d.id == profile.district)?.name || profile.district, // Loose equality for string/int IDs
      // Handle Lokal: Lookup by ID (loose match) or use raw string
      lokalName: lokals.find((l) => l.id == profile.lokal)?.name || profile.lokal,
    }));

    res.json(enrichedProfiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lokal profiles", error });
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
