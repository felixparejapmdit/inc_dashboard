// models/Nationality.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Nationality = sequelize.define(
  "Nationality",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    country_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: false, // Disable `createdAt` and `updatedAt` columns
    tableName: "nationalities", // Ensure it uses the correct table name
  }
);

module.exports = Nationality;
