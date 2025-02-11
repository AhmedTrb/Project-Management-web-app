import { Request, Response } from "express";
import { PrismaClient} from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";

const prisma = new PrismaClient();


export const getProjectTasks = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
        const tasks = await prisma.task.findMany({ where: { projectId: Number(projectId) } });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: "error retrieving tasks" });
    }
};


export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      points,
      projectId,
      dependencies, // List of prerequisite task IDs
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !status ||
      !priority ||
      !tags ||
      !startDate ||
      !dueDate ||
      !points ||
      !projectId 
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Get user ID from access token
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = verifyAccessToken(token as string);

    if (!decoded) return res.status(401).json({ error: "Unauthorized" });

    const userId = decoded?.userId;

    // Calculate duration in days
    const duration = Math.ceil((new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24));

    //  Create the new task
    const newTask = await prisma.task.create({
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
      const taskDependencies = dependencies.map((prerequisiteTaskId: number) => ({
        dependentTaskId: newTask.id, 
        prerequisiteTaskId,
      }));

      await prisma.taskDependency.createMany({
        data: taskDependencies,
      });
    }

    res.status(201).json( newTask );
    await calculateTaskRanks(projectId);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "An error occurred while creating the task." });
  }
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
  const { status } = req.body;
    try {
        const updatedTask = await prisma.task.update({ where: { id: Number(taskId) }, data: { status } });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "error updating task status" });
    }
};

export const deleteTask = async (req:Request, res:Response): Promise<void> => {
    const { taskId } = req.params;
    try {
        await prisma.task.delete({ where: { id: Number(taskId) } });
        res.status(204).send({message:"Task deleted successfully"});
    } catch (error:any) {
        res.status(500).json({ message: "error deleting task", error: error.message });
    }
};

export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
  try {
      const token = req.headers.authorization?.split(" ")[1];
      const decoded = verifyAccessToken(token as string);
      const userId = decoded?.userId;

      const userTaskAssignments = await prisma.taskAssignment.findMany({
        where: { userId: Number(userId) },
        include: { task: true },
      });

      const tasks = userTaskAssignments.map((assignment) => assignment.task);
      res.status(200).json(tasks);
  } catch (error: any) {
      console.error("Error retrieving user tasks:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    try {
        const task = await prisma.task.findUnique({ where: { id: Number(taskId) } });
        res.json(task);
    } catch (error:any) {
        res.status(500).json({ message: "error retrieving task", error: error.message });
    }
};



interface TaskNode {
  taskId: number;
  visited: boolean;
  dependencies: number[];
  rank: number;
  duration: number | null;
}


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


const calculateTaskRanks = async (projectId: number): Promise<void> => {
  const tasks = await prisma.task.findMany({ where: { projectId } });
  const taskIds = tasks.map(task => task.id);
  
  const taskDependencies = await prisma.taskDependency.findMany({ 
      where: { 
          dependentTaskId: { in: taskIds }, 
          prerequisiteTaskId: { in: taskIds } 
      } 
  });
  
  // Initialize task nodes
  const TaskNodes: Map<number, TaskNode> = new Map(tasks.map(task => [task.id, {
      taskId: task.id,
      visited: false,
      dependencies: [],
      rank: 0,
      duration: task.duration,
  }]));
  
  // Build adjacency list and update dependencies
  const adjList: Map<number, number[]> = new Map();
  taskIds.forEach(id => adjList.set(id, []));
  
  // Add dependencies and build adjacency list
  taskDependencies.forEach(dep => {
      const node = TaskNodes.get(dep.dependentTaskId);
      if (node) {
          node.dependencies.push(dep.prerequisiteTaskId);
      }
      // Add to adjacency list (prerequisite -> dependent)
      adjList.get(dep.prerequisiteTaskId)?.push(dep.dependentTaskId);
  });

  // Calculate ranks using topological sort
  const ranks = topologicalSort(adjList, TaskNodes);
  
  // Update tasks in database with new ranks
  await Promise.all(
      Array.from(TaskNodes.entries()).map(([taskId, node]) =>
          prisma.task.update({
              where: { id: taskId },
              data: { degree: node.rank }
          })
      )
  );
};

function topologicalSort(adjList: Map<number, number[]>, taskNodes: Map<number, TaskNode>): void {
  const inDegree: Map<number, number> = new Map();
  const queue: number[] = [];
  
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
          if (node) node.rank = 0;  // Starting rank
      }
  }
  
  // Process queue
  while (queue.length > 0) {
      const currentId = queue.shift()!;
      const dependents = adjList.get(currentId) || [];
      
      for (const dependentId of dependents) {
          // Decrease in-degree of dependent
          const newDegree = (inDegree.get(dependentId) || 0) - 1;
          inDegree.set(dependentId, newDegree);
          
          // Update rank of dependent
          const currentNode = taskNodes.get(currentId);
          const dependentNode = taskNodes.get(dependentId);
          if (currentNode && dependentNode) {
              dependentNode.rank = Math.max(
                  dependentNode.rank,
                  currentNode.rank + 1
              );
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