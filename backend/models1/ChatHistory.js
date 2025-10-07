const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChatHistory = sequelize.define("ChatHistory", {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sender: {
    type: DataTypes.ENUM("user", "bot"),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = ChatHistory;
