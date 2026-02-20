const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Suguan = sequelize.define(
  "Suguan",
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
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    local_congregation: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    gampanin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subsection_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    personnel_id: {
      type: DataTypes.INTEGER,
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
    tableName: "suguan", // Ensure this matches your actual table name
    timestamps: false, // Disable automatic timestamps
  }
);

module.exports = Suguan;
