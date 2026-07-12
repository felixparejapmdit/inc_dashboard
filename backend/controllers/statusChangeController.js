const { Sequelize } = require("sequelize");
const Personnel = require("../models/personnels");
const PersonnelHistory = require("../models/PersonnelHistory");

// Get personnel currently in a removal case at a given clearance stage (0-3), or all pending cases if step is "all"
exports.getPersonnelsByStatusChangeProgress = async (req, res) => {
  const { step } = req.params;

  try {
    const whereCondition = {
      personnel_status: "pending_removal",
    };

    if (step !== "all") {
      whereCondition.status_change_progress = step;
    }

    const personnels = await Personnel.findAll({
      attributes: [
        "personnel_id",
        "givenname",
        "surname_husband",
        "email_address",
        "personnel_status",
        "status_change_progress",
        "department_id",
        "section_id",
        "subsection_id",
        "designation_id",
      ],
      where: whereCondition,
    });

    res.status(200).json(personnels);
  } catch (error) {
    console.error("Error retrieving personnels by status change progress:", error);
    res.status(500).json({
      message: "Error retrieving personnels by status change progress",
      error: error.message,
    });
  }
};

// Start a removal case for an active personnel
exports.initiateRemoval = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const personnel = await Personnel.findByPk(id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    if (personnel.personnel_status && personnel.personnel_status !== "active") {
      return res.status(400).json({
        message: `Personnel already has an in-progress status change (${personnel.personnel_status}).`,
      });
    }

    await personnel.update({
      personnel_status: "pending_removal",
      status_change_progress: "0",
    });

    res.status(200).json({
      message: "Removal case initiated.",
      personnel,
    });
  } catch (error) {
    console.error("Error initiating removal:", error);
    res.status(500).json({ message: "Error initiating removal", error: error.message });
  }
};

// Advance/revert the removal clearance stage (mirrors userController.updateProgress)
exports.updateRemovalProgress = async (req, res) => {
  const { personnel_id, status_change_progress } = req.body;

  if (!personnel_id || status_change_progress === undefined || status_change_progress === null) {
    return res.status(400).json({
      message: "Personnel ID and status change progress are required.",
    });
  }

  try {
    const personnel = await Personnel.findOne({ where: { personnel_id } });
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found." });
    }

    await personnel.update({ status_change_progress: String(status_change_progress) });

    res.status(200).json({
      message: "Removal clearance progress updated successfully.",
      personnel,
    });
  } catch (error) {
    console.error("Error updating removal progress:", error);
    res.status(500).json({
      message: "Internal server error. Failed to update removal progress.",
      error: error.message,
    });
  }
};

// Close out a removal case: soft-delete the personnel and log the clearance
exports.finalizeRemoval = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const personnel = await Personnel.findByPk(id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    await personnel.update({ personnel_status: "removed" });
    await personnel.destroy();

    await PersonnelHistory.create({
      personnel_id: id,
      action: "Out",
      reason: reason || "Removal clearance completed",
      performed_by: req.user ? req.user.username : "System",
    });

    res.status(200).json({ message: "Removal finalized and personnel record closed." });
  } catch (error) {
    console.error("Error finalizing removal:", error);
    res.status(500).json({ message: "Error finalizing removal", error: error.message });
  }
};

// Apply a transfer (district/location) or reassignment (department/section/subsection/designation)
exports.applyTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      case_type, // "transfer" | "reassignment"
      reason,
      department_id,
      section_id,
      subsection_id,
      designation_id,
      district_id,
      district_assignment_id,
      local_congregation_assignment,
    } = req.body;

    const personnel = await Personnel.findByPk(id);
    if (!personnel) {
      return res.status(404).json({ message: "Personnel not found" });
    }

    const updates = {};
    if (department_id !== undefined) updates.department_id = department_id;
    if (section_id !== undefined) updates.section_id = section_id;
    if (subsection_id !== undefined) updates.subsection_id = subsection_id;
    if (designation_id !== undefined) updates.designation_id = designation_id;
    if (district_id !== undefined) updates.district_id = district_id;
    if (district_assignment_id !== undefined) updates.district_assignment_id = district_assignment_id;
    if (local_congregation_assignment !== undefined) updates.local_congregation_assignment = local_congregation_assignment;

    await personnel.update(updates);

    await PersonnelHistory.create({
      personnel_id: id,
      action: case_type === "reassignment" ? "Reassigned" : "Transferred",
      reason: reason || (case_type === "reassignment" ? "Reassigned" : "Transferred"),
      performed_by: req.user ? req.user.username : "System",
    });

    res.status(200).json({
      message: "Transfer/reassignment applied successfully.",
      personnel,
    });
  } catch (error) {
    console.error("Error applying transfer:", error);
    res.status(500).json({ message: "Error applying transfer", error: error.message });
  }
};
