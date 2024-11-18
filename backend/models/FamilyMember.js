const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");

const FamilyMember = db.define("FamilyMember", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  personnel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  relationship_type: {
    type: DataTypes.ENUM("Father", "Mother", "Sibling", "Spouse", "Child"),
    allowNull: false,
  },
  givenname: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  middlename: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lastname: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  suffix: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM("Male", "Female"),
    allowNull: false,
  },
  bloodtype: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  civil_status: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Add all other fields from the schema...
}, {
  tableName: "family_members",
  timestamps: true,
});

module.exports = FamilyMember;
