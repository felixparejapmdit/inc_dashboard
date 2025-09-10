const sequelize = require("../config/database");
const { Op } = require("sequelize");

// Import all models
const Group = require("./Group");
const User = require("./User");
const LoginAudit = require("./LoginAudit");
const Personnel = require("./personnels");
const UserGroupMapping = require("./UserGroupMapping");
const PermissionDefinition = require("./PermissionDefinition");
const PermissionCategory = require("./PermissionCategory");
const GroupPermissionMapping = require("./GroupPermissionMapping");

const Location = require("./Location");
const Event = require("./Event");
const Department = require("./Department");
const Section = require("./Section");

/* ==============================
   DEFINE ASSOCIATIONS
============================== */

// 🔹 User ↔ LoginAudit
User.hasMany(LoginAudit, { foreignKey: "user_id", as: "loginAudits" });
LoginAudit.belongsTo(User, { foreignKey: "user_id", as: "user" });

// 🔹 Personnel ↔ User
Personnel.hasOne(User, { foreignKey: "personnel_id" });
User.belongsTo(Personnel, { foreignKey: "personnel_id" });

// 🔹 Group ↔ UserGroupMapping
Group.hasMany(UserGroupMapping, { foreignKey: "group_id" });
UserGroupMapping.belongsTo(Group, { foreignKey: "group_id" });

User.hasMany(UserGroupMapping, { foreignKey: "user_id" });
UserGroupMapping.belongsTo(User, { foreignKey: "user_id" });

// 🔹 Permission ↔ GroupPermissionMapping
PermissionDefinition.hasMany(GroupPermissionMapping, {
  foreignKey: "permission_id",
  as: "groupMappings",
});
GroupPermissionMapping.belongsTo(PermissionDefinition, {
  foreignKey: "permission_id",
  as: "permission",
});

PermissionCategory.hasMany(GroupPermissionMapping, {
  foreignKey: "category_id",
  as: "mappings",
});
GroupPermissionMapping.belongsTo(PermissionCategory, {
  foreignKey: "category_id",
  as: "category",
});

// 🔹 Location ↔ Event
Location.hasMany(Event, {
  foreignKey: "location_id",
  as: "events",
  onDelete: "CASCADE",
});
Event.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
  onDelete: "CASCADE",
});

// 🔹 Personnel ↔ Section (FIXED ALIAS)
Personnel.belongsTo(Section, {
  foreignKey: "section_id",
  as: "personnelSection",
});

/* ==============================
   SYNC SEQUENTIALLY
============================== */
(async () => {
  try {
    console.log("⏳ Syncing parent tables first...");

    // Step 1: Sync reference/parent tables
    await Section.sync({ alter: true });
    console.log("✅ Sections synced");

    await Department.sync({ alter: true });
    await Group.sync({ alter: true });
    await PermissionDefinition.sync({ alter: true });
    await PermissionCategory.sync({ alter: true });
    await Location.sync({ alter: true });
    await Event.sync({ alter: true });
    console.log("✅ Other parent tables synced");

    // Step 2: Clean invalid section_id in Personnel
    console.log("⏳ Clearing invalid section references in Personnel...");
    await Personnel.update(
      { section_id: null },
      {
        where: {
          section_id: {
            [Op.notIn]: sequelize.literal("(SELECT id FROM sections)"),
          },
        },
      }
    );
    console.log("✅ Cleared invalid section references in Personnel");

    // Step 3: Sync Personnel
    await Personnel.sync({ alter: true });
    console.log("✅ Personnel synced");

    // Step 4: Sync remaining dependent tables
    await User.sync({ alter: true });
    await UserGroupMapping.sync({ alter: true });
    await GroupPermissionMapping.sync({ alter: true });
    await LoginAudit.sync({ alter: true });

    console.log("🎉 Database fully synchronized successfully!");
  } catch (err) {
    console.error("❌ Failed to sync database:", err);
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
  Department,
  Section,
};
