const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PermissionCategory = sequelize.define(
  "PermissionCategory",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
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
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: "permission_categories",
    timestamps: false,
  }
);

PermissionCategory.associate = (models) => {
  PermissionCategory.hasMany(models.PermissionCategoryMapping, {
    foreignKey: "category_id",
    as: "mappings",
  });
};


module.exports = PermissionCategory;
