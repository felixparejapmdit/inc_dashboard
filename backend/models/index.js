const sequelize = require("../config/database"); // Ensure Sequelize is initialized
const Group = require("./Group");
const User = require("./User");
const UserGroupMapping = require("./UserGroupMapping");
const PermissionDefinition = require("./PermissionDefinition");
const PermissionCategory = require("./PermissionCategory");
const GroupPermissionMapping = require("./GroupPermissionMapping");

// Sync database
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized successfully.");
    // Start your application here
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

// Define associations for groups and users
Group.hasMany(UserGroupMapping, { foreignKey: "group_id" });
UserGroupMapping.belongsTo(Group, { foreignKey: "group_id" });

User.hasMany(UserGroupMapping, { foreignKey: "user_id" });
UserGroupMapping.belongsTo(User, { foreignKey: "user_id" });

// PermissionDefinition has many group permission mappings
PermissionDefinition.hasMany(GroupPermissionMapping, {
  foreignKey: "permission_id",
  as: "groupMappings",
});

// GroupPermissionMapping belongs to PermissionDefinition
GroupPermissionMapping.belongsTo(PermissionDefinition, {
  foreignKey: "permission_id",
  as: "permission",
});

// PermissionCategory has many group permission mappings
PermissionCategory.hasMany(GroupPermissionMapping, {
  foreignKey: "category_id",
  as: "mappings",
});

// GroupPermissionMapping belongs to PermissionCategory
GroupPermissionMapping.belongsTo(PermissionCategory, {
  foreignKey: "category_id",
  as: "category",
});

// Export all models
module.exports = {
  sequelize, // Optional if needed elsewhere
  Group,
  User,
  UserGroupMapping,
  PermissionDefinition,
  PermissionCategory,
  GroupPermissionMapping,
};
