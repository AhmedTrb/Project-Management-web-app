import { Request, Response } from "express";
import { PrismaClient} from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import {calculateMPM} from "../utils/mpm"; 
import { rescheduleGraph } from "../utils/scheduler";

const prisma = new PrismaClient();


export const getProjectTasks = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
        const tasks = await prisma.task.findMany({ 
            where: { projectId: Number(projectId) },
            include: { 
                taskAssignments: {
                    include: {
                        user: { 
                            select: { 
                                userId: true, 
                                username: true, 
                                profilePictureUrl: true 
                            } 
                        }
                    }
                },
                author: { 
                    select: { 
                        userId: true, 
                        username: true, 
                        email: true, 
                        profilePictureUrl: true 
                    } 
                },
            }
        });
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
    await calculateMPM(parseInt(projectId)); // Recalculate MPM after creating the task
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
    const { projectId } = req.query;
    try {
        await prisma.task.delete({ where: { id: Number(taskId) } });
        await calculateMPM(parseInt(String(projectId))); // Recalculate MPM after deleting the task
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

export const rescheduleTask = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  const {projectId ,newStartDate, newDueDate } = req.body as {
    projectId: string,
    newStartDate: string;
    newDueDate:   string;
  };
  const start = new Date(newStartDate);
  const due = new Date(newDueDate);

  if (isNaN(start.getTime()) || isNaN(due.getTime())) {
    return res.status(400).json({ error: "Invalid date format" });
  }
  try {
    await rescheduleGraph(
      Number(projectId),
      taskId,
      start,
      due
    );
    res.json({message: "Task and dependents rescheduled" });
  } catch (err: any) {
    res.status(500).json({ message: "Reschedule failed", error: err.message });
  }
};



