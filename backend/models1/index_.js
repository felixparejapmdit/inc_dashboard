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

// ✅ Personnel ↔ Department
Personnel.belongsTo(Department, {
  foreignKey: "department_id",
  as: "personnelDepartment",
});

// 🔹 Personnel ↔ Section
Personnel.belongsTo(Section, {
  foreignKey: "section_id",
  as: "personnelSection",
});

// ✅ Section ↔ Department
Section.belongsTo(Department, {
  foreignKey: "department_id",
  as: "sectionDepartment",
});

// You may also want to add the inverse association for clarity
Department.hasMany(Section, {
  foreignKey: "department_id",
  as: "sections",
});

/* ==============================
   SYNC SEQUENTIALLY
============================== */
(async () => {
  try {
    console.log("⏳ Syncing parent tables first...");

    // Step 1: Sync all parent tables
    await Department.sync({ alter: true });
    await Section.sync({ alter: true });
    await Group.sync({ alter: true });
    await PermissionDefinition.sync({ alter: true });
    await PermissionCategory.sync({ alter: true });
    await Location.sync({ alter: true });
    await Event.sync({ alter: true });
    await sequelize.models.LDAP_Users.sync({ alter: true });
    console.log("✅ All parent tables synced");

    // Step 2: Delete invalid foreign key data from all dependent tables
    console.log("⏳ Deleting invalid foreign key references...");

    // Deleting rows with invalid foreign keys from personnels
    await sequelize.query(`
      DELETE FROM personnels
      WHERE section_id IS NOT NULL AND section_id NOT IN (
        SELECT id FROM sections
      );
    `);
    await sequelize.query(`
      DELETE FROM personnels
      WHERE department_id IS NOT NULL AND department_id NOT IN (
        SELECT id FROM departments
      );
    `);

    // Deleting rows from group_permission_mappings
    await sequelize.query(`
      DELETE t1 FROM group_permission_mappings AS t1
      LEFT JOIN permission_categories AS t2
      ON t1.category_id = t2.id
      WHERE t2.id IS NULL;
    `);

    // Deleting rows from login_audit with invalid user_id
    await sequelize.query(`
      DELETE t1 FROM login_audit AS t1
      LEFT JOIN users AS t2
      ON t1.user_id = t2.ID
      WHERE t2.ID IS NULL;
    `);

    // FIX: A more robust delete query for users with invalid uid
    await sequelize.query(`
      DELETE t1 FROM users AS t1
      LEFT JOIN LDAP_Users AS t2
      ON t1.uid = t2.id
      WHERE t2.id IS NULL;
    `);

    console.log("✅ Deleted invalid foreign key references");

    // Step 3: Sync dependent tables
    await Personnel.sync({ alter: true });
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