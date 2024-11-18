const PersonnelAddress = require("../models/PersonnelAddress");

exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await PersonnelAddress.findAll();
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

exports.createAddress = async (req, res) => {
  try {
    const newAddress = await PersonnelAddress.create(req.body);
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const updated = await PersonnelAddress.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated[0] === 0) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
