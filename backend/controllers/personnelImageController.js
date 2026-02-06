const fs = require("fs");
const path = require("path");
const PersonnelImage = require("../models/PersonnelImage");

// Create a new personnel image
// exports.createImage = async (req, res) => {
//   try {
//     const { personnel_id, type } = req.body;

//     // Validate required fields
//     if (!personnel_id || !type || !req.file) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     // Save the file path in the database
//     const imagePath = `/uploads/avatar/${req.file.filename}`;
//     const newImage = await PersonnelImage.create({
//       personnel_id,
//       type,
//       image_url: imagePath,
//       created_at: new Date(),
//     });

//     res.status(201).json({
//       message: "Image saved successfully",
//       image: newImage,
//     });
//   } catch (error) {
//     console.error("Error saving image:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.createImage = async (req, res) => {
  try {
    const { personnel_id, type } = req.body;

    // Validate required fields
    if (!personnel_id || !type || !req.file) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if an image already exists for this personnel_id and type
    const existingImage = await PersonnelImage.findOne({
      where: { personnel_id, type },
    });

    if (existingImage) {
      // Delete the old image file from the uploads/avatar folder safely
      const oldFilePath = path.join(
        __dirname,
        "../uploads/avatar",
        path.basename(existingImage.image_url)
      );

      try {
        if (fs.existsSync(oldFilePath)) {
          const stat = fs.statSync(oldFilePath);
          if (stat.isFile()) {
            fs.unlinkSync(oldFilePath);
          }
        }
      } catch (unlinkError) {
        console.error("Failed to delete old image:", unlinkError.message);
        // Continue execution even if delete fails
      }

      // Update the existing record with new file path and timestamp
      existingImage.image_url = `/uploads/avatar/${req.file.filename}`;
      existingImage.updated_at = new Date();
      await existingImage.save();

      return res.status(200).json({
        message: "Image updated successfully",
        image: existingImage,
      });
    }

    // If no existing image, create a new record
    const imagePath = `/uploads/avatar/${req.file.filename}`;
    const newImage = await PersonnelImage.create({
      personnel_id,
      type,
      image_url: imagePath,
      created_at: new Date(),
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

// Fetch personnel images by personnel_id
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

// ✅ Fetch personnel image where type is "2x2 Picture"
exports.get2x2ImageByPersonnelId = async (req, res) => {
  const { personnel_id } = req.params;

  try {
    const image = await PersonnelImage.findOne({
      where: { personnel_id, type: "2x2 Picture" }, // Filter by "2x2 Picture"
    });

    if (!image) {
      return res
        .status(200)
        .json({ success: false, message: "No 2x2 picture found" });
    }

    res.status(200).json({ success: true, data: image });
  } catch (err) {
    console.error("Error fetching 2x2 picture:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the image record in the database
    const imageRecord = await PersonnelImage.findByPk(id);

    if (!imageRecord) {
      return res.status(404).json({ message: "Image not found." });
    }

    // Get the full file path
    const filePath = path.join(
      __dirname,
      "../../uploads/avatar",
      path.basename(imageRecord.image_url)
    );

    // Delete the image file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({
          message: "Failed to delete the image file.",
        });
      }
    });

    // Delete the record from the database
    await PersonnelImage.destroy({ where: { id } });

    res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting image:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the image." });
  }
};
