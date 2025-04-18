const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PhoneLocation = sequelize.define(
  "Location",
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
  },
  {
    tableName: "phone_locations",
    timestamps: true,
    createdAt: "created_at", // Map to 'created_at' column
    updatedAt: "updated_at", // Map to 'updated_at' column
  }
);

module.exports = PhoneLocation;
