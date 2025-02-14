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
exports.getTaskAssignees = exports.removeUserFromTask = exports.assignUserToTask = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const assignUserToTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, taskId } = req.body;
    try {
        // Check if task exists
        const task = yield prisma.task.findUnique({
            where: { id: Number(taskId) }
        });
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: { userId: Number(userId) }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // check if user already assigned 
        const existingAssignment = yield prisma.taskAssignment.findFirst({
            where: {
                taskId: Number(taskId),
                userId: Number(userId)
            }
        });
        if (existingAssignment) {
            return res.status(400).json({ error: 'User already assigned to task' });
        }
        // Create task assignment
        const assignment = yield prisma.taskAssignment.create({
            data: {
                userId: Number(userId),
                taskId: Number(taskId)
            },
            include: {
                user: true,
                task: true
            }
        });
        // Update the task's assignedUserId
        yield prisma.task.update({
            where: { id: Number(taskId) },
            data: { assignedUserId: Number(userId) }
        });
        res.status(201).json(assignment);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to assign task' });
    }
});
exports.assignUserToTask = assignUserToTask;
// Remove a user from a task
const removeUserFromTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, taskId } = req.params;
    try {
        // Delete the assignment
        yield prisma.taskAssignment.deleteMany({
            where: {
                userId: parseInt(userId),
                taskId: parseInt(taskId)
            }
        });
        // Remove the assignedUserId from the task
        yield prisma.task.update({
            where: { id: parseInt(taskId) },
            data: { assignedUserId: null }
        });
        res.status(200).json({ message: 'Assignment removed successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove assignment' });
    }
});
exports.removeUserFromTask = removeUserFromTask;
// Get all assignees for a task
const getTaskAssignees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        const assignments = yield prisma.taskAssignment.findMany({
            where: { taskId: parseInt(taskId) },
            include: {
                user: {
                    select: {
                        userId: true,
                        username: true,
                        email: true,
                        profilePictureUrl: true
                    }
                }
            }
        });
        res.status(200).json(assignments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch task assignees' });
    }
});
exports.getTaskAssignees = getTaskAssignees;
