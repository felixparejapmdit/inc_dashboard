const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Personnel = require("./personnels");

const PersonnelChurchDuties = sequelize.define(
  "PersonnelChurchDuties",
  {
    id: {
      type: DataTypes.BIGINT(20),
      primaryKey: true,
      autoIncrement: true,
    },
    personnel_id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      references: {
        model: Personnel,
        key: "personnel_id", // Referencing the personnel_id from the Personnel table
      },
    },
    duty: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    start_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    end_year: {
      type: DataTypes.INTEGER,
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
    tableName: "personnel_church_duties",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define the relationship between Personnel and PersonnelChurchDuties
PersonnelChurchDuties.belongsTo(Personnel, {
  foreignKey: "personnel_id",
  as: "Personnel",
});

module.exports = PersonnelChurchDuties;
