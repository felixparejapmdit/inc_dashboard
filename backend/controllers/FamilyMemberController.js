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
    // Required fields for validation
    const requiredFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "lastname",
    ];

    // Validate required fields
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

    // Valid fields for FamilyMember model
    const validFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "middlename",
      "lastname",
      "suffix",
      "nickname",
      "gender",
      "civil_status",
      "date_of_birth",
      "date_of_marriage",
      "start_date",
      "end_date",
      "church_duties",
      "education_level",
      "employment_type",
    ];

    const newMemberData = {};

    // Process and validate fields
    for (const key of validFields) {
      if (req.body[key] !== undefined) {
        const value = req.body[key];
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        // Handle date fields (convert empty string or undefined to null)
        if (
          [
            "date_of_birth",
            "date_of_marriage",
            "start_date",
            "end_date",
          ].includes(key)
        ) {
          newMemberData[key] = trimmedValue !== "" ? trimmedValue : null;
        } else {
          newMemberData[key] = trimmedValue;
        }
      }
    }

    console.log("Creating Family Member with Data:", newMemberData);

    // Create the new family member record
    const newMember = await FamilyMember.create(newMemberData);

    res.status(201).json({
      message: "Family member created successfully",
      family_member: newMember,
    });
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

    // List of valid fields for the FamilyMember model
    const validFields = [
      "lastname",
      "givenname",
      "middlename",
      "suffix",
      "nickname",
      "gender",
      "civil_status",
      "relationship_type",
      "date_of_birth",
      "date_of_marriage",
      "start_date",
      "end_date",
      "church_duties",
      "education_level",
      "employment_type",
      "district_id",
      "local_congregation",
    ];

    const updates = {};

    // Validate and update
    for (const key of validFields) {
      if (req.body[key] !== undefined) {
        const value = req.body[key];
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        // Required fields validation
        if (["lastname", "gender"].includes(key)) {
          if (trimmedValue === null || trimmedValue === "") {
            return res.status(400).json({
              message: `The field ${key} is required.`,
            });
          }
        }

        // Handle date fields (convert empty string to null)
        if (
          [
            "date_of_birth",
            "date_of_marriage",
            "start_date",
            "end_date",
          ].includes(key)
        ) {
          updates[key] = trimmedValue !== "" ? trimmedValue : null;
        }
        // Handle other fields
        else {
          updates[key] = trimmedValue;
        }
      }
    }

    console.log("Updates to Apply:", updates);

    await member.update(updates);
    res.status(200).json({
      message: "Family member updated successfully",
      family_member: member,
    });
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
