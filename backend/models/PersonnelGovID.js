const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");

const PersonnelGovID = db.define("PersonnelGovID", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  personnel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gov_id: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
}, {
  tableName: "personnel_gov_id",
  timestamps: false,
});

module.exports = PersonnelGovID;
