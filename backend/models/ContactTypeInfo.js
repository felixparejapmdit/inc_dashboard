const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContactTypeInfo = sequelize.define(
  "ContactTypeInfo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
  },
  {
    tableName: "contact_type_info",
    timestamps: false,
  }
);

module.exports = ContactTypeInfo;
