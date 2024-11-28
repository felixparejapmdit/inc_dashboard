const User = require("./User");
const Group = require("./Group");
const UserGroupMapping = require("./UserGroupMapping");

// Many-to-Many relationship between User and Group via UserGroupMapping
User.belongsToMany(Group, {
  through: UserGroupMapping,
  foreignKey: "user_id",
  as: "groups",
});
Group.belongsToMany(User, {
  through: UserGroupMapping,
  foreignKey: "group_id",
  as: "users",
});

module.exports = { User, Group, UserGroupMapping };
