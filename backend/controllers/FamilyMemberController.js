const FamilyMember = require("../models/FamilyMember");

exports.getAllFamilyMembers = async (req, res) => {
  try {
    const members = await FamilyMember.findAll();
    res.status(200).json(members);
  } catch (error) {
    console.error(
      "Error fetching family members:",
      error.stack || error.message
    );
    res.status(500).json({
      error:
        error.message || "An error occurred while fetching family members.",
    });
  }
};

// exports.getFamilyMemberById = async (req, res) => {
//   try {
//     const member = await FamilyMember.findByPk(req.params.id);
//     if (!member) {
//       return res.status(404).json({ message: "Family member not found" });
//     }
//     res.status(200).json(member);
//   } catch (error) {
//     console.error(
//       "Error fetching family member by ID:",
//       error.stack || error.message
//     );
//     res.status(500).json({
//       error:
//         error.message || "An error occurred while fetching the family member.",
//     });
//   }
// };

exports.getFamilyMemberById = async (req, res) => {
  try {
    const { personnel_id, relationship_type } = req.query;

    if (!personnel_id) {
      return res.status(400).json({ message: "Personnel ID is required." });
    }

    // Build query conditions
    const whereConditions = { personnel_id };
    if (relationship_type) {
      whereConditions.relationship_type = relationship_type; // Add relationship_type filter
    }

    // Fetch family members based on conditions
    const members = await FamilyMember.findAll({
      where: whereConditions,
    });

    if (!members || members.length === 0) {
      return res.status(200).json([]); // Return an empty array
    }

    res.status(200).json(members);
  } catch (error) {
    console.error(
      "Error fetching family members by personnel_id:",
      error.stack || error.message
    );
    res.status(500).json({
      error:
        error.message ||
        "An error occurred while fetching family members by personnel_id.",
    });
  }
};

exports.createFamilyMember = async (req, res) => {
  try {
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
    ];
    for (const field of requiredFields) {
      if (
        req.body[field] === undefined || // Check if field is missing
        req.body[field] === null || // Check if field is null
        (typeof req.body[field] === "string" && req.body[field].trim() === "") // Check if string field is empty
      ) {
        return res
          .status(400)
          .json({ message: `The field ${field} is required.` });
      }
    }

    // Ensure empty string or undefined dates are converted to null
    if (req.body.date_of_birth === "" || req.body.date_of_birth === undefined) {
      req.body.date_of_birth = null;
    }
    if (
      req.body.date_of_marriage === "" ||
      req.body.date_of_marriage === undefined
    ) {
      req.body.date_of_marriage = null;
    }
    if (req.body.start_date === "" || req.body.start_date === undefined) {
      req.body.start_date = null;
    }
    if (req.body.end_date === "" || req.body.end_date === undefined) {
      req.body.end_date = null;
    }

    const newMember = await FamilyMember.create(req.body);
    res.status(201).json(newMember);
  } catch (error) {
    console.error(
      "Error creating family member:",
      error.stack || error.message
    );
    res.status(500).json({
      error:
        error.message || "An error occurred while creating the family member.",
    });
  }
};

exports.updateFamilyMember = async (req, res) => {
  try {
    const member = await FamilyMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Family member not found" });
    }

    // Validate required fields only when they're being updated
    const requiredFields = ["lastname", "gender"];
    for (const field of requiredFields) {
      if (
        req.body[field] !== undefined && // Only validate if the field is being updated
        (req.body[field] === null || // Check if null
          (typeof req.body[field] === "string" &&
            req.body[field].trim() === "")) // Check if empty
      ) {
        return res
          .status(400)
          .json({ message: `The field ${field} is required.` });
      }
    }

    // Ensure empty string or undefined dates are converted to null
    if (req.body.date_of_birth === "") {
      req.body.date_of_birth = null;
    }
    if (req.body.date_of_marriage === "") {
      req.body.date_of_marriage = null;
    }
    if (req.body.start_date === "") {
      req.body.start_date = null;
    }
    if (req.body.end_date === "") {
      req.body.end_date = null;
    }

    await member.update(req.body);
    res.status(200).json(member);
  } catch (error) {
    console.error(
      "Error updating family member:",
      error.stack || error.message
    );
    res.status(500).json({
      error:
        error.message || "An error occurred while updating the family member.",
    });
  }
};

exports.deleteFamilyMember = async (req, res) => {
  try {
    const deleted = await FamilyMember.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Family member not found" });
    }
    res.status(200).json({ message: "Family member deleted successfully" });
  } catch (error) {
    console.error(
      "Error deleting family member:",
      error.stack || error.message
    );
    res.status(500).json({
      error:
        error.message || "An error occurred while deleting the family member.",
    });
  }
};
