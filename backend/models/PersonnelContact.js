const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");

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
  contactype_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contact_info: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
}, {
  tableName: "personnel_contacts",
  timestamps: false,
});

module.exports = PersonnelContact;
