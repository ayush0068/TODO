const express = require("express");
const { body } = require("express-validator");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Validation rules
const createValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
];

const updateValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["pending", "completed"]).withMessage("Status must be pending or completed"),
];

// Routes
router.get("/", getTasks);                              // GET    /api/tasks
router.post("/", createValidation, createTask);         // POST   /api/tasks
router.put("/:id", updateValidation, updateTask);       // PUT    /api/tasks/:id
router.delete("/:id", deleteTask);                      // DELETE /api/tasks/:id
router.patch("/:id/toggle", toggleTask);                // PATCH  /api/tasks/:id/toggle

module.exports = router;
