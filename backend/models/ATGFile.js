const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ATGFile = sequelize.define(
    "ATGFile",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        file_path: {
            type: DataTypes.STRING(1024),
            allowNull: false,
        },
        file_type: {
            type: DataTypes.STRING(50),
            // e.g., 'pdf', 'xlsx', 'image', 'docx'
        },
        category: {
            type: DataTypes.STRING(50),
            defaultValue: "General",
            // e.g., 'OrgChart', 'Report', 'Memo'
        },
        uploaded_by: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
    },
    {
        tableName: "atg_files",
        timestamps: true, // Auto-create createdAt, updatedAt
    }
);

module.exports = ATGFile;
