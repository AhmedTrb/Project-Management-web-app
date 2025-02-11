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
        yield calculateTaskRanks(projectId);
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
    try {
        yield prisma.task.delete({ where: { id: Number(taskId) } });
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
// Example of how task dependencies work:
// If Task A is a prerequisite for Task B:
// - Task B depends on Task A
// - Task A must be completed before Task B can start
// - In the TaskDependency table:
//   prerequisiteTaskId = Task A's ID
//   dependentTaskId = Task B's ID
//
// Example:
// Task A (id: 1) - "Set up database"
// Task B (id: 2) - "Build API endpoints"
//
// To make Task B depend on Task A:
// {
//   prerequisiteTaskId: 1, // Task A must be done first
//   dependentTaskId: 2     // Before Task B can start
// }
//
// The arrows in the dependency graph point FROM prerequisites TO dependents
// Task A --> Task B means Task A is prerequisite for Task B
const calculateTaskRanks = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield prisma.task.findMany({ where: { projectId } });
    const taskIds = tasks.map(task => task.id);
    const taskDependencies = yield prisma.taskDependency.findMany({
        where: {
            dependentTaskId: { in: taskIds },
            prerequisiteTaskId: { in: taskIds }
        }
    });
    // Initialize task nodes
    const TaskNodes = new Map(tasks.map(task => [task.id, {
            taskId: task.id,
            visited: false,
            dependencies: [],
            rank: 0,
            duration: task.duration,
        }]));
    // Build adjacency list and update dependencies
    const adjList = new Map();
    taskIds.forEach(id => adjList.set(id, []));
    // Add dependencies and build adjacency list
    taskDependencies.forEach(dep => {
        var _a;
        const node = TaskNodes.get(dep.dependentTaskId);
        if (node) {
            node.dependencies.push(dep.prerequisiteTaskId);
        }
        // Add to adjacency list (prerequisite -> dependent)
        (_a = adjList.get(dep.prerequisiteTaskId)) === null || _a === void 0 ? void 0 : _a.push(dep.dependentTaskId);
    });
    // Calculate ranks using topological sort
    const ranks = topologicalSort(adjList, TaskNodes);
    // Update tasks in database with new ranks
    yield Promise.all(Array.from(TaskNodes.entries()).map(([taskId, node]) => prisma.task.update({
        where: { id: taskId },
        data: { degree: node.rank }
    })));
});
function topologicalSort(adjList, taskNodes) {
    const inDegree = new Map();
    const queue = [];
    // Initialize in-degree for all nodes
    for (const [taskId] of taskNodes) {
        inDegree.set(taskId, 0);
    }
    // Calculate in-degree for each node
    for (const [taskId, dependents] of adjList) {
        for (const dependent of dependents) {
            inDegree.set(dependent, (inDegree.get(dependent) || 0) + 1);
        }
    }
    // Add nodes with no dependencies (in-degree = 0) to queue
    for (const [taskId, degree] of inDegree) {
        if (degree === 0) {
            queue.push(taskId);
            const node = taskNodes.get(taskId);
            if (node)
                node.rank = 0; // Starting rank
        }
    }
    // Process queue
    while (queue.length > 0) {
        const currentId = queue.shift();
        const dependents = adjList.get(currentId) || [];
        for (const dependentId of dependents) {
            // Decrease in-degree of dependent
            const newDegree = (inDegree.get(dependentId) || 0) - 1;
            inDegree.set(dependentId, newDegree);
            // Update rank of dependent
            const currentNode = taskNodes.get(currentId);
            const dependentNode = taskNodes.get(dependentId);
            if (currentNode && dependentNode) {
                dependentNode.rank = Math.max(dependentNode.rank, currentNode.rank + 1);
            }
            // If all dependencies are processed, add to queue
            if (newDegree === 0) {
                queue.push(dependentId);
            }
        }
    }
    // Check for cycles
    const hasAllNodesProcessed = Array.from(inDegree.values()).every(degree => degree === 0);
    if (!hasAllNodesProcessed) {
        throw new Error('Cycle detected in task dependencies');
    }
}
