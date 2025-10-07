const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PermissionDefinition = sequelize.define(
  "PermissionDefinition",
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "permission_definitions", // Ensure it matches your table name
    timestamps: false,
  }
);

module.exports = PermissionDefinition;
