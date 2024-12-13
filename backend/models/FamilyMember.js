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
    contact_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date_of_marriage: {
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
    church_duties: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    livelihood: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    local_congregation: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    minister_officiated: {
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
    department: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    section: {
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
    reason_for_leaving: {
      type: DataTypes.STRING(150),
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
    start_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    completion_year: {
      type: DataTypes.INTEGER,
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
    degree: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    institution: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    professional_licensure_examination: {
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
