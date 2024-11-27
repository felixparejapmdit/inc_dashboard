const Group = require("./Group");
const User = require("./User");
const UserGroupMapping = require("./UserGroupMapping");
const PermissionDefinition = require("./PermissionDefinition");
const PermissionCategory = require("./PermissionCategory");
const PermissionCategoryMapping = require("./PermissionCategoryMapping");

// Define associations for groups and users
Group.hasMany(UserGroupMapping, { foreignKey: "group_id" });
UserGroupMapping.belongsTo(Group, { foreignKey: "group_id" });

User.hasMany(UserGroupMapping, { foreignKey: "user_id" });
UserGroupMapping.belongsTo(User, { foreignKey: "user_id" });

// PermissionDefinition has many category mappings
PermissionDefinition.hasMany(PermissionCategoryMapping, {
  foreignKey: "permission_id",
  as: "categoryMappings",
});

// PermissionCategoryMapping belongs to PermissionDefinition
PermissionCategoryMapping.belongsTo(PermissionDefinition, {
  foreignKey: "permission_id",
  as: "permission",
});

// PermissionCategory has many category mappings
PermissionCategory.hasMany(PermissionCategoryMapping, {
  foreignKey: "category_id",
  as: "mappings",
});

// PermissionCategoryMapping belongs to PermissionCategory
PermissionCategoryMapping.belongsTo(PermissionCategory, {
  foreignKey: "category_id",
  as: "category",
});


// Export all models
module.exports = {
  Group,
  User,
  UserGroupMapping,
  PermissionDefinition,
  PermissionCategory,
  PermissionCategoryMapping,
};
