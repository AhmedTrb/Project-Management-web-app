import {Request, Response } from 'express';

import { PrismaClient} from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
const prisma = new PrismaClient();

// Get all teams with their members
export const getAllTeams = async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = verifyAccessToken(token as string);
    
    if (!decoded) return res.status(401).json({ error: 'Unauthorized' });
    const userId: number = decoded.userId;
    
    try {
        const teams = await prisma.team.findMany({
            where: {
              OR: [
                {
                  // User is a member of the team
                  user: {
                    some: { userId: Number(userId) },
                  },
                },
                {
                  // User is the Product Owner of the team
                  productOwnerUserId: Number(userId),
                },
                {
                  // User is the Project Manager of the team
                  projectManagerUserId: Number(userId),
                },
              ],
            },
            include: {
              // Include team members with selected fields
              user: {
                select: {
                  userId: true,
                  username: true,
                  email: true,
                  profilePictureUrl: true,
                },
              },
            },
          });

        res.status(200).json(teams);
    } catch (error:any) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams'});
    }
};
// add a member to a team
export const addTeamMember = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyAccessToken(token as string);

  if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

  const invitedByUserId: number = decoded.userId;
  const { projectId, userId } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { userId: Number(userId) },
      data: {
        teamId: Number(projectId),
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
}

// Remove a member from a team
export const removeTeamMember = async (req: Request, res: Response) => {
    const { teamId, userId } = req.params;

    try {
        const updatedUser = await prisma.user.update({
            where: { 
                userId: parseInt(userId),
                teamId: parseInt(teamId) // Ensure user is in this team
            },
            data: {
                teamId: null
            }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ error: 'Failed to remove team member' });
    }
};

interface TaskAssignmentRequest {
  taskId: number;
  userIds: number[];
}

export const assignUsersToTask = async (req: Request, res: Response) => {
  const { taskId, userIds }: TaskAssignmentRequest = req.body;

  try {
    // Validate input
    if (!taskId || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data. Task ID and array of user IDs are required.'
      });
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            projectTeams: {
              include: {
                team: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get all valid team members for this project
    const validTeamMembers = task.project.projectTeams.flatMap(pt => 
      pt.team.user.map(user => user.userId)
    );

    // Validate that all userIds belong to the project's teams
    const invalidUsers = userIds.filter(userId => !validTeamMembers.includes(userId));
    if (invalidUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some users are not members of the project teams',
        invalidUsers
      });
    }

    // Use transaction to ensure all operations succeed or none do
    const result = await prisma.$transaction(async (tx) => {
      // Remove existing assignments
      await tx.taskAssignment.deleteMany({
        where: { taskId }
      });

      // Create new assignments
      const assignments = await Promise.all(
        userIds.map(userId =>
          tx.taskAssignment.create({
            data: {
              taskId,
              userId
            }
          })
        )
      );

      // Update the main assignee in the Task table (using the first user if available)
      if (userIds.length > 0) {
        await tx.task.update({
          where: { id: taskId },
          data: { assignedUserId: userIds[0] }
        });
      } else {
        await tx.task.update({
          where: { id: taskId },
          data: { assignedUserId: null }
        });
      }

      return assignments;
    });

    // Send success response
    return res.status(200).json({
      success: true,
      message: 'Users assigned to task successfully',
      assignments: result
    });

  } catch (error: any) {
    console.error('Error in assignUsersToTask:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign users to task',
      error: error.message
    });
  }
};


// get project team members
export const getProjectTeamMembers = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const teamMembers = await prisma.user.findMany({
      where: {
        team: { // Find users who are in a team
          projectTeams: { // That is associated with the project
            some: {
              projectId: Number(projectId),
            },
          },
        },
      },
    });

    res.status(200).json(teamMembers);
  } catch (error) {
    console.error('Error fetching project team members:', error);
    res.status(500).json({ error: 'Failed to fetch project team members' });
  }
};
