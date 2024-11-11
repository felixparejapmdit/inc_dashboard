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
      type: DataTypes.TEXT, // Use TEXT to store image URLs or base64 data
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at", // Map to existing 'created_at' column
    updatedAt: "updated_at", // Map to existing 'updated_at' column
  }
);

module.exports = Department;
