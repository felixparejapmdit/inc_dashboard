const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User"); // Assuming you have a User model defined

const File = sequelize.define(
  "File",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    filename: {
      type: DataTypes.STRING(255), // Adjust the length as needed
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255), // Adjust the length as needed
      allowNull: false,
    },
    generated_code: {
      type: DataTypes.STRING(50), // Adjust the length as needed
      allowNull: false,
    },
    qrcode: {
      type: DataTypes.STRING(50), // Adjust the length as needed
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: true, // stores image path or URL
    },
    user_id: {
      type: DataTypes.INTEGER, // Assuming user_id is an integer
      allowNull: false,
      // You can add a foreign key reference if you have a User model
      // references: {
      //   model: 'Users', // Replace with your actual User model name
      //   key: 'id',
      // },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "files",
    timestamps: false, // Set to true if you want Sequelize to manage createdAt and updatedAt
  }
);

// ** Define Associations if needed **
// File.belongsTo(User, {
//   foreignKey: "user_id",
//   as: "user", // Alias for the association
// });

File.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = File;
