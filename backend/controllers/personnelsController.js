const Personnel = require("../models/personnels"); // Ensure the correct path
const User = require("../models/User"); // Ensure this model is correctly defined
const { Sequelize, Op, fn, col } = require("sequelize"); // Import Sequelize and Op

const sequelize = require("../config/database"); // Ensure Sequelize instance is imported

const moment = require("moment");

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

exports.getReferenceNumber = async (req, res) => {
  const { givenname, date_of_birth, surname_husband } = req.query;

  // Validate required fields
  if (!givenname || !date_of_birth || !surname_husband) {
    return res.status(400).json({
      message: "givenname, surname_husband, and date_of_birth are required.",
    });
  }

  try {
    // Normalize the date to ensure consistency
    const normalizedDate = new Date(date_of_birth).toISOString().split("T")[0];

    console.log("Request received with:", {
      givenname,
      surname_husband,
      date_of_birth,
    });
    console.log("Normalized Date:", normalizedDate);

    // Using Sequelize raw query for debugging purposes
    const rawQuery = `
      SELECT * 
      FROM personnels 
      WHERE givenname = :givenname 
        AND surname_husband = :surname_husband
        AND date_of_birth = :date_of_birth 
      LIMIT 1;
    `;
    const personnelRaw = await sequelize.query(rawQuery, {
      replacements: {
        givenname: givenname.trim(),
        surname_husband: surname_husband.trim(),
        date_of_birth: normalizedDate,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    if (!personnelRaw || personnelRaw.length === 0) {
      return res.status(404).json({
        message: "No reference number found for the provided details.",
      });
    }

    // Return the reference number and associated details from raw SQL query
    const personnel = personnelRaw[0];
    res.status(200).json({
      reference_number: personnel.reference_number,
      personnel_id: personnel.personnel_id,
      enrollment_progress: personnel.enrollment_progress,
    });
  } catch (error) {
    console.error("Error retrieving reference number:", error);
    res.status(500).json({
      message: "An error occurred while retrieving the reference number.",
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

    // Generate reference number and set default values for progress fields
    personnelData.reference_number = generateReferenceNumber();
    personnelData.enrollment_progress =
      personnelData.enrollment_progress || "1";
    personnelData.personnel_progress =
      personnelData.personnel_progress || "District Office";

    // Validation: Ensure required fields are present
    const requiredFields = [
      "givenname",
      "surname_husband",
      "date_of_birth",
      "email_address",
      "gender",
      "civil_status",
    ];
    const missingFields = requiredFields.filter(
      (field) => !personnelData[field]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if a record with the same givenname and surname_husband already exists
    const existingPersonnel = await Personnel.findOne({
      where: {
        givenname: personnelData.givenname,
        surname_husband: personnelData.surname_husband,
      },
    });

    if (existingPersonnel) {
      return res.status(400).json({
        message:
          "A personnel record with the same given name and surname already exists.",
      });
    }

    // Create new personnel record in the database
    const newPersonnel = await Personnel.create({
      reference_number: personnelData.reference_number,
      enrollment_progress: personnelData.enrollment_progress,
      personnel_progress: personnelData.personnel_progress,
      gender: personnelData.gender || null,
      civil_status: personnelData.civil_status || null,
      wedding_anniversary: personnelData.wedding_anniversary || null,
      givenname: personnelData.givenname || null,
      middlename: personnelData.middlename || null,
      surname_maiden: personnelData.surname_maiden || null,
      surname_husband: personnelData.surname_husband || null,
      suffix: personnelData.suffix || null,
      nickname: personnelData.nickname || null,
      registered_local_congregation:
        personnelData.registered_local_congregation || null,
      date_of_birth: personnelData.date_of_birth || null,
      place_of_birth: personnelData.place_of_birth || null,
      datejoined: personnelData.datejoined || null,
      language_id: personnelData.language_id || null,
      bloodtype: personnelData.bloodtype || null,
      email_address: personnelData.email_address || null,
      citizenship: personnelData.citizenship || null,
      nationality: personnelData.nationality || null,
      department_id: personnelData.department_id || null,
      section_id: personnelData.section_id || null,
      subsection_id: personnelData.subsection_id || null,
      designation_id: personnelData.designation_id || null,
      district_id: personnelData.district_id || null,
      local_congregation: personnelData.local_congregation || null,
      personnel_type: personnelData.personnel_type || null,
      district_assignment_id: personnelData.district_assignment_id || null,
      local_congregation_assignment:
        personnelData.local_congregation_assignment || null,
      assigned_number: personnelData.assigned_number || null,
      m_status: personnelData.m_status || null,
      panunumpa_date: personnelData.panunumpa_date || null,
      ordination_date: personnelData.ordination_date || null,
    });

    res.status(201).json({
      message: "Personnel record created successfully",
      personnel: newPersonnel,
    });
  } catch (error) {
    console.error("Error creating personnel record:", error.message);
    res.status(500).json({
      message: "Error creating personnel record",
      error: error.message,
    });
  }
};

// Update an existing personnel record by ID
exports.updatePersonnel = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const personnel = await Personnel.findByPk(req.params.id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    // Validate and update
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
      "registered_local_congregation",
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
      "district_assignment_id",
      "local_congregation_assignment",
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

    console.log("Updates to Apply:", updates);

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

// Check if personnel exists
exports.checkPersonnelExistence = async (req, res) => {
  try {
    const { givenname, surname_husband } = req.query;

    if (!givenname || !surname_husband) {
      return res.status(400).json({
        message:
          "Missing required query parameters: 'givenname' and 'surname_husband'.",
      });
    }

    // Query the database for matching personnel
    const exists = await Personnel.findOne({
      where: {
        givenname,
        surname_husband,
      },
    });

    // Respond with existence status
    res.json({ exists: !!exists });
  } catch (error) {
    console.error("Error checking personnel existence:", error);
    res.status(500).json({
      message: "An error occurred while checking personnel existence.",
    });
  }
};
