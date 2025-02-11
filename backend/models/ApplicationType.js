const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Adjust path to your DB config

const ApplicationType = sequelize.define(
  "ApplicationType",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: true } // Enables created_at & updated_at
);

module.exports = ApplicationType;
