const sequelize = require("../config/database"); // Ensure Sequelize is initialized
const Group = require("./Group");
const User = require("./User");
const LoginAudit = require("./LoginAudit");
const Personnel = require("./personnels");
const UserGroupMapping = require("./UserGroupMapping");
const PermissionDefinition = require("./PermissionDefinition");
const PermissionCategory = require("./PermissionCategory");
const GroupPermissionMapping = require("./GroupPermissionMapping");
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

// FaceRecognition associations
Personnel.hasOne(FaceRecognition, { foreignKey: "personnel_id", as: "faceRecognition" });
FaceRecognition.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" });

Personnel.hasMany(FaceRecognitionLog, { foreignKey: "personnel_id", as: "faceRecognitionLogs" });
FaceRecognitionLog.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" });

Personnel.hasMany(PersonnelImage, { foreignKey: "personnel_id", as: "images" });
PersonnelImage.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" });

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
  Suguan,
};
