const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const News = sequelize.define(
    "News",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        excerpt: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT("long"),
            allowNull: true,
        },
        author: {
            type: DataTypes.STRING(100),
            defaultValue: "Admin",
        },
        category: {
            type: DataTypes.STRING(50),
            defaultValue: "Local", // 'Local' or 'Foreign'
        },
        is_important: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        source_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        published_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "news_updates",
        timestamps: true,
    }
);

module.exports = News;
