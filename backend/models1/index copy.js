const sequelize = require("../config/database"); // Ensure Sequelize is initialized
const Group = require("./Group");
const User = require("./User");
const LoginAudit = require("./LoginAudit");
const Personnel = require("./personnels");
const UserGroupMapping = require("./UserGroupMapping");
const PermissionDefinition = require("./PermissionDefinition");
const PermissionCategory = require("./PermissionCategory");
const GroupPermissionMapping = require("./GroupPermissionMapping");

const Location = require("./Location"); // Add Location model
const Event = require("./Event");       // Add Event model
const Department = require("./Department");

// Sync database
sequelize
  .sync()
  .then(() => {
    console.log("Database synchronized successfully.");
    // Start your application here
  })
  .catch((err) => {
    console.error("Failed to sync database22:", err);
  });

// 🧩 Define associations here
User.hasMany(LoginAudit, { foreignKey: "user_id", as: "loginAudits" });
LoginAudit.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Define associations after all models are initialized
Personnel.hasOne(User, { foreignKey: "personnel_id" });
User.belongsTo(Personnel, { foreignKey: "personnel_id" });

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

// Location & Event
Location.hasMany(Event, { foreignKey: "location_id", as: "events", onDelete: "CASCADE" });
Event.belongsTo(Location, { foreignKey: "location_id", as: "location", onDelete: "CASCADE" });

// === Sync database sequentially, table by table, WITHOUT wrapping all in a single transaction ===
(async () => {
  try {
    // Parent tables first
    await Personnel.sync({ alter: true });

    await User.sync({ alter: true });
    await Group.sync({ alter: true });
    await PermissionDefinition.sync({ alter: true });
    await PermissionCategory.sync({ alter: true });
    await Location.sync({ alter: true }); // MUST come BEFORE Event

   // Sync departments **alone, not in transaction**
    await Department.sync({ alter: true }); // This can still deadlock if table busy

    // Dependent tables
    await UserGroupMapping.sync({ alter: true });
    await GroupPermissionMapping.sync({ alter: true });
    await LoginAudit.sync({ alter: true });
    await Event.sync({ alter: true }); // AFTER Location

    console.log("Database synchronized successfully.");
  } catch (err) {
    console.error("Failed to sync database11:", err);
  }
})();


module.exports = {
  sequelize,
  Group,
  User,
  Personnel,
  UserGroupMapping,
  PermissionDefinition,
  PermissionCategory,
  GroupPermissionMapping,
  LoginAudit,
  Location,
  Event,
};
