const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GovernmentIssuedID = sequelize.define(
  "GovernmentIssuedID",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
  },
  {
    tableName: "government_issued_id",
    timestamps: false,
  }
);

module.exports = GovernmentIssuedID;
