const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PersonnelDocuments = sequelize.define(
  "PersonnelDocuments",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    document_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    personnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    document_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "expired"),
      defaultValue: "active",
    },
  },
  {
    tableName: "personnel_documents",
    timestamps: false, // Set to true if you want Sequelize to manage createdAt and updatedAt fields
  }
);

module.exports = PersonnelDocuments;
