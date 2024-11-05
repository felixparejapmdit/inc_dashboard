// models/LDAP_Users.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust the path to your database configuration

const LDAP_Users = sequelize.define(
  "LDAP_Users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cn: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    gidNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    givenName: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    homeDirectory: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    mail: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    sn: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    uid: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true,
    },
    uidNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userPassword: {
      type: DataTypes.STRING(255), // Adjust size if needed
      allowNull: false,
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
    tableName: "LDAP_Users",
    timestamps: false,
  }
);

module.exports = LDAP_Users;
