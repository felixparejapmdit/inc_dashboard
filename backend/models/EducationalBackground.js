const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EducationalBackground = sequelize.define(
  "EducationalBackground",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    personnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    startfrom: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    completion_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    school: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    field_of_study: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    degree: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    institution: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    professional_licensure_examination: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    certificate_files: {
      type: DataTypes.JSON, // JSON to store multiple file paths
      allowNull: true,
      defaultValue: [], // Initialize as an empty array
    },
  },
  {
    tableName: "educational_background",
    timestamps: true, // Enable created_at and updated_at
    createdAt: "created_at", // Use specific column name
    updatedAt: "updated_at", // Use specific column name
  }
);

module.exports = EducationalBackground;
