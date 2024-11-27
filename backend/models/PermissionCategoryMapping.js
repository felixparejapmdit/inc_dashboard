const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PermissionCategoryMapping = sequelize.define(
  "PermissionCategoryMapping",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    tableName: "permission_category_mappings",
    timestamps: false,
  }
);

PermissionCategoryMapping.associate = (models) => {
  PermissionCategoryMapping.belongsTo(models.PermissionDefinition, {
    foreignKey: "permission_id",
    as: "permission",
  });

  PermissionCategoryMapping.belongsTo(models.PermissionCategory, {
    foreignKey: "category_id",
    as: "category",
  });
};

module.exports = PermissionCategoryMapping;
