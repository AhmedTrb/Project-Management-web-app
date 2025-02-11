"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const taskAssignmentController_1 = require("../controllers/taskAssignmentController");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/:projectId", taskController_1.getProjectTasks);
router.post("/:projectId", taskController_1.createTask);
router.patch("/:taskId/status", taskController_1.updateTaskStatus);
router.get("/", taskController_1.getUserTasks);
router.delete("/:taskId", taskController_1.deleteTask);
router.get("/:taskId", taskController_1.getTaskById);
// task assignments
router.post('/assign/task', taskAssignmentController_1.assignUserToTask);
router.delete('/:taskId/users/:userId', taskAssignmentController_1.removeUserFromTask);
router.get('/:taskId/assignees', taskAssignmentController_1.getTaskAssignees);
exports.default = router;
