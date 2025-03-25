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
      districtName:
        districts.find((d) => d.id === profile.district)?.name || "N/A",
      lokalName: lokals.find((l) => l.id === profile.lokal)?.name || "N/A",
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
    const newProfile = await LokalProfile.create(req.body);
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ message: "Error creating profile", error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updated = await LokalProfile.update(req.body, {
      where: { id: req.params.id },
    });
    res.json({ message: "Profile updated successfully", updated });
  } catch (error) {
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
