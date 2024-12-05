const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PersonnelImage = sequelize.define(
  "PersonnelImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    personnel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: "personnel_images", // Ensure this matches your actual table name
    timestamps: false, // Disable automatic timestamps
  }
);

module.exports = PersonnelImage;
