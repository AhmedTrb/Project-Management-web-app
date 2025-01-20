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
        authorUserId: 1,
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

