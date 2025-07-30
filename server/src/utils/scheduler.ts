import { PrismaClient } from "@prisma/client";
import { addDays } from "../utils/date";

const prisma = new PrismaClient();
type TaskLink = { 
  id: number;
  duration: number;
  neighborIds: number[];
  neighborDates: Date[];
};

// Forward‐BFS: push all dependents of `startTaskId`
export async function pushDependents(startTaskId: number) {
  const queue: number[] = [startTaskId];
  const seen = new Set<number>();

  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);

    // load this node’s prereqs and dependents
    const node = await prisma.task.findUnique({
      where: { id },
      select: {
        duration: true,
        dependencies: {
          select: { prerequisiteTask: { select: { dueDate: true } } }
        },
        dependents: { select: { dependentTaskId: true } }
      }
    });
    if (!node) continue;

    // compute new start based on max prereq dueDate
    const maxDue = node.dependencies
                     .map(d => d.prerequisiteTask.dueDate!.getTime())
                     .reduce((a,b) => Math.max(a,b), 0);
    const newStart = new Date(maxDue);
    const newDue   = addDays(newStart, node.duration!);

    await prisma.task.update({
      where: { id },
      data: { startDate: newStart, dueDate: newDue }
    });
    
    queue.push(...node.dependents.map(d => d.dependentTaskId));
  }
}

// Backward‐BFS: pull all prerequisites of `startTaskId`
// only call this if the moved task was shifted earlier
export async function pullPrerequisites(startTaskId: number) {
  const queue: number[] = [startTaskId];
  const seen = new Set<number>();

  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);

    const node = await prisma.task.findUnique({
      where: { id },
      select: {
        duration: true,
        dependents: {
          select: { dependentTask: { select: { startDate: true } } }
        },
        dependencies: { select: { prerequisiteTaskId: true } }
      }
    });
    if (!node) continue;

    // compute new due based on min dependent startDate
    const minStart = node.dependents
                        .map(d => d.dependentTask.startDate!.getTime())
                        .reduce((a,b) => Math.min(a,b), Infinity);
    const newDue   = new Date(minStart);
    const newStart = addDays(newDue, -node.duration!);

    await prisma.task.update({
      where: { id },
      data: { startDate: newStart, dueDate: newDue }
    });
    
    queue.push(...node.dependencies.map(d => d.prerequisiteTaskId));
  }
}

// Master function: updates the moved task, then push/pull neighbors
export async function rescheduleGraph(
  projectId: number,
  taskId: number,
  newStart: Date,
  newDue: Date
) {
  // ⛳ Get the current task before updating
  const original = await prisma.task.findUnique({
    where: { id: taskId },
    select: { startDate: true }
  });

  // 1) Update the moved task
  const duration = Math.round((newDue.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24));
  const updated = await prisma.task.update({
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
  await pushDependents(taskId);

  // 3) Pull prerequisites if the task was moved earlier
  if (original?.startDate && newStart < original.startDate) {
    await pullPrerequisites(taskId);
  }
}