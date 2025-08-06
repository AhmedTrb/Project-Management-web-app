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
exports.calculateMPM = void 0;
const client_1 = require("@prisma/client");
const kahnTopologicalSort_1 = require("./kahnTopologicalSort");
const prisma = new client_1.PrismaClient();
/**
 * Calculates the minimum project management (MPM) metrics for a given project.
 *
 * This function constructs a task graph for the specified project, performs
 * a topological sort, and computes key scheduling metrics for each task:
 * - Degree
 * - Earliest Start (ES) / Earliest Finish (EF)
 * - Latest Start (LS) / Latest Finish (LF)
 * - Slack
 * - Critical Path Status
 *
 * These metrics are subsequently saved to the database.
 *
 * @param projectId The ID of the project for which the MPM metrics are calculated.
 * @returns A Promise that resolves when the metrics have been successfully persisted.
 */
const calculateMPM = (adjList, nodes) => __awaiter(void 0, void 0, void 0, function* () {
    // const { nodes, adjList } = await buildTaskGraph(projectId);
    const topoOrder = (0, kahnTopologicalSort_1.kahnTopologicalSort)(adjList);
    // Step 1: Compute degree
    for (const id of topoOrder) {
        const node = nodes.get(id);
        for (const depId of adjList.get(id)) {
            const depNode = nodes.get(depId);
            depNode.degree = Math.max(depNode.degree, node.degree + 1);
        }
    }
    // Step 2: Forward pass – ES/EF
    for (const id of topoOrder) {
        const node = nodes.get(id);
        node.earliestFinish = node.earliestStart + node.duration;
        for (const depId of adjList.get(id)) {
            const depNode = nodes.get(depId);
            depNode.earliestStart = Math.max(depNode.earliestStart, node.earliestFinish);
        }
    }
    // Step 3: Backward pass – LF/LS
    const projectDuration = Math.max(...[...nodes.values()].map(n => n.earliestFinish));
    for (const id of topoOrder.slice().reverse()) {
        const node = nodes.get(id);
        node.latestFinish = node.dependents.length === 0
            ? projectDuration
            : Math.min(...node.dependents.map(d => nodes.get(d).latestStart));
        node.latestStart = node.latestFinish - node.duration;
        node.slack = node.latestStart - node.earliestStart;
        node.isCriticalPath = node.slack === 0;
    }
    // Step 4: Persist updates
    yield Promise.all([...nodes.values()].map((n) => prisma.task.update({
        where: { id: n.taskId },
        data: {
            degree: n.degree,
            earliestStart: n.earliestStart,
            earliestFinish: n.earliestFinish,
            latestStart: n.latestStart,
            latestFinish: n.latestFinish,
            slack: n.slack,
            isCriticalPath: n.isCriticalPath
        }
    })));
});
exports.calculateMPM = calculateMPM;
