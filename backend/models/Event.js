const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Location = require("./Location");

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 50],
          msg: "Event name must be between 3 and 50 characters.",
        },
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
      },
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recurrence: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "none",
      validate: {
        isIn: {
          args: [["daily", "weekly", "monthly", "none"]],
          msg: "Recurrence must be one of: daily, weekly, monthly, or none.",
        },
      },
    },
  },
  {
    tableName: "events",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define relationships with cascading delete
Event.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
  onDelete: "CASCADE",
});
Location.hasMany(Event, {
  foreignKey: "location_id",
  as: "events",
  onDelete: "CASCADE",
});

module.exports = Event;
