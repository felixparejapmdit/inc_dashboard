const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ApplicationType = sequelize.define(
  "ApplicationType",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
  },
  {
    tableName: "applicationtypes",
    timestamps: true, // Disable automatic timestamps
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

module.exports = ApplicationType;
