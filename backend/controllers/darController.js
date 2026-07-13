const { Op } = require("sequelize");
const sequelize = require("../config/database");
const User = require("../models/User");
const TaskCategory = require("../models/TaskCategory");
const Task = require("../models/Task");
const AccomplishedLog = require("../models/AccomplishedLog");
const DailyActivityReport = require("../models/DailyActivityReport");
const { syncEndTimeToSuguan } = require("../utils/suguanTaskSync");

let taskTableColumnsCache = null;

const getTaskTableColumns = async () => {
  if (!taskTableColumnsCache) {
    const columns = await sequelize.getQueryInterface().describeTable("tasks");
    taskTableColumnsCache = new Set(Object.keys(columns));
  }

  return taskTableColumnsCache;
};

const pickTaskColumns = async (payload) => {
  const tableColumns = await getTaskTableColumns();
  const filtered = {};

  for (const [key, value] of Object.entries(payload || {})) {
    if (tableColumns.has(key)) {
      filtered[key] = value;
    }
  }

  return filtered;
};

const resolveDarUserId = async (req, requestedUserId = null) => {
  const normalizeNumericId = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && String(parsed) === String(value).trim()
      ? parsed
      : null;
  };

  const directRequestedId = normalizeNumericId(requestedUserId);
  if (directRequestedId) return directRequestedId;

  const tokenUserId = normalizeNumericId(req.user?.id);
  if (tokenUserId) return tokenUserId;

  const usernamesToTry = [req.user?.username, req.user?.id]
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());

  for (const username of usernamesToTry) {
    const user = await User.findOne({
      where: { username },
      attributes: ["id"],
    });

    if (user?.id) {
      return user.id;
    }
  }

  return null;
};

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

exports.getCategories = async (req, res) => {
  try {
    const categories = await TaskCategory.findAll({ order: [["category_id", "ASC"]] });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories.", error: err.message });
  }
};

// ─── TASKS ─────────────────────────────────────────────────────────────────────

