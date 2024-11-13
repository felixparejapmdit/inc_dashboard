const { DataTypes } = require("sequelize");
const db = require("../db");

const GovernmentIssuedID = db.define("GovernmentIssuedID", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(250),
    allowNull: false,
  },
});

module.exports = GovernmentIssuedID;
