const FamilyMember = require("../models/FamilyMember");

exports.getAllFamilyMembers = async (req, res) => {
  try {
    const members = await FamilyMember.findAll();
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFamilyMemberById = async (req, res) => {
  try {
    const member = await FamilyMember.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Family member not found" });
    }
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFamilyMember = async (req, res) => {
  try {
    const newMember = await FamilyMember.create(req.body);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFamilyMember = async (req, res) => {
  try {
    const updated = await FamilyMember.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated[0] === 0) {
      return res.status(404).json({ message: "Family member not found" });
    }
    res.status(200).json({ message: "Family member updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};
