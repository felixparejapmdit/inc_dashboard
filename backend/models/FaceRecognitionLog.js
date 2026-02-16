const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FaceRecognitionLog = sequelize.define(
    "FaceRecognitionLog",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        personnel_id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            references: {
                model: "personnels",
                key: "personnel_id",
            },
        },
        action: {
            type: DataTypes.ENUM("login", "attendance", "verification", "enrollment", "update"),
            allowNull: false,
            comment: "Type of action performed",
        },
        confidence_score: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "Confidence score of face match (0-1)",
        },
        success: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: "Whether the action was successful",
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
        user_agent: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        error_message: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Error message if action failed",
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "face_recognition_logs",
        timestamps: false,
    }
);

module.exports = FaceRecognitionLog;
