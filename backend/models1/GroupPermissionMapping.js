const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GroupPermissionMapping = sequelize.define(
  "GroupPermissionMapping",
  {
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Composite primary key
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Composite primary key
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    accessrights: {
      type: DataTypes.INTEGER, // 1 for Grant, 0 for Deny
      allowNull: false,
    },
  },
  {
    tableName: "group_permission_mappings",
    timestamps: false, // Disable Sequelize's automatic `createdAt` and `updatedAt`
    indexes: [
      {
        unique: true, // Ensure uniqueness for the composite key
        fields: ["group_id", "permission_id"],
      },
    ],
  }
);

// Associations
GroupPermissionMapping.associate = (models) => {
  GroupPermissionMapping.belongsTo(models.Group, {
    foreignKey: "group_id",
    as: "group",
  });

  GroupPermissionMapping.belongsTo(models.PermissionDefinition, {
    foreignKey: "permission_id",
    as: "permission",
  });

  GroupPermissionMapping.belongsTo(models.PermissionCategory, {
    foreignKey: "category_id",
    as: "category",
  });
};

module.exports = GroupPermissionMapping;
