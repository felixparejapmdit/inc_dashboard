const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Setting = sequelize.define(
  "Setting",
  {
    setting_key: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    setting_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "settings",
    timestamps: false, // Disable createdAt and updatedAt
  }
);

module.exports = Setting;
