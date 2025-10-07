const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PhoneDirectory = sequelize.define(
  "PhoneDirectory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    prefix: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    extension: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    phone_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dect_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "phone_directories",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = PhoneDirectory;
