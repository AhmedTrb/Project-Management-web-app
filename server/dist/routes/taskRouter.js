"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const taskAssignmentController_1 = require("../controllers/taskAssignmentController");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
/**
 * @swagger
 * /tasks/{projectId}:
 *   get:
 *     summary: Get all tasks for a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get("/:projectId", taskController_1.getProjectTasks);
/**
 * @swagger
 * /tasks/{projectId}:
 *   post:
 *     summary: Create a new task in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: [token]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Unauthorized
 */
router.post("/:projectId", taskController_1.createTask);
/**
 * @swagger
 * /tasks/{taskId}/status:
 *   patch:
 *     summary: Update the status of a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task status updated
 *       401:
 *         description: Unauthorized
 */
router.patch("/:taskId/status", taskController_1.updateTaskStatus);
/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks assigned to the authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user tasks
 *       401:
 *         description: Unauthorized
 */
router.get("/", taskController_1.getUserTasks);
/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task deleted
 *       401:
 *         description: Unauthorized
 */
router.delete("/:taskId", taskController_1.deleteTask);
/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Task not found
 */
router.get("/:taskId", taskController_1.getTaskById);
/**
 * @swagger
 * /tasks/{taskId}/reschedule:
 *   post:
 *     summary: Reschedule a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newDueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task rescheduled
 *       401:
 *         description: Unauthorized
 */
router.post("/:taskId/reschedule", taskController_1.rescheduleTask);
/**
 * @swagger
 * /tasks/{taskId}/comment:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added
 *       401:
 *         description: Unauthorized
 */
router.post("/:taskId/comment", taskController_1.addCommentToTask);
/**
 * @swagger
 * /tasks/{taskId}/comments:
 *   get:
 *     summary: Get all comments for a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 *       401:
 *         description: Unauthorized
 */
router.get("/:taskId/comments", taskController_1.getTaskComments);
/**
 * @swagger
 * /tasks/assign/task:
 *   post:
 *     summary: Assign a user to a task
 *     tags: [TaskAssignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User assigned to task
 *       401:
 *         description: Unauthorized
 */
router.post('/assign/task', taskAssignmentController_1.assignUserToTask);
/**
 * @swagger
 * /tasks/{taskId}/users/{userId}:
 *   delete:
 *     summary: Remove a user from a task
 *     tags: [TaskAssignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User removed from task
 *       401:
 *         description: Unauthorized
 */
router.delete('/:taskId/users/:userId', taskAssignmentController_1.removeUserFromTask);
/**
 * @swagger
 * /tasks/{taskId}/assignees:
 *   get:
 *     summary: Get all assignees for a task
 *     tags: [TaskAssignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of assignees
 *       401:
 *         description: Unauthorized
 */
router.get('/:taskId/assignees', taskAssignmentController_1.getTaskAssignees);
/**
 * @swagger
 * /tasks/{taskId}/dependency:
 *   post:
 *     summary: Add a dependency to a task
 *     tags: [Tasks]
 */
router.post('/:taskId/dependency', taskController_1.addTaskDependency);
exports.default = router;
