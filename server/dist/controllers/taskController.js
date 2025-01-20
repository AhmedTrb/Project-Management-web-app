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
                authorUserId: 1,
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
function calculateTaskDegrees() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch all tasks with their dependencies
            const tasks = yield prisma.task.findMany({
                include: {
                    dependencies: {
                        include: {
                            prerequisiteTask: true
                        }
                    }
                }
            });
            // Create adjacency list representation of the graph
            const graph = new Map();
            // Initialize graph with all tasks
            tasks.forEach(task => {
                const duration = calculateTaskDuration(task.startDate, task.dueDate);
                graph.set(task.id, {
                    duration,
                    dependencies: task.dependencies.map(dep => dep.prerequisiteTaskId)
                });
            });
            // Calculate degrees using dynamic programming
            const degrees = new Map();
            function calculateDegree(taskId, visited = new Set()) {
                // Check for cycles
                if (visited.has(taskId)) {
                    throw new Error('Cycle detected in task dependencies');
                }
                // Return memoized result
                if (degrees.has(taskId)) {
                    return degrees.get(taskId);
                }
                visited.add(taskId);
                const task = graph.get(taskId);
                // If no dependencies, degree is 0
                if (task.dependencies.length === 0) {
                    degrees.set(taskId, 0);
                    return 0;
                }
                // Calculate maximum path length from prerequisites
                const maxPrerequisiteDegree = Math.max(...task.dependencies.map(depId => {
                    const depDegree = calculateDegree(depId, new Set(visited));
                    const depDuration = graph.get(depId).duration;
                    return depDegree + depDuration;
                }));
                degrees.set(taskId, maxPrerequisiteDegree);
                return maxPrerequisiteDegree;
            }
            // Calculate degree for each task
            for (const taskId of graph.keys()) {
                try {
                    calculateDegree(taskId);
                }
                catch (error) {
                    console.error(`Error calculating degree for task ${taskId}:`, error);
                }
            }
        }
        catch (error) {
            console.error("Error calculating task degrees:", error);
        }
    });
}
function calculateTaskDuration(startDate, dueDate) {
    // If either date is missing, return default duration of 1 day
    if (!startDate || !dueDate) {
        return 1;
    }
    // Calculate the difference in milliseconds
    const diffTime = dueDate.getTime() - startDate.getTime();
    // Convert to days and round up to nearest whole day
    // 1000ms * 60s * 60min * 24hr = 86400000ms in a day
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Return at least 1 day, even if dates are the same or due date is before start date
    return Math.max(1, diffDays);
}
