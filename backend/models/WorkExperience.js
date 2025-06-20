const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WorkExperience = sequelize.define(
  "WorkExperience",
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
    employment_type: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    section: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reason_for_leaving: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
  },
  {
    tableName: "work_experience",
    timestamps: true, // Enable created_at and updated_at
    createdAt: "created_at", // Use specific column name
    updatedAt: "updated_at", // Use specific column name
  }
);

module.exports = WorkExperience;
