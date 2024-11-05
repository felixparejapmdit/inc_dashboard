// models/PMD_Login_Users.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust the path to your database configuration

const PMD_Login_Users = sequelize.define(
  "PMD_Login_Users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "LDAP_Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    personnel_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    local_username: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    local_password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.BLOB("long"),
      allowNull: true,
    },
    online_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    auth_type: {
      type: DataTypes.ENUM("LDAP", "Local"),
      defaultValue: "LDAP",
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_failed_attempt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "PMD_Login_Users",
    timestamps: false,
  }
);

module.exports = PMD_Login_Users;
