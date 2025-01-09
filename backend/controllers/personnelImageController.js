const PersonnelImage = require("../models/PersonnelImage");

// Create a new personnel image
exports.createImage = async (req, res) => {
  try {
    const { personnel_id, type, image_url, created_at } = req.body;

    // Validate required fields
    if (!personnel_id || !type || !image_url) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Save the image record in the database
    const newImage = await PersonnelImage.create({
      personnel_id,
      type,
      image_url,
      created_at,
    });

    res.status(201).json({
      message: "Image saved successfully",
      image: newImage,
    });
  } catch (error) {
    console.error("Error saving image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getImagesByPersonnelId = async (req, res) => {
  const { personnel_id } = req.params;

  try {
    const images = await PersonnelImage.findAll({
      where: { personnel_id },
    });
    res.status(200).json({ success: true, data: images });
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
