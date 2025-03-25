// backend/models/LokalProfile.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LokalProfile = sequelize.define(
  "LokalProfile",
  {
    district: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lokal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    anniversary: DataTypes.DATE,
    serialNumber: DataTypes.STRING,
    destinado: DataTypes.STRING,
    destinadoContact: DataTypes.STRING,
    districtChronicler: DataTypes.STRING,
    chroniclerContact: DataTypes.STRING,
    districtMinister: DataTypes.STRING,
    ministerContact: DataTypes.STRING,
    seatingCapacity: DataTypes.INTEGER,
    distanceFromCentral: DataTypes.STRING,
    travelTimeFromCentral: DataTypes.STRING,
    internetSpeed: DataTypes.STRING,
    ledWall: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    generator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    preparedBy: DataTypes.STRING,
    signature: DataTypes.STRING,
    datePrepared: DataTypes.DATE,
    imageUrl: DataTypes.STRING,
    scheduleMidweek: DataTypes.JSON,
    scheduleWeekend: DataTypes.JSON,
  },
  {
    tableName: "lokal_profiles", // ✅ Explicit table name
    timestamps: true, // ✅ Enable createdAt/updatedAt
    createdAt: "createdAt", // ✅ Use 'created_at' column
    updatedAt: "updatedAt", // ✅ Use 'updated_at' column
  }
);

module.exports = LokalProfile;
