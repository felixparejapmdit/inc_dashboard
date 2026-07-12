const moment = require("moment");
const Task = require("../models/Task");
const TaskCategory = require("../models/TaskCategory");
const Suguan = require("../models/Suguan");
const User = require("../models/User");

const WORSHIP_SERVICE_CATEGORY = "Worship Service";

const resolveUserIdForPersonnel = async (personnelId) => {
  if (!personnelId) return null;
  const user = await User.findOne({ where: { personnel_id: personnelId }, attributes: ["id"] });
  return user ? user.id : null;
};

const getWorshipServiceCategoryId = async () => {
  const category = await TaskCategory.findOne({ where: { category_name: WORSHIP_SERVICE_CATEGORY } });
  return category ? category.category_id : null;
};

const buildTaskFieldsFromSuguan = (suguan, userId, categoryId) => ({
  user_id: userId,
  category_id: categoryId,
  suguan_id: suguan.id,
  title: suguan.local_congregation ? `Suguan Duty – ${suguan.local_congregation}` : "Suguan Duty",
  description: `Suguan assignment for ${suguan.name || "personnel"}.`,
  local_congregations: suguan.local_congregation || null,
  task_date: moment(suguan.date).format("YYYY-MM-DD"),
  start_time: suguan.time || null,
  end_time: suguan.end_time || null,
  status: "Completed",
  kanban_status: "Done",
  priority: "Medium",
});

// Creates/updates the Task row that mirrors a Suguan assignment. Silently
// no-ops if the assigned personnel has no linked User account yet, since
// Task.user_id cannot be null.
exports.syncTaskForSuguan = async (suguan) => {
  try {
    const userId = await resolveUserIdForPersonnel(suguan.personnel_id);
    if (!userId) return null;

    const categoryId = await getWorshipServiceCategoryId();
    if (!categoryId) return null;

    const fields = buildTaskFieldsFromSuguan(suguan, userId, categoryId);
    const [task] = await Task.findOrCreate({
      where: { suguan_id: suguan.id },
      defaults: fields,
    });
    await task.update(fields);
    return task;
  } catch (error) {
    console.error("Failed to sync Task for Suguan:", error);
    return null;
  }
};

// Keeps the Suguan record (the source of truth) in sync whenever a linked
// Task's end time is edited from Daily Activity, so a later Suguan edit
// doesn't overwrite it with a stale/empty value.
exports.syncEndTimeToSuguan = async (suguanId, endTime) => {
  if (!suguanId) return;
  try {
    await Suguan.update(
      { end_time: endTime || null },
      { where: { id: suguanId }, fields: ["end_time"] }
    );
  } catch (error) {
    console.error("Failed to sync end time back to Suguan:", error);
  }
};

exports.deleteTaskForSuguan = async (suguanId) => {
  try {
    await Task.destroy({ where: { suguan_id: suguanId } });
  } catch (error) {
    console.error("Failed to delete Task for Suguan:", error);
  }
};

// Rebuilds missing mirrored tasks for every saved Suguan assignment.
exports.backfillSuguanTasks = async () => {
  try {
    const existingTaskSuguanIds = new Set(
      (await Task.findAll({
        attributes: ["suguan_id"],
        raw: true,
      }))
        .map((task) => task.suguan_id)
        .filter((suguanId) => suguanId !== null && suguanId !== undefined)
        .map((suguanId) => String(suguanId))
    );

    const suguanEntries = await Suguan.findAll({
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });

    let syncedCount = 0;
    for (const suguan of suguanEntries) {
      if (existingTaskSuguanIds.has(String(suguan.id))) {
        continue;
      }

      const task = await exports.syncTaskForSuguan(suguan);
      if (task) {
        existingTaskSuguanIds.add(String(suguan.id));
        syncedCount += 1;
      }
    }

    return syncedCount;
  } catch (error) {
    console.error("Failed to backfill Tasks for Suguan:", error);
    return 0;
  }
};
