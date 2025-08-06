"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTaskDependency = exports.addCommentToTask = exports.rescheduleTask = exports.getTaskById = exports.getUserTasks = exports.deleteTask = exports.updateTaskStatus = exports.createTask = exports.getTaskComments = exports.getProjectTasks = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const mpm_1 = require("../utils/mpm");
const scheduler_1 = require("../utils/scheduler");
const buildTaskGraph_1 = require("../utils/buildTaskGraph");
const prisma = new client_1.PrismaClient();
const getProjectTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const tasks = yield prisma.task.findMany({
            where: { projectId: Number(projectId) },
            include: {
                taskAssignments: {
                    include: {
                        user: {
                            select: {
                                userId: true,
                                username: true,
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                author: {
                    select: {
                        userId: true,
                        username: true,
                        email: true,
                        profilePictureUrl: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                dependencies: {
                    include: {
                        prerequisiteTask: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving tasks" });
    }
});
exports.getProjectTasks = getProjectTasks;
const getTaskComments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { taskId } = req.params;
    try {
        // check if task exists with project and team info
        const task = yield prisma.task.findUnique({
            where: { id: Number(taskId) },
            include: {
                project: {
                    include: {
                        team: true
                    }
                }
            }
        });
        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        // Get user ID from access token
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const userId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
        // Check if user is part of the project's team
        const teamMember = yield prisma.teamMember.findFirst({
            where: {
                userId: Number(userId),
                teamId: task.project.team.id
            }
        });
        if (!teamMember) {
            res.status(403).json({ error: "User is not a member of this project's team" });
            return;
        }
        // Fetch comments with user information
        const comments = yield prisma.comment.findMany({
            where: { taskId: Number(taskId) },
            include: {
                user: {
                    select: {
                        username: true,
                        profilePictureUrl: true
                    }
                }
            }
        });
        res.json(comments);
    }
    catch (error) {
        console.error("Error retrieving comments:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error retrieving comments", error: error });
        }
    }
});
exports.getTaskComments = getTaskComments;
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, status, priority, tags, startDate, dueDate, points, projectId, dependencies, // List of prerequisite task IDs
         } = req.body;
        // Validate required fields
        if (!title ||
            !description ||
            !status ||
            !priority ||
            !tags ||
            !startDate ||
            !dueDate ||
            !points ||
            !projectId) {
            return res.status(400).json({ error: "All fields are required." });
        }
        // Get user ID from access token
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded)
            return res.status(401).json({ error: "Unauthorized" });
        const userId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
        // Calculate duration in days
        const duration = Math.ceil((new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));
        //  Create the new task
        const newTask = yield prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                tags,
                startDate: new Date(startDate),
                dueDate: new Date(dueDate),
                points: parseInt(points),
                projectId: parseInt(projectId),
                authorUserId: parseInt(userId),
                duration: duration,
            },
        });
        // creating dependencies in the TaskDependency table
        if (dependencies && dependencies.length > 0) {
            const taskDependencies = dependencies.map((prerequisiteTaskId) => ({
                dependentTaskId: newTask.id,
                prerequisiteTaskId,
            }));
            yield prisma.taskDependency.createMany({
                data: taskDependencies,
            });
        }
        // build graph and recalculate MPM
        const { adjList, nodes } = yield (0, buildTaskGraph_1.buildTaskGraph)(parseInt(projectId));
        yield (0, mpm_1.calculateMPM)(adjList, nodes); // Recalculate MPM after creating the task
        res.status(201).json(newTask);
    }
    catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ error: "An error occurred while creating the task." });
    }
});
exports.createTask = createTask;
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
        const updatedTask = yield prisma.task.update({ where: { id: Number(taskId) }, data: { status } });
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ message: "error updating task status" });
    }
});
exports.updateTaskStatus = updateTaskStatus;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { projectId } = req.query;
    try {
        yield prisma.task.delete({ where: { id: Number(taskId) } });
        // Recalculate MPM after deleting the task
        const { adjList, nodes } = yield (0, buildTaskGraph_1.buildTaskGraph)(parseInt(String(projectId)));
        yield (0, mpm_1.calculateMPM)(adjList, nodes);
        res.status(204).send({ message: "Task deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "error deleting task", error: error.message });
    }
});
exports.deleteTask = deleteTask;
const getUserTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const userId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
        const userTaskAssignments = yield prisma.taskAssignment.findMany({
            where: { userId: Number(userId) },
            include: { task: true },
        });
        const tasks = userTaskAssignments.map((assignment) => assignment.task);
        res.status(200).json(tasks);
    }
    catch (error) {
        console.error("Error retrieving user tasks:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});
exports.getUserTasks = getUserTasks;
const getTaskById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        const task = yield prisma.task.findUnique({ where: { id: Number(taskId) } });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving task", error: error.message });
    }
});
exports.getTaskById = getTaskById;
const rescheduleTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = Number(req.params.taskId);
    const { projectId, newStartDate, newDueDate } = req.body;
    const start = new Date(newStartDate);
    const due = new Date(newDueDate);
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
    }
    try {
        yield (0, scheduler_1.rescheduleGraph)(Number(projectId), taskId, start, due);
        res.json({ message: "Task and dependents rescheduled" });
    }
    catch (err) {
        res.status(500).json({ message: "Reschedule failed", error: err.message });
    }
});
exports.rescheduleTask = rescheduleTask;
const addCommentToTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { taskId } = req.params;
    const { content } = req.body;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const userId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
        }
        const comment = yield prisma.comment.create({
            data: {
                text: content,
                taskId: Number(taskId),
                userId: Number(userId),
            },
        });
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
});
exports.addCommentToTask = addCommentToTask;
const addTaskDependency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { taskId } = req.params;
    const { source, target } = req.body;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const userId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
        }
        // check if user part of the project team
        const task = yield prisma.task.findUnique({
            where: { id: Number(taskId) },
            include: { project: { include: { team: true } } },
        });
        if (!task) {
            res.status(404).json({ error: "Task not found" });
            return;
        }
        const teamMember = yield prisma.teamMember.findFirst({
            where: {
                userId: Number(userId),
                teamId: task.project.teamId,
            },
        });
        if (!teamMember) {
            res.status(403).json({ error: "Forbidden: Only team members can add task dependencies" });
            return;
        }
        // build graph ans Recalculate MPM after adding the dependency
        const { adjList, nodes } = yield (0, buildTaskGraph_1.buildTaskGraph)(task.projectId);
        nodes.get(Number(taskId)).dependencies.push(Number(source));
        adjList.get(Number(source)).push(Number(target));
        // Recalculate MPM after adding the dependency to check if new graph contains a cycle or not 
        yield (0, mpm_1.calculateMPM)(adjList, nodes);
        // add the dependency in the database if no cycle is detected
        const dependency = yield prisma.taskDependency.create({
            data: {
                dependentTaskId: Number(target),
                prerequisiteTaskId: Number(source),
            },
        });
        res.status(201).json(dependency);
    }
    catch (error) {
        res.status(500).json({ message: "Error adding task dependency", error: error.message });
    }
});
exports.addTaskDependency = addTaskDependency;
