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
exports.getTaskById = exports.getUserTasks = exports.deleteTask = exports.updateTaskStatus = exports.createTask = exports.getProjectTasks = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const mpm_1 = require("../utils/mpm"); // Assuming this is the file where calculateTaskRanks is defined
const prisma = new client_1.PrismaClient();
const getProjectTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const tasks = yield prisma.task.findMany({ where: { projectId: Number(projectId) } });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving tasks" });
    }
});
exports.getProjectTasks = getProjectTasks;
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
        res.status(201).json(newTask);
        yield (0, mpm_1.calculateMPM)(parseInt(projectId)); // Recalculate MPM after creating the task
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
        yield (0, mpm_1.calculateMPM)(parseInt(String(projectId))); // Recalculate MPM after deleting the task
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
