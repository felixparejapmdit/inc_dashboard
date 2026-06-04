const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaskCategory = sequelize.define(
  "TaskCategory",
  {
    category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
  },
  {
    tableName: "categories",
    timestamps: false,
  }
);

module.exports = TaskCategory;
