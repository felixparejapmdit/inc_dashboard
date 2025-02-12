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
    timestamps: false,
  }
);

module.exports = ApplicationType;
