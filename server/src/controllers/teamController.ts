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
              // Include projects associated with the team
              projectTeams: {
                include: {
                  project: {
                    select: {
                      id: true,
                      name: true,
                      status: true,
                    },
                  },
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

// Add a member to a team
export const addTeamMember = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { userId } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { userId: parseInt(userId) },
            data: {
                teamId: parseInt(teamId)
            }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
};

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

// Update team details
export const updateTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { teamName, productOwnerUserId, projectManagerUserId } = req.body;

    try {
        const updatedTeam = await prisma.team.update({
            where: { id: parseInt(teamId) },
            data: {
                teamName,
                productOwnerUserId,
                projectManagerUserId
            },
            include: {
                user: true
            }
        });

        res.status(200).json(updatedTeam);
    } catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
};
