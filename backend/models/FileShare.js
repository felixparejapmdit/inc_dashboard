// models/FileShare.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const File = require("./File");
const User = require("./User");

const FileShare = sequelize.define(
  "FileShare",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    file_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "files", // Assumes you have a "files" table
        key: "id",
      },
      onDelete: "CASCADE", // Deleting the file will remove the share
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Assumes you have a "users" table
        key: "id",
      },
      onDelete: "CASCADE", // Deleting the user will remove the share
    },
    shared_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "file_shares",
    timestamps: false, // Assuming we don't need automatic timestamps
  }
);

File.belongsToMany(User, {
  through: FileShare,
  foreignKey: "file_id",
  as: "sharedWithUsers", // Alias for the relationship
});
User.belongsToMany(File, {
  through: FileShare,
  foreignKey: "user_id",
  as: "sharedFiles", // Alias for the relationship
});

module.exports = FileShare;
