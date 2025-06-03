const PersonnelAddress = require("../models/PersonnelAddress");

exports.getAllAddresses = async (req, res) => {
  try {
    const { personnel_id } = req.query;
    const whereClause = personnel_id ? { personnel_id } : {};
    const addresses = await PersonnelAddress.findAll({ where: whereClause });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ error: "Failed to fetch addresses." });
  }
};

// Get personnel addresses where address_type = 'INC Housing'
exports.getIncHousingAddresses = async (req, res) => {
  try {
    const addresses = await PersonnelAddress.findAll({
      where: { address_type: "INC Housing" },
    });
    res.status(200).json(addresses);
  } catch (error) {
    console.error("Error fetching INC Housing addresses:", error);
    res.status(500).json({ error: "Failed to fetch INC Housing addresses." });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await PersonnelAddress.findByPk(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAddressByPersonnelId = async (req, res) => {
  try {
    const addresses = await PersonnelAddress.findAll({
      where: { personnel_id: req.params.personnel_id },
    });

    if (!addresses || addresses.length === 0) {
      return res
        .status(404)
        .json({ message: "No addresses found for this personnel." });
    }

    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const newAddress = await PersonnelAddress.create(req.body);
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  const { personnel_id, address_type, name } = req.body;

  console.log("Received ID for update:", req.params.id); // Log the ID
  console.log("Received Payload:", { personnel_id, address_type, name }); // Log the payload

  if (!personnel_id || !address_type || !name) {
    return res.status(400).json({
      error: "Personnel ID, Address Type, and Address are required.",
    });
  }

  try {
    // Check if the record exists
    const existingRecord = await PersonnelAddress.findByPk(req.params.id);

    if (!existingRecord) {
      return res.status(404).json({ error: "Address not found." });
    }

    // Compare existing data with the new payload
    const isUnchanged =
      existingRecord.personnel_id === personnel_id &&
      existingRecord.address_type === address_type &&
      existingRecord.name === name;

    if (isUnchanged) {
      console.log("No changes detected in the data.");
      return res.status(200).json({
        message: "No changes were made.",
        data: existingRecord,
      });
    }

    // Perform the update
    await PersonnelAddress.update(
      { personnel_id, address_type, name },
      { where: { id: req.params.id } }
    );

    // Return the updated record
    const updatedRecord = await PersonnelAddress.findByPk(req.params.id);
    console.log("Updated Record:", updatedRecord);

    return res.status(200).json({
      message: "Address updated successfully.",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating address:", error.message);
    return res.status(500).json({
      error: "Failed to update address. Please try again later.",
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const deleted = await PersonnelAddress.destroy({
      where: { id: req.params.id },
    });
    if (!deleted) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
