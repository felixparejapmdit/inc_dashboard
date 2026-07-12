const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Task = sequelize.define(
  "Task",
  {
    task_id: {
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
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "categories", key: "category_id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    suguan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "suguan", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    local_congregations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    task_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Active",
      validate: { isIn: [["Active", "Completed"]] },
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Medium",
      validate: { isIn: [["Critical", "High", "Medium", "Low"]] },
    },
    kanban_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "New",
      validate: { isIn: [["New", "Blocked", "In Progress", "Waiting for approval", "Done"]] },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Task;
