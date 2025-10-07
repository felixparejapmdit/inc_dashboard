// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust the path to your database configuration
const Personnel = require("./personnels"); // Import Personnel model

const User = sequelize.define(
  "users",
  {
    ID: {
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
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT("long"), // or DataTypes.LONGTEXT if available
      allowNull: true, // Make sure this matches your database schema
    },
    isLoggedIn: {
      type: DataTypes.TINYINT,
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
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);
User.belongsTo(Personnel, { foreignKey: "personnel_id", as: "personnel" }); // Define association

module.exports = User;
