const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const UserGroupMapping = sequelize.define(
  "UserGroupMapping",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Composite primary key
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "user_group_mappings",
    timestamps: false, // Disable timestamps if not needed
  }
);

// Define the association with User
UserGroupMapping.belongsTo(User, { foreignKey: "user_id", as: "User" });

module.exports = UserGroupMapping;
