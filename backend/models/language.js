const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Language = sequelize.define(
  "Language",
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
    language: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at", // Map to 'created_at' column
    updatedAt: "updated_at", // Map to 'updated_at' column

    tableName: "languages", // Ensure Sequelize maps to the correct table name
  }
);

module.exports = Language;
