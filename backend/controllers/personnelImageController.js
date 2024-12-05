const PersonnelImage = require("../models/PersonnelImage");

exports.createImage = async (req, res) => {
  const { personnel_id, type, image_url } = req.body;

  try {
    const newImage = await PersonnelImage.create({
      personnel_id,
      type,
      image_url,
    });
    res.status(201).json({ success: true, data: newImage });
  } catch (err) {
    console.error("Error creating image:", err);
    res.status(500).json({ success: false, message: "Server Error" });
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
