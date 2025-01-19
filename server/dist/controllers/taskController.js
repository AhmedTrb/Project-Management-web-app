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
exports.updateTaskStatus = exports.createTask = exports.getTasks = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const tasks = yield prisma.task.findMany({ where: { projectId: Number(projectId) } });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving tasks" });
    }
});
exports.getTasks = getTasks;
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, status, priority, tags, startDate, dueDate, points, projectId, authorUserId, assignedUserId, } = req.body;
        // Validate required fields
        if (!title || !projectId || !authorUserId) {
            return res.status(400).json({ error: "Title, projectId, and authorUserId are required." });
        }
        // Create the task
        const task = yield prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                tags,
                startDate: startDate ? new Date(startDate) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                points,
                projectId,
                authorUserId,
                assignedUserId,
            },
        });
        res.status(201).json({ message: "Task created successfully", task });
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
