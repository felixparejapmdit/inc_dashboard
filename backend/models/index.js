const sequelize = require("../config/database"); // Ensure Sequelize is initialized
const Group = require("./Group");
const User = require("./User");
const LoginAudit = require("./LoginAudit");
const Personnel = require("./personnels");
const UserGroupMapping = require("./UserGroupMapping");
const PermissionDefinition = require("./PermissionDefinition");
const PermissionCategory = require("./PermissionCategory");
const GroupPermissionMapping = require("./GroupPermissionMapping");
const ApplicationType = require("./ApplicationType");
const GroupApplicationTypeMapping = require("./GroupApplicationTypeMapping");
const PersonnelHistory = require("./PersonnelHistory");
const Reminder = require("./Reminder");
const Suguan = require("./Suguan");
const File = require("./File");
const FileShare = require("./FileShare");
const Setting = require("./Setting");
const Lists = require("./Lists");
const FaceRecognition = require("./FaceRecognition");
const FaceRecognitionLog = require("./FaceRecognitionLog");
const LokalProfile = require("./LokalProfile");
const PersonnelImage = require("./PersonnelImage");
const TaskCategory = require("./TaskCategory");
const Task = require("./Task");
const AccomplishedLog = require("./AccomplishedLog");
const DailyActivityReport = require("./DailyActivityReport");
const ATGFile = require("./ATGFile");

