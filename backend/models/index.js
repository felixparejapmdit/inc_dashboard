const Group = require("./Group");
const User = require("./User");
const UserGroupMapping = require("./UserGroupMapping");

// Define associations
Group.hasMany(UserGroupMapping, { foreignKey: "group_id" });
UserGroupMapping.belongsTo(Group, { foreignKey: "group_id" });

User.hasMany(UserGroupMapping, { foreignKey: "user_id" });
UserGroupMapping.belongsTo(User, { foreignKey: "user_id" });

module.exports = { Group, User, UserGroupMapping };
