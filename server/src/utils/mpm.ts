import { TaskNode } from './types'; // Define TaskNode properly
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();




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

export const calculateMPM = async (projectId: number): Promise<void> => {
  // 1. Fetch tasks and dependencies from the database
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

  // 2. Initialize nodes and adjacency lists
  const nodes: Map<number, TaskNode> = new Map();
  const adjList = new Map<number, number[]>();           // prereq → dependents
  const reverseAdjList = new Map<number, number[]>();    // dependent → prereqs

  for (const { id, duration } of tasks) {
    nodes.set(id, {
      taskId: id,
      duration: duration ?? 0,
      degree: 0,               // longest‐path layer
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

  // 3. Populate dependencies & dependents in our node objects
  for (const { prerequisiteTaskId: pre, dependentTaskId: dep } of deps) {
    nodes.get(dep)!.dependencies.push(pre);
    nodes.get(pre)!.dependents.push(dep);
    adjList.get(pre)!.push(dep);
    reverseAdjList.get(dep)!.push(pre);
  }

  // 4. Get a topological ordering of all tasks
  const topoOrder = kahnTopologicalSort(adjList);

  // 5. Compute “degree” = longest‐path layer for each node
  //    Walk in topo order; each dependent’s degree = max(pre.degree + 1)
  for (const id of topoOrder) {
    const node = nodes.get(id)!;
    for (const depId of adjList.get(id)!) {
      const depNode = nodes.get(depId)!;
      depNode.degree = Math.max(depNode.degree, node.degree + 1);
    }
  }

  // 6. FORWARD PASS – compute ES & EF
  for (const id of topoOrder) {
    const node = nodes.get(id)!;
    node.earliestFinish = node.earliestStart + node.duration;
    for (const depId of adjList.get(id)!) {
      const depNode = nodes.get(depId)!;
      // each dependent can only start after this finishes
      depNode.earliestStart = Math.max(depNode.earliestStart, node.earliestFinish);
    }
  }

  // 7. BACKWARD PASS – compute LF & LS & Slack
  //    Project duration = max EF among all end‐nodes
  const projectDuration = Math.max(
    ...[...nodes.values()].map(n => n.earliestFinish)
  );
  // walk in reverse topo order
  for (const id of topoOrder.slice().reverse()) {
    const node = nodes.get(id)!;
    // if no dependents, it must finish at projectDuration
    if (node.dependents.length === 0) {
      node.latestFinish = projectDuration;
    } else {
      // else must finish before the earliest of dependents’ LS
      node.latestFinish = Math.min(
        ...node.dependents.map(d => nodes.get(d)!.latestStart)
      );
    }
    node.latestStart = node.latestFinish - node.duration;
    node.slack = node.latestStart - node.earliestStart;
    node.isCriticalPath = node.slack === 0;
  }

  // 8. Persist all computed fields back to the database
  await Promise.all(
    [...nodes.values()].map(n =>
      prisma.task.update({
        where: { id: n.taskId },
        data: {
          degree:          n.degree,
          earliestStart:   n.earliestStart,
          earliestFinish:  n.earliestFinish,
          latestStart:     n.latestStart,
          latestFinish:    n.latestFinish,
          slack:           n.slack,
          isCriticalPath:  n.isCriticalPath,
        }
      })
    )
  );
};

/**
 * Basic Kahn’s algorithm for topological sorting.
 *
 * @param adjList – map from node → its outgoing neighbors
 * @returns a list of node IDs in topologically sorted order
 */
function kahnTopologicalSort(adjList: Map<number, number[]>): number[] {
  const inDegree = new Map<number, number>();
  const queue: number[] = [];
  const sorted: number[] = [];

  // Initialize in‐degrees to 0
  for (const id of adjList.keys()) {
    inDegree.set(id, 0);
  }
  // Count actual in‐degrees
  for (const [u, neighbors] of adjList) {
    for (const v of neighbors) {
      inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }
  }
  // Start with nodes of in‐degree 0
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  // Pull nodes, decrement neighbors’ in‐degree
  while (queue.length > 0) {
    const u = queue.shift()!;
    sorted.push(u);
    for (const v of adjList.get(u)!) {
      inDegree.set(v, inDegree.get(v)! - 1);
      if (inDegree.get(v)! === 0) {
        queue.push(v);
      }
    }
  }

  if (sorted.length !== adjList.size) {
    throw new Error('Cycle detected in task dependencies');
  }
  return sorted;
}
