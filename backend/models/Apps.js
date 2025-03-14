const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ApplicationType = require("./ApplicationType");

const App = sequelize.define(
  "App",
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
    url: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    icon: {
      type: DataTypes.TEXT, // Assuming the icon is stored as base64 or URL
      allowNull: true,
    },
    app_type: {
      type: DataTypes.INTEGER, // Foreign key reference to ApplicationType
      allowNull: false,
      references: {
        model: ApplicationType,
        key: "id",
      },
    },
  },
  {
    tableName: "apps",
    timestamps: false,
  }
);

// **Define Association**
App.belongsTo(ApplicationType, {
  foreignKey: "app_type",
  as: "applicationType", // Make sure this alias matches in the query
});

module.exports = App;
