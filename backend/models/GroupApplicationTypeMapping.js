const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Group = require("./Group");
const ApplicationType = require("./ApplicationType");

const GroupApplicationTypeMapping = sequelize.define(
  "GroupApplicationTypeMapping",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    group_id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      references: {
        model: Group,
        key: "id",
      },
    },
    application_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ApplicationType,
        key: "id",
      },
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "group_application_type_mappings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["group_id", "application_type_id"],
      },
    ],
  }
);

module.exports = GroupApplicationTypeMapping;
