const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");

const PersonnelAddress = db.define(
  "PersonnelAddress",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    personnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
  },
  {
    tableName: "personnel_address",
    timestamps: false,
  }
);

module.exports = PersonnelAddress;