exports.getTasks = async (req, res) => {
  try {
    const { user_id, date, week_start, week_end, status } = req.query;
    const targetUserId = await resolveDarUserId(req, user_id);

    if (!targetUserId) {
      return res.status(400).json({
        message: "Unable to resolve the current user for DAR tasks.",
      });
    }

    const where = {};
    if (targetUserId) where.user_id = targetUserId;
    if (status)  where.status = status;
    if (date)    where.task_date = date;
    if (!date && week_start && week_end) {
      where[Op.or] = [
        { task_date: { [Op.between]: [week_start, week_end] } },
        {
          task_date: { [Op.lt]: week_start },
          status: { [Op.ne]: "Completed" },
          kanban_status: { [Op.ne]: "Done" },
        },
      ];
    }

    const tasks = await Task.findAll({
      where,
      include: [{ model: TaskCategory, as: "category" }],
      order: [["task_date", "ASC"], ["start_time", "ASC"]],
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks.", error: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: TaskCategory,   as: "category" },
        { model: AccomplishedLog, as: "logs" },
      ],
    });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task.", error: err.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const taskData = await pickTaskColumns({ ...req.body });
    delete taskData.suguan_id; // only the Suguan sync job may set this
    const resolvedUserId = await resolveDarUserId(req);

    if (!resolvedUserId) {
      return res.status(400).json({
        message: "Unable to resolve the current user for this task.",
      });
    }

    taskData.user_id = resolvedUserId;
    if (taskData.status === "Completed") {
      taskData.kanban_status = "Done";
    }
    if (taskData.kanban_status === "Done") {
      taskData.status = "Completed";
    }

    const task = await Task.create(taskData, {
      fields: Object.keys(taskData),
    });
    res.status(201).json(task);
  } catch (err) {
    console.error("❌ Error in createTask:", err);
    res.status(500).json({ message: "Failed to create task.", error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const existing = await Task.findByPk(req.params.id, { attributes: ["task_id", "suguan_id"] });
    if (!existing) return res.status(404).json({ message: "Task not found." });

    const updateData = await pickTaskColumns({ ...req.body });
    delete updateData.suguan_id; // only the Suguan sync job may set this

    if (existing.suguan_id) {
      const allowedSuguanFields = {};
      if (Object.prototype.hasOwnProperty.call(updateData, "end_time")) {
        allowedSuguanFields.end_time = updateData.end_time || null;
      }

      if (Object.keys(allowedSuguanFields).length === 0) {
        return res.status(400).json({
          message: "Suguan tasks can only update the end time from Daily Activity.",
        });
      }

      const [updated] = await Task.update(allowedSuguanFields, {
        where: { task_id: req.params.id },
        fields: Object.keys(allowedSuguanFields),
      });

      if (!updated) return res.status(404).json({ message: "Task not found." });

      if (Object.prototype.hasOwnProperty.call(allowedSuguanFields, "end_time")) {
        await syncEndTimeToSuguan(existing.suguan_id, allowedSuguanFields.end_time);
      }

      const task = await Task.findByPk(req.params.id, {
        include: [{ model: TaskCategory, as: "category" }],
      });
      return res.json(task);
    }

    if (updateData.status === "Completed") {
      updateData.kanban_status = "Done";
    }
    if (updateData.kanban_status === "Done") {
      updateData.status = "Completed";
    }
    if (updateData.status === "Active" && updateData.kanban_status === "Done") {
      updateData.kanban_status = "New";
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No valid task fields were provided for update.",
      });
    }

    const [updated] = await Task.update(updateData, {
      where: { task_id: req.params.id },
      fields: Object.keys(updateData),
    });
    if (!updated) return res.status(404).json({ message: "Task not found." });
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: TaskCategory, as: "category" }],
    });
    res.json(task);
  } catch (err) {
    console.error("❌ Error in updateTask:", err);
    res.status(500).json({ message: "Failed to update task.", error: err.message });
  }
};

