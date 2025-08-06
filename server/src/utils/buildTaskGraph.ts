import { PrismaClient } from '@prisma/client';
import { TaskNode, TaskGraph } from './types';

const prisma = new PrismaClient();

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
export async function buildTaskGraph(projectId: number): Promise<TaskGraph> {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    select: { id: true, duration: true }
  });

  const deps = await prisma.taskDependency.findMany({
    where: {
      dependentTaskId: { in: tasks.map(t => t.id) },
      prerequisiteTaskId: { in: tasks.map(t => t.id) },
    },
    select: { prerequisiteTaskId: true, dependentTaskId: true }
  });

  const nodes = new Map<number, TaskNode>();
  const adjList = new Map<number, number[]>();
  const reverseAdjList = new Map<number, number[]>();

  for (const { id, duration } of tasks) {
    nodes.set(id, {
      taskId: id,
      duration: duration ?? 0,
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
    nodes.get(dep)!.dependencies.push(pre);
    nodes.get(pre)!.dependents.push(dep);
    adjList.get(pre)!.push(dep);
    reverseAdjList.get(dep)!.push(pre);
  }

  return { nodes, adjList, reverseAdjList };
}
