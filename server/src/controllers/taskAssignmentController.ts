import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const assignUserToTask = async (req: Request, res: Response) =>{
    const { userId, taskId } = req.body;

    try {
      // Check if task exists
      const task = await prisma.task.findUnique({
        where: { id: Number(taskId) }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { userId: Number(userId) }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // check if user already assigned 
      const existingAssignment = await prisma.taskAssignment.findFirst({
        where: {
          taskId: Number(taskId),
          userId: Number(userId)
        }
      });
      if (existingAssignment) {
        return res.status(400).json({ error: 'User already assigned to task' });
      }
      // Create task assignment
      const assignment = await prisma.taskAssignment.create({
        data: {
          userId: Number(userId),
          taskId: Number(taskId)
        },
        include: {
          user: true,
          task: true
        }
      });

      // Update the task's assignedUserId
      await prisma.task.update({
        where: { id: Number(taskId) },
        data: { assignedUserId: Number(userId) }
      });

      res.status(201).json(assignment);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to assign task' });
    }
  }

  // Remove a user from a task
  export const removeUserFromTask = async(req: Request, res: Response) =>{
    const { userId, taskId } = req.params;

    try {
      // Delete the assignment
      await prisma.taskAssignment.deleteMany({
        where: {
          userId: parseInt(userId),
          taskId: parseInt(taskId)
        }
      });

      // Remove the assignedUserId from the task
      await prisma.task.update({
        where: { id: parseInt(taskId) },
        data: { assignedUserId: null }
      });

      res.status(200).json({ message: 'Assignment removed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove assignment' });
    }
  }

  // Get all assignees for a task
export const getTaskAssignees = async(req: Request, res: Response) =>{
    const { taskId } = req.params;

    try {
      const assignments = await prisma.taskAssignment.findMany({
        where: { taskId: parseInt(taskId) },
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              email: true,
              profilePictureUrl: true
            }
          }
        }
      });

      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task assignees' });
    }
  }
