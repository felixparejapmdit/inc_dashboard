// models/personnels.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Personnels = sequelize.define(
  "Personnels",
  {
    personnel_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    enrollment_progress: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5", "6", "7", "8", "9", "10"),
      allowNull: true,
    },
    personnel_progress: {
      type: DataTypes.ENUM(
        "District Office",
        "Section Chief(first_attempt)",
        "Enrollment",
        "Security Section",
        "ATG Office",
        "PMD-IT",
        "Personnel Office",
        "Section Chief"
      ),
      allowNull: true,
    },
    givenname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // middlename: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,
    // },
    lastname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    suffix: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    languages: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    place_of_birth: {
      type: DataTypes.STRING(50),
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
      type: DataTypes.ENUM("Single", "Married", "Divorced"),
      allowNull: true,
    },
    wedding_anniversary: {
      type: DataTypes.DATE,
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
    contact_info: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    government_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    local_congregation: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inc_status: {
      type: DataTypes.ENUM("Active", "Non-Active"),
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subsection_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    designation_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    datejoined: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    personnel_type: {
      type: DataTypes.ENUM(
        "Minister",
        "Regular",
        "Ministerial Student",
        "Minister's Wife",
        "Lay Member"
      ),
      allowNull: true,
    },
    assigned_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    m_type: {
      type: DataTypes.ENUM("May Destino", "Fulltime"),
      allowNull: true,
    },
    panunumpa_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ordination_date: {
      type: DataTypes.DATE,
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
    tableName: "personnels",
    timestamps: false,
  }
);

module.exports = Personnels;
