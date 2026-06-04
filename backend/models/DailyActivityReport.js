const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DailyActivityReport = sequelize.define(
  "DailyActivityReport",
  {
    report_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    report_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    accomplishments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Natapus na Gawain",
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "System or administrative remarks",
    },
    personnel_remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Remarks ng Personnel",
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "daily_activity_reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = DailyActivityReport;