// Sync database
sequelize
  .sync()
  .then(async () => {
    console.log("Database synchronized successfully.");
    // Run startup schema migrations after sync.
    try {
      const migrateTasks = require("../scripts/migrate_tasks_priority_kanban");
      await migrateTasks(false);
      console.log("✅ Tasks database migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Tasks database migration failed:", migErr);
    }
    try {
      const migrateAppsIcon = require("../scripts/migrate_apps_icon_longtext");
      await migrateAppsIcon(false);
      console.log("✅ Apps icon migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Apps icon migration failed:", migErr);
    }
    try {
      const migrateAppsStatus = require("../scripts/migrate_apps_status");
      await migrateAppsStatus(false);
      console.log("✅ Apps status migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Apps status migration failed:", migErr);
    }
    try {
      const migrateAtgFiles = require("../scripts/migrate_atg_files_folders");
      await migrateAtgFiles(false);
      console.log("✅ ATG files migration completed successfully.");
    } catch (migErr) {
      console.error("❌ ATG files migration failed:", migErr);
    }
    try {
      const migrateDarColumns = require("../scripts/migrate_daily_activity_report_columns");
      await migrateDarColumns(false);
      console.log("✅ Daily activity report migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Daily activity report migration failed:", migErr);
    }
    try {
      const migrateGroupApplicationTypes = require("../scripts/migrate_group_application_types");
      await migrateGroupApplicationTypes(false);
      console.log("✅ Group application type visibility migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Group application type visibility migration failed:", migErr);
    }
    try {
      const migrateUsersWebdavUrl = require("../scripts/migrate_users_webdav_url");
      await migrateUsersWebdavUrl(false);
      console.log("✅ Users WebDAV URL migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Users WebDAV URL migration failed:", migErr);
    }
    try {
      const migrateLdapUsersRemovePassword = require("../scripts/migrate_ldap_users_remove_password");
      await migrateLdapUsersRemovePassword(false);
      console.log("✅ LDAP_Users password column migration completed successfully.");
    } catch (migErr) {
      console.error("❌ LDAP_Users password column migration failed:", migErr);
    }
    try {
      const seedWebDavPluginPermission = require("../scripts/seed_webdav_plugin_permission");
      await seedWebDavPluginPermission(false);
      console.log("✅ WebDAV plugin permission seed completed successfully.");
    } catch (seedErr) {
      console.error("❌ WebDAV plugin permission seed failed:", seedErr);
    }
    try {
      const migratePersonnelStatusChangeColumns = require("../scripts/migrate_personnel_status_change_columns");
      await migratePersonnelStatusChangeColumns(false);
      console.log("✅ Personnel status change column migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Personnel status change column migration failed:", migErr);
    }
    try {
      const seedPersonnelStatusChangePermission = require("../scripts/seed_personnel_status_change_permission");
      await seedPersonnelStatusChangePermission(false);
      console.log("✅ Personnel status change permission seed completed successfully.");
    } catch (seedErr) {
      console.error("❌ Personnel status change permission seed failed:", seedErr);
    }
    try {
      const migrateTasksSuguanId = require("../scripts/migrate_tasks_suguan_id");
      await migrateTasksSuguanId(false);
      console.log("✅ Tasks suguan_id column migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Tasks suguan_id column migration failed:", migErr);
    }
    try {
      const migrateSuguanEndTime = require("../scripts/migrate_suguan_end_time");
      await migrateSuguanEndTime(false);
      console.log("✅ Suguan end_time column migration completed successfully.");
    } catch (migErr) {
      console.error("❌ Suguan end_time column migration failed:", migErr);
    }
    try {
      const count = await TaskCategory.count();
      if (count === 0) {
        await TaskCategory.bulkCreate([
          { category_name: "Worship Service",     color_hex: "#DC2626" },  // Rich Crimson / Dark Red
          { category_name: "Office Task",          color_hex: "#D97706" },  // Warm Amber / Gold
          { category_name: "Outside Office Task",  color_hex: "#7C3AED" },  // Modern Purple / Indigo
          { category_name: "Personal Task",        color_hex: "#2563EB" },  // Vibrant Royal Blue
        ]);
        console.log("Default Task Categories seeded successfully.");
      }
    } catch (seedErr) {
      console.error("Failed to seed default categories:", seedErr);
    }
    try {
      const { backfillSuguanTasks } = require("../utils/suguanTaskSync");
      const syncedCount = await backfillSuguanTasks();
      console.log(`✅ Suguan tasks backfill completed successfully (${syncedCount} synced).`);
    } catch (syncErr) {
      console.error("❌ Suguan tasks backfill failed:", syncErr);
    }
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

// 🧩 Define associations here
User.hasMany(LoginAudit, { foreignKey: "user_id", as: "loginAudits" });
LoginAudit.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Define associations after all models are initialized
Personnel.hasOne(User, { foreignKey: "personnel_id" });
User.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" });

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

Group.hasMany(GroupApplicationTypeMapping, {
  foreignKey: "group_id",
  as: "applicationTypeMappings",
});

GroupApplicationTypeMapping.belongsTo(Group, {
  foreignKey: "group_id",
  as: "group",
});

ApplicationType.hasMany(GroupApplicationTypeMapping, {
  foreignKey: "application_type_id",
  as: "groupMappings",
});

GroupApplicationTypeMapping.belongsTo(ApplicationType, {
  foreignKey: "application_type_id",
  as: "applicationType",
});

// FaceRecognition associations
Personnel.hasOne(FaceRecognition, { foreignKey: "personnel_id", as: "faceRecognition" });
FaceRecognition.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" });

Personnel.hasMany(FaceRecognitionLog, { foreignKey: "personnel_id", as: "faceRecognitionLogs" });
FaceRecognitionLog.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" });

Personnel.hasMany(PersonnelImage, { foreignKey: "personnel_id", as: "images" });
PersonnelImage.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" });

// DAR associations
TaskCategory.hasMany(Task, { foreignKey: "category_id", as: "tasks" });
Task.belongsTo(TaskCategory, { foreignKey: "category_id", as: "category" });

User.hasMany(Task, { foreignKey: "user_id", as: "tasks" });
Task.belongsTo(User, { foreignKey: "user_id", as: "user" });

Task.hasMany(AccomplishedLog, { foreignKey: "task_id", as: "logs" });
AccomplishedLog.belongsTo(Task, { foreignKey: "task_id", as: "task" });

User.hasMany(DailyActivityReport, { foreignKey: "user_id", as: "dailyReports" });
DailyActivityReport.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Export all models
module.exports = {
  sequelize, // Optional if needed elsewhere
  Group,
  User,
  Personnel,
  UserGroupMapping,
  PermissionDefinition,
  PermissionCategory,
  GroupPermissionMapping,
  ApplicationType,
  GroupApplicationTypeMapping,
  LoginAudit,
  Reminder,
  File,
  FileShare,
  Setting,
  Lists,
  FaceRecognition,
  FaceRecognitionLog,
  LokalProfile,
  PersonnelImage,
  TaskCategory,
  Task,
  AccomplishedLog,
  DailyActivityReport,
  Suguan,
  ATGFile,
};
