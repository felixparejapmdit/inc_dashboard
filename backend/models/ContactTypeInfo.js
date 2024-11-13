const { DataTypes } = require("sequelize");
const db = require("../db");

const ContactTypeInfo = db.define("ContactTypeInfo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(25),
    allowNull: false,
  },
});

module.exports = ContactTypeInfo;
