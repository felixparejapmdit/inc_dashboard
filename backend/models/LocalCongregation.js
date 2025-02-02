const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LocalCongregation = sequelize.define(
  "LocalCongregation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "districts",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "local_congregation",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = LocalCongregation;
