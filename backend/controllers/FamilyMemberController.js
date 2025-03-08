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

    // List of valid fields for the FamilyMember model
    const validFields = [
      "personnel_id",
      "relationship_type",
      "givenname",
      "middlename",
      "lastname",
      "suffix",
      "nickname",
      "gender",
      "date_of_birth",
      "contact_number",
      "bloodtype",
      "civil_status",
      "date_of_marriage",
      "place_of_marriage",
      "citizenship",
      "nationality",
      "church_duties",
      "livelihood",
      "district_id",
      "local_congregation",
      "minister_officiated",
      "employment_type",
      "company",
      "address",
      "position",
      "department",
      "section",
      "start_date",
      "end_date",
      "reason_for_leaving",
      "education_level",
      "start_year",
      "completion_year",
      "school",
      "field_of_study",
      "degree",
      "institution",
      "professional_licensure_examination",
      "created_at",
      "updated_at",
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

    // Convert empty strings to null for integer fields
    const intFields = [
      "contact_number",
      "citizenship",
      "nationality",
      "district_id",
      "local_congregation",
      "start_year",
      "completion_year",
    ];

    for (const key of intFields) {
      if (req.body[key] !== undefined) {
        newMemberData[key] = req.body[key] === "" ? null : req.body[key];
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
      "personnel_id",
      "relationship_type",
      "givenname",
      "middlename",
      "lastname",
      "suffix",
      "nickname",
      "gender",
      "date_of_birth",
      "contact_number",
      "bloodtype",
      "civil_status",
      "date_of_marriage",
      "place_of_marriage",
      "citizenship",
      "nationality",
      "church_duties",
      "livelihood",
      "district_id",
      "local_congregation",
      "minister_officiated",
      "employment_type",
      "company",
      "address",
      "position",
      "department",
      "section",
      "start_date",
      "end_date",
      "reason_for_leaving",
      "education_level",
      "start_year",
      "completion_year",
      "school",
      "field_of_study",
      "degree",
      "institution",
      "professional_licensure_examination",
      "created_at",
      "updated_at",
    ];

    const updates = {};

    // Validate and update
    for (const key of validFields) {
      if (req.body[key] !== undefined) {
        const value = req.body[key];
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        // Required fields validation
        if (["lastname"].includes(key)) {
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

    // Convert empty strings to null for integer fields
    const intFields = [
      "contact_number",
      "citizenship",
      "nationality",
      "district_id",
      "local_congregation",
      "start_year",
      "completion_year",
    ];

    for (const key of intFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key] === "" ? null : req.body[key];
      }
    }

    console.log("Updates to Apply:", updates);

    await member.update(updates);

    const updatedMember = await FamilyMember.findByPk(req.params.id); // Fetch the updated record with the correct ID

    res.status(200).json({
      message: "Family member updated successfully",
      id: updatedMember.id, // ✅ Ensure ID is explicitly returned
      family_member: updatedMember,
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
