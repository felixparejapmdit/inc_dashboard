const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");

const FamilyMember = db.define(
  "FamilyMember",
  {
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
    place_of_marriage: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    citizenship: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nationality: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    contact_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    employment_type: {
      type: DataTypes.ENUM(
        "Self-employed",
        "Employed",
        "Government",
        "Private"
      ),
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    education_level: {
      type: DataTypes.ENUM(
        "Elementary",
        "Secondary",
        "Senior High School",
        "College"
      ),
      allowNull: true,
    },
    school: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    field_of_study: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: "family_members",
    timestamps: true,
    createdAt: "created_at", // Use specific column name
    updatedAt: "updated_at", // Use specific column name
  }
);

module.exports = FamilyMember;
