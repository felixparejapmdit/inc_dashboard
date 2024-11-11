const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Designation = sequelize.define(
  "Designation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subsection_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at", // Map to existing 'created_at' column
    updatedAt: "updated_at", // Map to existing 'updated_at' column
  }
);

module.exports = Designation;
