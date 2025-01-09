const Personnel = require("../models/personnels"); // Ensure the correct path
const User = require("../models/User"); // Ensure this model is correctly defined
const { Sequelize, Op } = require("sequelize"); // Import Sequelize and Op

// Get all new personnels
exports.getAllNewPersonnels = async (req, res) => {
  try {
    const newPersonnels = await Personnel.findAll({
      attributes: [
        ["personnel_id", "personnel_id"], // Correct column name for personnel_id
        "givenname", // Include givenname as a separate field
        "surname_husband", // Include surname_husband as a separate field
        [
          Sequelize.literal(
            "CONCAT(Personnel.givenname, ' ', Personnel.surname_husband)"
          ),
          "fullname", // Alias for the concatenated full name
        ],
        "email_address", // Include email address
      ],
      include: [
        {
          model: User,
          attributes: [], // Exclude user attributes
          required: false, // LEFT JOIN logic
        },
      ],
      where: {
        "$user.personnel_id$": null, // Filter to include personnels without associated users
      },
    });

    res.status(200).json(newPersonnels); // Return the results
  } catch (error) {
    console.error("Error retrieving new personnels:", error);
    res.status(500).json({ message: "Error retrieving new personnels", error });
  }
};

// Get personnels by progress
exports.getPersonnelsByProgress = async (req, res) => {
  const { step } = req.params; // Step represents personnel_progress (1-8)
  try {
    const personnels = await Personnel.findAll({
      attributes: [
        ["personnel_id", "personnel_id"],
        "givenname",
        "surname_husband",
        [
          Sequelize.literal(
            "CONCAT(Personnel.givenname, ' ', Personnel.surname_husband)"
          ),
          "fullname",
        ],
        "email_address",
      ],
      include: [
        {
          model: User,
          attributes: [],
          required: false,
        },
      ],
      where: {
        "$user.personnel_id$": null,
        personnel_progress: step, // Filter by progress step
      },
    });

    res.status(200).json(personnels);
  } catch (error) {
    console.error("Error retrieving personnels by progress:", error);
    res
      .status(500)
      .json({ message: "Error retrieving personnels by progress", error });
  }
};

// Get all personnels
exports.getAllPersonnels = async (req, res) => {
  try {
    const personnels = await Personnel.findAll();
    res.status(200).json(personnels); // Send the response directly here
  } catch (error) {
    console.error("Error retrieving personnels:", error);
    res.status(500).json({ message: "Error retrieving personnels", error });
  }
};

// Retrieve a single personnel record by ID
exports.getPersonnelById = async (req, res) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found1" });
    }
    res.status(200).json(personnel);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving personnel record",
      error: error.message,
    });
  }
};

// Get a personnel record by reference_number
exports.getPersonnelByReferenceNumber = async (req, res) => {
  try {
    const { reference_number } = req.query; // Extract query parameter

    // Validate the input
    if (!reference_number) {
      return res.status(400).json({ message: "Reference number is required" });
    }

    // Use Sequelize's `findOne` to retrieve the specific record
    const personnel = await Personnel.findOne({
      where: { reference_number: reference_number.trim() },
    });

    // If no matching personnel is found, return 404
    if (!personnel) {
      return res
        .status(404)
        .json({ message: "Personnel with this reference number not found" });
    }

    // Return the matched personnel record
    res.status(200).json(personnel);
  } catch (error) {
    console.error("Error fetching personnel by reference number:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const generateReferenceNumber = () => {
  const prefix = "ENR";
  const year = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of the year
  const month = String(new Date().getMonth() + 1).padStart(2, "0"); // Month in two digits
  const progressCode = "EP1"; // Since enrollment_progress is 1 by default
  const randomSequence = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number

  return `${prefix}-${year}${month}-${progressCode}-${randomSequence}`;
};

// Usage example before saving
const referenceNumber = generateReferenceNumber();

// Create a new personnel record
exports.createPersonnel = async (req, res) => {
  try {
    const personnelData = req.body;
    personnelData.reference_number = generateReferenceNumber(); // Assign the autogenerated reference number
    personnelData.enrollment_progress = personnelData.enrollment_progress || 1;
    personnelData.personnel_progress =
      personnelData.personnel_progress || "District Office";

    // Validation: Ensure required fields are present
    if (!personnelData.givenname || !personnelData.date_of_birth) {
      return res.status(400).json({
        message: "Missing required fields: 'givenname' and 'date_of_birth'",
      });
    }

    // Create new personnel in the database
    const newPersonnel = await Personnel.create(personnelData);

    res.status(201).json({
      message: "Personnel record created successfully",
      personnel: newPersonnel,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating personnel record",
      error: error.message,
    });
  }
};

// Update an existing personnel record by ID
exports.updatePersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    // Ensure the request body contains valid fields
    const validFields = [
      "reference_number",
      "enrollment_progress",
      "personnel_progress",
      "gender",
      "civil_status",
      "wedding_anniversary",
      "givenname",
      "middlename",
      "surname_maiden",
      "surname_husband",
      "suffix",
      "nickname",
      "date_of_birth",
      "place_of_birth",
      "datejoined",
      "language_id",
      "bloodtype",
      "email_address",
      "citizenship",
      "nationality",
      "department_id",
      "section_id",
      "subsection_id",
      "designation_id",
      "district_id",
      "local_congregation",
      "personnel_type",
      "assigned_number",
      "m_status",
      "panunumpa_date",
      "ordination_date",
    ];

    const updates = {};
    for (const key of validFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Update personnel data
    await personnel.update(updates);
    res.status(200).json({
      message: "Personnel record updated successfully",
      personnel,
    });
  } catch (error) {
    console.error("Error updating personnel:", error);
    res.status(500).json({
      message: "Error updating personnel record",
      error: error.message,
    });
  }
};

// Delete a personnel record by ID
exports.deletePersonnel = async (req, res) => {
  try {
    const personnel = await Personnel.findByPk(req.params.id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found3" });
    }

    // Delete personnel record
    await personnel.destroy();
    res.status(200).json({ message: "Personnel record deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting personnel record",
      error: error.message,
    });
  }
};
