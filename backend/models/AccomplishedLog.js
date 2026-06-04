const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AccomplishedLog = sequelize.define(
  "AccomplishedLog",
  {
    log_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "tasks", key: "task_id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    completed_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    hours_rendered: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "accomplished_logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = AccomplishedLog;
