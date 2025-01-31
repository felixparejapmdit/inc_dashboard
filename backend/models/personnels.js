const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Section = require("./Section");

const Personnel = sequelize.define(
  "Personnel",
  {
    personnel_id: {
      type: DataTypes.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
    },
    reference_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    enrollment_progress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    personnel_progress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    civil_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    wedding_anniversary: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    givenname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    middlename: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    surname_maiden: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    surname_husband: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    suffix: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    registered_district_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    registered_local_congregation: {
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
    datejoined: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    language_id: {
      type: DataTypes.STRING, // Store as a comma-separated string
      allowNull: true,
      get() {
        const value = this.getDataValue("language_id");
        return value ? value.split(",").map(Number) : [];
      },
      set(value) {
        this.setDataValue(
          "language_id",
          Array.isArray(value) ? value.join(",") : ""
        );
      },
    },

    bloodtype: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    work_email_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    email_address: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    citizenship: {
      type: DataTypes.STRING, // Store as a comma-separated string
      allowNull: true,
      get() {
        const value = this.getDataValue("citizenship");
        return value ? value.split(",").map(Number) : [];
      },
      set(value) {
        this.setDataValue(
          "citizenship",
          Array.isArray(value) ? value.join(",") : ""
        );
      },
    },
    nationality: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Departments",
        key: "id",
      },
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
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    local_congregation: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    personnel_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    district_assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    local_congregation_assignment: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    assigned_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    m_status: {
      type: DataTypes.STRING(50),
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
    tableName: "personnels", // Ensure this matches your actual table name
    timestamps: true, // Disable automatic timestamps
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Personnel.belongsTo(Section, { foreignKey: "section_id", as: "Section" });

module.exports = Personnel;