exports.updateTaskEndTime = async (req, res) => {
  try {
    const existing = await Task.findByPk(req.params.id, {
      attributes: ["task_id", "suguan_id", "end_time"],
    });
    if (!existing) {
      return res.status(404).json({ message: "Task not found." });
    }
    if (!existing.suguan_id) {
      return res.status(400).json({
        message: "This endpoint is only for tasks managed from Suguan.",
      });
    }

    const hasEndTime = Object.prototype.hasOwnProperty.call(req.body || {}, "end_time");
    const nextEndTime = hasEndTime
      ? (req.body.end_time === "" ? null : req.body.end_time)
      : existing.end_time || null;

    const [updated] = await Task.update(
      { end_time: nextEndTime },
      {
        where: { task_id: req.params.id },
        fields: ["end_time"],
      }
    );

    if (!updated) return res.status(404).json({ message: "Task not found." });

    await syncEndTimeToSuguan(existing.suguan_id, nextEndTime);

    const task = await Task.findByPk(req.params.id, {
      include: [{ model: TaskCategory, as: "category" }],
    });
    res.json(task);
  } catch (err) {
    console.error("❌ Error in updateTaskEndTime:", err);
    res.status(500).json({ message: "Failed to update end time.", error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const existing = await Task.findByPk(req.params.id, { attributes: ["task_id", "suguan_id"] });
    if (!existing) return res.status(404).json({ message: "Task not found." });
    if (existing.suguan_id) {
      return res.status(400).json({
        message: "This task is managed automatically from Suguan and cannot be deleted directly.",
      });
    }

    const deleted = await Task.destroy({ where: { task_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    console.error("❌ Error in deleteTask:", err);
    res.status(500).json({ message: "Failed to delete task.", error: err.message });
  }
};

// ─── ACCOMPLISHED LOGS ─────────────────────────────────────────────────────────

exports.getLogs = async (req, res) => {
  try {
    const { user_id, week_start, week_end } = req.query;
    const targetUserId = await resolveDarUserId(req, user_id);

    if (!targetUserId) {
      return res.status(400).json({
        message: "Unable to resolve the current user for DAR logs.",
      });
    }

    let taskWhere = {};
    if (targetUserId) taskWhere.user_id = targetUserId;
    if (week_start && week_end)
      taskWhere.task_date = { [Op.between]: [week_start, week_end] };

    const logs = await AccomplishedLog.findAll({
      include: [{
        model: Task,
        as: "task",
        where: taskWhere,
        include: [{ model: TaskCategory, as: "category" }],
      }],
      order: [["created_at", "DESC"]],
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs.", error: err.message });
  }
};

exports.upsertLog = async (req, res) => {
  try {
    const { task_id, completed_time, hours_rendered } = req.body;
    const [log, created] = await AccomplishedLog.findOrCreate({
      where: { task_id },
      defaults: { completed_time, hours_rendered },
    });
    if (!created) await log.update({ completed_time, hours_rendered });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: "Failed to save log.", error: err.message });
  }
};

// ─── DAILY ACTIVITY REPORTS ────────────────────────────────────────────────────

exports.getReports = async (req, res) => {
  try {
    const { user_id, week_start, week_end } = req.query;
    const targetUserId = await resolveDarUserId(req, user_id);

    if (!targetUserId) {
      return res.status(400).json({
        message: "Unable to resolve the current user for DAR reports.",
      });
    }

    const where = {};
    if (targetUserId) where.user_id = targetUserId;
    if (week_start && week_end)
      where.report_date = { [Op.between]: [week_start, week_end] };

    const reports = await DailyActivityReport.findAll({
      where,
      order: [["report_date", "ASC"]],
    });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports.", error: err.message });
  }
};

exports.upsertReport = async (req, res) => {
  try {
    const { user_id, report_date, accomplishments, remarks, personnel_remarks } = req.body;
    const targetUserId = await resolveDarUserId(req, user_id);
    if (!targetUserId) {
      return res.status(400).json({ message: "User ID is required." });
    }
    const [report, created] = await DailyActivityReport.findOrCreate({
      where: { user_id: targetUserId, report_date },
      defaults: { accomplishments, remarks, personnel_remarks },
    });
    if (!created)
      await report.update({ accomplishments, remarks, personnel_remarks });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Failed to save report.", error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const deleted = await DailyActivityReport.destroy({ where: { report_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Report not found." });
    res.json({ message: "Report deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete report.", error: err.message });
  }
};

// ─── SIGNATURE ─────────────────────────────────────────────────────────────────
// Signature is stored per-user (not per-report/per-browser) so it can be
// retrieved from any PC once the user has saved it once.

exports.getSignature = async (req, res) => {
  try {
    const { user_id } = req.query;
    const targetUserId = await resolveDarUserId(req, user_id);

    if (!targetUserId) {
      return res.status(400).json({
        message: "Unable to resolve the user for this signature.",
      });
    }

    const user = await User.findByPk(targetUserId, { attributes: ["id", "signature"] });
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ success: true, data: { user_id: user.id, signature: user.signature || "" } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch signature.", error: err.message });
  }
};

// Always saves for the authenticated caller only — a signature identifies its
// owner, so it can't be set on behalf of another user_id even if one is passed.
exports.saveSignature = async (req, res) => {
  try {
    const { signature } = req.body;
    const targetUserId = await resolveDarUserId(req);

    if (!targetUserId) {
      return res.status(400).json({
        message: "Unable to resolve the current user for this signature.",
      });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) return res.status(404).json({ message: "User not found." });

    await user.update({ signature: signature || null });
    res.json({ success: true, data: { user_id: user.id, signature: user.signature || "" } });
  } catch (err) {
    res.status(500).json({ message: "Failed to save signature.", error: err.message });
  }
};
