const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FaceRecognition = sequelize.define(
    "FaceRecognition",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        personnel_id: {
            type: DataTypes.BIGINT(20),
            allowNull: false,
            unique: true,
            references: {
                model: "personnels",
                key: "personnel_id",
            },
        },
        face_descriptor: {
            type: DataTypes.TEXT("long"), // Store JSON array of face descriptors
            allowNull: false,
            comment: "Face descriptor array from face-api.js",
        },
        is_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: "Whether face recognition login is enabled for this user",
        },
        enrolled_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        last_used_at: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: "Last time face recognition was used for login",
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "face_recognition",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = FaceRecognition;
