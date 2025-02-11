import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";
import { TeamMemberRole } from "../utils/types";

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];

    const decoded = verifyAccessToken(token as string);
    if (!decoded) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
    }
    const userId = decoded?.userId;
    try {
      const projects = await prisma.project.findMany({
        where: {team: { members: { some: { userId: Number(userId) } } }},
      });
        res.json(projects);
    } catch (error:any) {
        res.status(500).json({ message: "error retrieving projects", error: error.message });
    }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      status = 'PLANNING',
      role = TeamMemberRole.OWNER // Default role for the project creator
    } = req.body;

    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = verifyAccessToken(token as string);
    
    if (!decoded) {
      res.status(401).json({ message: "Unauthorized: User not authenticated" });
      return;
    }

    const userId = Number(decoded.userId);

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { userId }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the team first
      const team = await tx.team.create({
        data: {
          teamName: `${name} Team`,
        }
      });

      // 2. Create the team member entry for the project creator
      await tx.teamMember.create({
        data: {
          userId: userId,
          teamId: team.id,
          role: role,
        }
      });

      // 3. Create the project with the team association
      const project = await tx.project.create({
        data: {
          name,
          description,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          status,
          teamId: team.id
        },
      });

      return project;
    });

    res.status(201).json({
      message: "Project created successfully",
      data: result
    });

  } catch (error: any) {
    console.error("Error creating project:", error);
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      res.status(409).json({ 
        message: "A project with this name already exists",
        error: error.message 
      });
      return;
    }

    res.status(500).json({ 
      message: "Error creating project", 
      error: error.message 
    });
  }
};


export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
        await prisma.project.delete({ where: { id: Number(projectId) } });
        res.json({ message: "project deleted successfully" });
    } catch (error:any) {
        res.status(500).json({ message: "error deleting project", error: error.message });
    }
}

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
        const project = await prisma.project.findUnique({ where: { id: Number(projectId) } });
        res.json(project);
    } catch (error: any) {
        res.status(500).json({ message: "error retrieving project", error: error.message });
    }
}


export const getProjectDependencies = async (req: Request, res: Response): Promise<void> => {
    try {
        const {projectId} = req.params;
        const tasks = await prisma.task.findMany({where:{projectId:Number(projectId)}});

        const taskIds = tasks.map(task => task.id);
        
        const dependencies = await prisma.taskDependency.findMany({where:{dependentTaskId: {in: taskIds},prerequisiteTaskId: {in: taskIds}}});
        res.json(dependencies);
    } catch (error: any) {
        res.status(500).json({ message: "error retrieving project dependencies", error: error.message });
    }
}

// Get project team members
export const getProjectTeamMembers = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = verifyAccessToken(token as string);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(projectId) },
            include: {
                team: {
                    include: {
                        members: {
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
                        }
                    }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the requesting user is a member of the project's team
        const isMember = project.team.members.some(
            member => member.userId === Number(decoded.userId)
        );

        if (!isMember) {
            return res.status(403).json({ error: 'You must be a team member to view this information' });
        }

        res.status(200).json(project.team.members);
    } catch (error: any) {
        console.error('Error fetching project team members:', error);
        res.status(500).json({ error: 'Failed to fetch project team members' });
    }
};