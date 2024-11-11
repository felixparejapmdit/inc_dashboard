const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Section = sequelize.define(
  "Section",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING, // Adjust based on how you're storing images
      allowNull: true,
    },
  },
  {
    timestamps: false, // Disables automatic 'createdAt' and 'updatedAt' fields
  }
);

module.exports = Section;
