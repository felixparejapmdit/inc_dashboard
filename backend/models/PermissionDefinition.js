// backend/models/PermissionDefinition.js
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    tableName: "permission_definitions",
  }
);

PermissionDefinition.associate = (models) => {
  PermissionDefinition.hasMany(models.PermissionCategoryMapping, {
    foreignKey: "permission_id",
    as: "categoryMappings",
  });
};
module.exports = PermissionDefinition;
