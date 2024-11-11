const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Subsection = sequelize.define(
  "Subsection",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING, // Adjust based on how you're storing images
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at", // Map to existing 'created_at' column
    updatedAt: "updated_at", // Map to existing 'updated_at' column
  }
);

module.exports = Subsection;
