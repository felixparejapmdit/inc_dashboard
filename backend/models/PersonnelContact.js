const { DataTypes } = require("sequelize");
const db = require("../db");

const PersonnelContact = db.define("PersonnelContact", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  personnel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contact_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contact_info: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
});

module.exports = PersonnelContact;
