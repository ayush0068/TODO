const { validationResult } = require("express-validator");
const Task = require("../models/Task");

const getTasks = async (req, res, next) => {
  try {
    const { search = "", status = "", page = 1, limit = 500 } = req.query;
    const query = { userId: req.user._id };
    if (status === "pending" || status === "completed") query.status = status;
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;
    const [total, tasks] = await Promise.all([
      Task.countDocuments(query),
      Task.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);
    res.status(200).json({ success: true, tasks, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) { next(error); }
};

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const { title, description, dueDate } = req.body;
    const task = await Task.create({
      title,
      description: description || "",
      status: "pending",
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: req.user._id,
    });
    res.status(201).json({ success: true, task });
  } catch (error) { next(error); }
};

const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found." });
    const { title, description, status, dueDate } = req.body;
    if (title       !== undefined) task.title       = title;
    if (description !== undefined) task.description = description;
    if (dueDate     !== undefined) task.dueDate     = dueDate ? new Date(dueDate) : null;
    if (status      !== undefined) {
      // track when completed
      if (status === "completed" && task.status !== "completed") task.completedAt = new Date();
      if (status === "pending")   task.completedAt = null;
      task.status = status;
    }
    await task.save();
    res.status(200).json({ success: true, task });
  } catch (error) { next(error); }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.status(200).json({ success: true, message: "Task deleted." });
  } catch (error) { next(error); }
};

const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found." });
    const nowDone = task.status !== "completed";
    task.status      = nowDone ? "completed" : "pending";
    task.completedAt = nowDone ? new Date() : null;
    await task.save();
    res.status(200).json({ success: true, task });
  } catch (error) { next(error); }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, toggleTask };