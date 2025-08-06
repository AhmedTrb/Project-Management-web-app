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
exports.pushDependents = pushDependents;
exports.pullPrerequisites = pullPrerequisites;
exports.rescheduleGraph = rescheduleGraph;
const client_1 = require("@prisma/client");
const date_1 = require("../utils/date");
const prisma = new client_1.PrismaClient();
// Forward‐BFS: push all dependents of `startTaskId`
function pushDependents(startTaskId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Start with its direct dependents, not itself
        const task = yield prisma.task.findUnique({
            where: { id: startTaskId },
            select: { dependents: { select: { dependentTaskId: true } } }
        });
        if (!task || task.dependents.length === 0) {
            return;
        }
        const queue = task.dependents.map(d => d.dependentTaskId);
        const seen = new Set();
        while (queue.length) {
            const id = queue.shift();
            if (seen.has(id))
                continue;
            seen.add(id);
            // load this node’s prereqs and dependents
            const node = yield prisma.task.findUnique({
                where: { id },
                select: {
                    duration: true,
                    dependencies: {
                        select: { prerequisiteTask: { select: { dueDate: true } } }
                    },
                    dependents: { select: { dependentTaskId: true } }
                }
            });
            if (!node)
                continue;
            // compute new start based on max prereq dueDate
            const maxDue = node.dependencies
                .map(d => d.prerequisiteTask.dueDate.getTime())
                .reduce((a, b) => Math.max(a, b), 0);
            const newStart = new Date(maxDue);
            const newDue = (0, date_1.addDays)(newStart, node.duration);
            yield prisma.task.update({
                where: { id },
                data: { startDate: newStart, dueDate: newDue }
            });
            queue.push(...node.dependents.map(d => d.dependentTaskId));
        }
    });
}
function pullPrerequisites(startTaskId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Start with its direct prerequisites, not itself
        const startDeps = yield prisma.task.findUnique({
            where: { id: startTaskId },
            select: { dependencies: { select: { prerequisiteTaskId: true } } }
        });
        if (!startDeps || startDeps.dependencies.length === 0) {
            return;
        }
        const queue = startDeps === null || startDeps === void 0 ? void 0 : startDeps.dependencies.map(d => d.prerequisiteTaskId);
        const seen = new Set();
        while (queue.length) {
            const id = queue.shift();
            if (seen.has(id))
                continue;
            seen.add(id);
            const node = yield prisma.task.findUnique({
                where: { id },
                select: {
                    duration: true,
                    dependents: {
                        select: { dependentTask: { select: { startDate: true } } }
                    },
                    dependencies: { select: { prerequisiteTaskId: true } }
                }
            });
            if (!node)
                continue;
            // compute new due based on min dependent startDate
            const minStart = node.dependents
                .map(d => d.dependentTask.startDate.getTime())
                .reduce((a, b) => Math.min(a, b), Infinity);
            const newDue = new Date(minStart);
            const newStart = (0, date_1.addDays)(newDue, -node.duration);
            yield prisma.task.update({
                where: { id },
                data: { startDate: newStart, dueDate: newDue }
            });
            queue.push(...node.dependencies.map(d => d.prerequisiteTaskId));
        }
    });
}
// Master function: updates the moved task, then push/pull neighbors
function rescheduleGraph(projectId, taskId, newStart, newDue) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the current task before updating
        const original = yield prisma.task.findUnique({
            where: { id: taskId },
            select: { startDate: true }
        });
        // 1) Update the moved task
        const duration = Math.round((newDue.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24));
        const updated = yield prisma.task.update({
            where: { id: taskId },
            data: {
                startDate: newStart,
                dueDate: newDue,
                duration,
            },
            include: {
                dependencies: { select: { prerequisiteTaskId: true } },
                dependents: { select: { dependentTaskId: true } },
            },
        });
        // 2) Push dependents forward
        yield pushDependents(taskId);
        // 3) Pull prerequisites if the task was moved earlier
        if ((original === null || original === void 0 ? void 0 : original.startDate) && newStart < original.startDate) {
            yield pullPrerequisites(taskId);
        }
    });
}
