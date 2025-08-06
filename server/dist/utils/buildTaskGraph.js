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
exports.buildTaskGraph = buildTaskGraph;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Builds a directed acyclic graph (DAG) of tasks from a given project,
 * including their dependencies and dependents.
 *
 * @param projectId The ID of the project to build the graph for.
 *
 * @returns A TaskGraph object with three members: nodes, adjList, and reverseAdjList.
 *  - nodes is a Map of task ID to TaskNode objects, which contain the task's ID,
 *    duration, degree, earliest start and finish times, latest start and finish times,
 *    slack, whether it is on the critical path, and its dependencies and dependents.
 *  - adjList is a Map of task ID to arrays of task IDs, which represents the adjacency list
 *    of the graph, where each task ID points to its dependents.
 *  - reverseAdjList is a Map of task ID to arrays of task IDs, which represents the reverse
 *    adjacency list of the graph, where each task ID points to its dependencies.
 */
function buildTaskGraph(projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = yield prisma.task.findMany({
            where: { projectId },
            select: { id: true, duration: true }
        });
        const deps = yield prisma.taskDependency.findMany({
            where: {
                dependentTaskId: { in: tasks.map(t => t.id) },
                prerequisiteTaskId: { in: tasks.map(t => t.id) },
            },
            select: { prerequisiteTaskId: true, dependentTaskId: true }
        });
        const nodes = new Map();
        const adjList = new Map();
        const reverseAdjList = new Map();
        for (const { id, duration } of tasks) {
            nodes.set(id, {
                taskId: id,
                duration: duration !== null && duration !== void 0 ? duration : 0,
                degree: 0,
                earliestStart: 0,
                earliestFinish: 0,
                latestStart: Infinity,
                latestFinish: Infinity,
                slack: 0,
                isCriticalPath: false,
                dependencies: [],
                dependents: []
            });
            adjList.set(id, []);
            reverseAdjList.set(id, []);
        }
        for (const { prerequisiteTaskId: pre, dependentTaskId: dep } of deps) {
            nodes.get(dep).dependencies.push(pre);
            nodes.get(pre).dependents.push(dep);
            adjList.get(pre).push(dep);
            reverseAdjList.get(dep).push(pre);
        }
        return { nodes, adjList, reverseAdjList };
    });
}
