const Personnel = require("../models/personnels"); // Ensure the correct path

const User = require("../models/User"); // Ensure this model is correctly defined
const { Sequelize, Op, fn, col } = require("sequelize"); // Import Sequelize and Op
const Section = require("../models/Section");
const sequelize = require("../config/database"); // Ensure Sequelize instance is imported
const PersonnelChurchDuties = require("../models/PersonnelChurchDuties");

const moment = require("moment");

// Get all new personnels
exports.getAllNewPersonnels = async (req, res) => {
  try {
    const newPersonnels = await Personnel.findAll({
      attributes: [
        "personnel_id", // Include personnel_id
        "givenname", // Include given name
        "surname_husband", // Include surname husband
        "email_address", // Include email address
        "personnel_progress", // ✅ Include progress
      ],
      include: [
        {
          model: Section,
          attributes: ["name"], // Only fetch the section name
          as: "Section", // Ensure this matches the alias in the `Personnel` model
        },
        {
          model: User,
          attributes: ["username"], // Fetch the username from User model
          as: "user", // Use the alias defined in the User model
          required: false, // Include personnels even if they have no user
        },
      ],
      where: {
        "$user.id$": null, // Only include personnels without an associated user
      },
    });

    // Format the results
    const formattedResults = newPersonnels.map((personnel) => ({
      personnel_id: personnel.personnel_id, // Include personnel_id
      givenname: personnel.givenname, // Include given name
      surname_husband: personnel.surname_husband, // Include surname husband
      email_address: personnel.email_address, // Include email address
      username: personnel.user ? personnel.user.username : "No Username",
      section: personnel.Section ? personnel.Section.name : "No Section", // Show section name or "No Section"
      personnel_progress: personnel.personnel_progress || "Not Started", // ✅ Include for frontend use
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Error retrieving new personnels:", error);
    res.status(500).json({
      message: "Error retrieving new personnels",
      error: error.message,
    });
  }
};

// Controller to get church duties by personnel ID
exports.getPersonnelDutiesByPersonnelId = async (req, res) => {
  try {
    const personnelId = req.params.personnelId; // Get the personnel ID from the request parameters

    // Fetch church duties for the given personnel ID using Sequelize's findAll method
    const duties = await PersonnelChurchDuties.findAll({
      where: { personnel_id: personnelId }, // Filter by personnel_id
    });

    // If no duties are found for this personnel, return a message
    // if (duties.length === 0) {
    //   return res.status(404).json({
    //     message: `No church duties found for personnel ID ${personnelId}`,
    //   });
    // }

    // Respond with the church duties data for this personnel
    res.status(200).json(duties);
  } catch (error) {
    console.error("Error fetching church duties:", error);
    res.status(500).json({
      message: "An error occurred while fetching church duties.",
      error: error.message,
    });
  }
};

// Get personnels by progress
exports.getPersonnelsByProgress = async (req, res) => {
  const { step } = req.params; // Step represents personnel_progress (0-7 or "verified")

  try {
    let whereCondition = {
      "$user.personnel_id$": null,
    };

    // If step is "0", only fetch personnel_progress "0" or "verified"
    if (step === "0") {
      whereCondition.personnel_progress = {
        [Sequelize.Op.or]: [0, "verified"],
      };
    } else {
      // If step is 1-7, fetch the exact step
      whereCondition.personnel_progress = step;
    }

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
        "personnel_progress", // Include personnel_progress in the response
      ],
      include: [
        {
          model: User,
          attributes: [],
          required: false,
        },
      ],
      where: whereCondition,
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
    const personnels = await Personnel.findAll({
      attributes: ["personnel_type"],
    });
    res.json(personnels);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch personnels" });
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
  WHERE givenname LIKE :givenname 
    AND surname_husband = :surname_husband
    AND date_of_birth = :date_of_birth 
  LIMIT 1;
`;
    const personnelRaw = await sequelize.query(rawQuery, {
      replacements: {
        givenname: `${givenname.trim()}%`, // Partial match for given names
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

// ✅ Get user credentials by personnel_id
exports.getUserCredentials = async (req, res) => {
  try {
    const { personnel_id } = req.query;

    if (!personnel_id) {
      return res.status(400).json({ message: "Personnel ID is required" });
    }

    // Fetch user credentials using Sequelize
    const user = await User.findOne({
      where: { personnel_id },
      attributes: ["username", "password"],
      include: [
        {
          model: Personnel,
          as: "personnel",
          attributes: ["reference_number", "givenname", "surname_husband"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User credentials not found" });
    }

    // If the password is encrypted, decrypt it (Assuming AES encryption)
    let decryptedPassword = user.password;
    if (user.password.startsWith("{AES}")) {
      decryptedPassword = decryptPassword(user.password.replace("{AES}", ""));
    }

    res.status(200).json({
      username: user.username,
      password: decryptedPassword, // Ensure password is securely hashed
      reference_number: user.personnel.reference_number,
      givenname: user.personnel.givenname,
      surname_husband: user.personnel.surname_husband,
    });
  } catch (error) {
    console.error("Error fetching user credentials:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// AES decryption function
const decryptPassword = (encryptedPassword) => {
  const key = process.env.ENCRYPTION_KEY || "mysecretkey123456"; // Ensure 16, 24, or 32-byte key
  const iv = Buffer.alloc(16, 0); // Initialization vector
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedPassword, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
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

    // Ensure language_id is stored as an array (converted to JSON)
    const formattedLanguages = Array.isArray(personnelData.language_id)
      ? JSON.stringify(personnelData.language_id)
      : JSON.stringify([]);

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
      registered_district_id: personnelData.registered_district_id || 0,
      registered_local_congregation:
        personnelData.registered_local_congregation || null,
      date_of_birth: personnelData.date_of_birth || null,
      place_of_birth: personnelData.place_of_birth || null,
      datejoined: personnelData.datejoined || null,
      language_id: Array.isArray(personnelData.language_id)
        ? personnelData.language_id.join(",")
        : "",
      bloodtype: personnelData.bloodtype || null,
      work_email_address: personnelData.work_email_address || null,
      email_address: personnelData.email_address || null,
      citizenship: Array.isArray(personnelData.citizenship)
        ? personnelData.citizenship.join(",")
        : "",
      nationality: personnelData.nationality || 0,
      department_id: personnelData.department_id || 0,
      section_id: personnelData.section_id || 0,
      subsection_id: personnelData.subsection_id || 0,
      designation_id: personnelData.designation_id || 0,
      district_id: personnelData.district_id || 0,
      local_congregation: personnelData.local_congregation || null,
      is_offered: personnelData.is_offered || null,
      minister_officiated: personnelData.minister_officiated || null,
      date_baptized: personnelData.date_baptized || null,
      place_of_baptism: personnelData.place_of_baptism || null,
      local_first_registered: personnelData.local_first_registered || null,
      district_first_registered:
        personnelData.district_first_registered || null,
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
      "registered_district_id",
      "registered_local_congregation",
      "date_of_birth",
      "place_of_birth",
      "datejoined",
      "language_id",
      "bloodtype",
      "work_email_address",
      "email_address",
      "citizenship",
      "nationality",
      "department_id",
      "section_id",
      "subsection_id",
      "designation_id",
      "district_id",
      "local_congregation",
      "is_offered",
      "minister_officiated",
      "date_baptized",
      "place_of_baptism",
      "local_first_registered",
      "district_first_registered",
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
        // Ensure the value is a string for trimming
        const value = req.body[key];
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        // Check for date fields to set NULL if empty
        if (
          [
            "datejoined",
            "panunumpa_date",
            "ordination_date",
            "date_of_birth",
            "wedding_anniversary",
          ].includes(key)
        ) {
          updates[key] = trimmedValue !== "" ? trimmedValue : null;
        }
        // Check for specified columns to set 0 if empty
        else if (
          [
            "language_id",
            "citizenship",
            "nationality",
            "department_id",
            "section_id",
            "subsection_id",
            "designation_id",
            "district_id",
            "district_assignment_id",
          ].includes(key)
        ) {
          updates[key] = trimmedValue !== "" ? trimmedValue : 0;
        }
        // ✅ Handle `language_id` as an **array**
        else if (key === "language_id") {
          updates[key] = Array.isArray(value)
            ? JSON.stringify(value) // Convert to JSON before storing
            : JSON.stringify([]);
        }
        // ✅ Handle `citizenship` as an **array**
        else if (key === "citizenship") {
          updates[key] = Array.isArray(value)
            ? JSON.stringify(value) // Convert to JSON before storing
            : JSON.stringify([]);
        }
        // For all other fields, assign the provided value
        else {
          updates[key] = trimmedValue;
        }
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
}; // Create a new personnel_church_duty record
exports.createPersonnelChurchDuty = async (req, res) => {
  try {
    const { personnel_id, duty, start_year, end_year } = req.body;

    // Validation: Ensure required fields are present
    if (!personnel_id || !duty || !start_year) {
      return res.status(400).json({
        message: "Missing required fields: personnel_id, duty, start_year",
      });
    }

    // Create new duty record
    const newDuty = await PersonnelChurchDuties.create({
      personnel_id,
      duty,
      start_year,
      end_year: end_year || null,
    });

    return res.status(201).json({
      message: "Personnel church duty created successfully",
      personnelChurchDuty: newDuty,
    });
  } catch (error) {
    console.error("Error creating personnel church duty:", error.message);
    return res.status(500).json({
      message: "Error creating personnel church duty",
      error: error.message,
    });
  }
};

// Update an existing personnel_church_duty record
exports.updatePersonnelChurchDuty = async (req, res) => {
  try {
    const { id } = req.params; // id from URL params
    const { duty, start_year, end_year } = req.body;

    // Validation: Ensure required fields are present
    if (!duty || !start_year) {
      return res.status(400).json({
        message: "Missing required fields: duty, start_year",
      });
    }

    // Find the existing duty record
    const existingDuty = await PersonnelChurchDuties.findByPk(id);

    if (!existingDuty) {
      return res.status(404).json({
        message: `Personnel church duty with ID ${id} not found`,
      });
    }

    // Update fields
    existingDuty.duty = duty;
    existingDuty.start_year = start_year;
    existingDuty.end_year = end_year || null;

    await existingDuty.save();

    return res.status(200).json({
      message: "Personnel church duty updated successfully",
      personnelChurchDuty: existingDuty,
    });
  } catch (error) {
    console.error("Error updating personnel church duty:", error.message);
    return res.status(500).json({
      message: "Error updating personnel church duty",
      error: error.message,
    });
  }
};
// Delete a personnel_church_duty record
exports.deletePersonnelChurchDuty = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the duty record
    const existingDuty = await PersonnelChurchDuties.findByPk(id);

    if (!existingDuty) {
      return res.status(404).json({
        message: `Personnel church duty with ID ${id} not found`,
      });
    }

    // Delete the record
    await existingDuty.destroy();

    return res.status(200).json({
      message: "Personnel church duty deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting personnel church duty:", error.message);
    return res.status(500).json({
      message: "Error deleting personnel church duty",
      error: error.message,
    });
  }
};
