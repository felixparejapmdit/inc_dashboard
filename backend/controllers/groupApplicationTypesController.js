const sequelize = require("../config/database");
const Group = require("../models/Group");
const ApplicationType = require("../models/ApplicationType");
const GroupApplicationTypeMapping = require("../models/GroupApplicationTypeMapping");
const migrateGroupApplicationTypes = require("../scripts/migrate_group_application_types");

let groupApplicationTypesMigrationPromise = null;

const ensureGroupApplicationTypesTable = async () => {
  if (!groupApplicationTypesMigrationPromise) {
    groupApplicationTypesMigrationPromise = migrateGroupApplicationTypes(false).catch((error) => {
      groupApplicationTypesMigrationPromise = null;
      throw error;
    });
  }

  return groupApplicationTypesMigrationPromise;
};

const normalizeVisibility = (value) => {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value === 1 ? 1 : 0;
  if (typeof value === "string") {
    return ["1", "true", "yes", "on"].includes(value.toLowerCase()) ? 1 : 0;
  }
  return 0;
};

exports.getGroupApplicationTypes = async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    await ensureGroupApplicationTypesTable();

    const applicationTypes = await sequelize.query(
      `
      SELECT
        appt.id,
        appt.name,
        appt.createdAt,
        appt.updatedAt,
        COALESCE(gatm.is_visible, 1) AS is_visible,
        COUNT(apps.id) AS app_count
      FROM applicationtypes appt
      LEFT JOIN group_application_type_mappings gatm
        ON gatm.application_type_id = appt.id
        AND gatm.group_id = :groupId
      LEFT JOIN apps
        ON apps.app_type = appt.id
      GROUP BY
        appt.id,
        appt.name,
        appt.createdAt,
        appt.updatedAt,
        gatm.is_visible
      ORDER BY appt.id ASC
      `,
      {
        replacements: { groupId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json(applicationTypes);
  } catch (error) {
    console.error("Error fetching group application types:", error);
    res.status(500).json({
      message: "Error fetching application visibility",
      error: error.message,
    });
  }
};

exports.updateGroupApplicationType = async (req, res) => {
  const groupId = req.params.id;
  const applicationTypeId = req.params.applicationTypeId;
  const isVisible = normalizeVisibility(req.body.is_visible);

  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const applicationType = await ApplicationType.findByPk(applicationTypeId);
    if (!applicationType) {
      return res.status(404).json({ message: "Application type not found." });
    }

    await ensureGroupApplicationTypesTable();

    const [mapping, created] = await GroupApplicationTypeMapping.findOrCreate({
      where: {
        group_id: groupId,
        application_type_id: applicationTypeId,
      },
      defaults: {
        is_visible: isVisible,
      },
    });

    if (!created) {
      mapping.is_visible = isVisible;
      await mapping.save();
    }

    res.status(200).json({
      message: "Application visibility saved",
      data: mapping,
    });
  } catch (error) {
    console.error("Error updating group application type:", error);
    res.status(500).json({
      message: "Error saving application visibility",
      error: error.message,
    });
  }
};
