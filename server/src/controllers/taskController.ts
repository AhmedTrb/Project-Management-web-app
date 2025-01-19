import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const getTasks = async (req: Request, res: Response): Promise<void> => {
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
      authorUserId,
      assignedUserId,
    } = req.body;

    // Validate required fields
    if (!title || !projectId || !authorUserId) {
      return res.status(400).json({ error: "Title, projectId, and authorUserId are required." });
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        points,
        projectId,
        authorUserId,
        assignedUserId,
      },
    });

    res.status(201).json({ message: "Task created successfully", task });
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
