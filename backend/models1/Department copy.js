const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Department = sequelize.define(
  "Department",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at", // Map Sequelize `createdAt` to 'created_at'
    updatedAt: "updated_at", // Map Sequelize `updatedAt` to 'updated_at'
    tableName: "departments", // Ensure Sequelize maps to the correct table name
  }
);

module.exports = Department;
