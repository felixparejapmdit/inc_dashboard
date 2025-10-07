const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");

const PersonnelGovID = db.define(
  "PersonnelGovID",
  {
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
      type: DataTypes.STRING(20), // Represents the type of government ID (e.g., Driver's License, Passport)
      allowNull: false,
    },
    gov_issued_id: {
      type: DataTypes.STRING(50), // Represents the actual government-issued ID number
      allowNull: false,
    },
  },
  {
    tableName: "personnel_gov_id",
    timestamps: false,
  }
);

module.exports = PersonnelGovID;
