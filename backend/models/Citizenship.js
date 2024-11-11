const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Citizenship = sequelize.define(
  "Citizenship",
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
    citizenship: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: false, // Disable `createdAt` and `updatedAt` columns
    tableName: "citizenships", // Ensure it uses the correct table name
  }
);

module.exports = Citizenship;
