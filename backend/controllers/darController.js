const { Op } = require("sequelize");
const TaskCategory = require("../models/TaskCategory");
const Task = require("../models/Task");
const AccomplishedLog = require("../models/AccomplishedLog");
const DailyActivityReport = require("../models/DailyActivityReport");

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
    const targetUserId = user_id || req.user?.id;
    const where = {};
    if (targetUserId) where.user_id = targetUserId;
    if (status)  where.status = status;
    if (date)    where.task_date = date;
    if (week_start && week_end)
      where.task_date = { [Op.between]: [week_start, week_end] };

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
    const taskData = { ...req.body };
    if (!taskData.user_id && req.user?.id) {
      taskData.user_id = req.user.id;
    }
    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task.", error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const [updated] = await Task.update(req.body, { where: { task_id: req.params.id } });
    if (!updated) return res.status(404).json({ message: "Task not found." });
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: TaskCategory, as: "category" }],
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task.", error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.destroy({ where: { task_id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task.", error: err.message });
  }
};

// ─── ACCOMPLISHED LOGS ─────────────────────────────────────────────────────────

exports.getLogs = async (req, res) => {
  try {
    const { user_id, week_start, week_end } = req.query;
    const targetUserId = user_id || req.user?.id;
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
    const targetUserId = user_id || req.user?.id;
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
    const targetUserId = user_id || req.user?.id;
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
