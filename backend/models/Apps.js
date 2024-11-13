// models/App.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const App = sequelize.define(
  "App",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    icon: {
      type: DataTypes.TEXT, // Assuming the icon is stored as base64 or URL
      allowNull: true,
    },
  },
  {
    tableName: "apps",
    timestamps: false,
  }
);

module.exports = App;
