const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PersonnelHistory = sequelize.define(
    "PersonnelHistory",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        personnel_id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
        },
        action: {
            type: DataTypes.ENUM("In", "Out"),
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        performed_by: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "personnel_activity_logs",
        timestamps: false,
    }
);

const Personnel = require("./personnels");

PersonnelHistory.belongsTo(Personnel, {
    foreignKey: "personnel_id",
    targetKey: "personnel_id",
    as: "personnel",
});

module.exports = PersonnelHistory;
