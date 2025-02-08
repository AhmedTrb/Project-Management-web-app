import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAccessToken } from "../utils/jwt";

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
        where: {
          OR: [
            {
              projectTeams: {
                some: {
                  team: {
                    productOwnerUserId: Number(userId),
                    user: {
                      some: {
                        userId: Number(userId),
                      },
                    },
                  },
                },
              },
            },
            {
              projectTeams: {
                some: {
                  team: {
                    projectManagerUserId: Number(userId),
                  },
                },
              },
            },
            {
              projectTeams: {
                some: {
                  team: {
                    productOwnerUserId: Number(userId),
                  },
                },
              },
            },
            {
              tasks: {
                some: {
                  authorUserId: Number(userId),
                },
              },
            },
          ],
        },
      });
        res.json(projects);
    } catch (error:any) {
        res.status(500).json({ message: "error retrieving projects", error: error.message });
    }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { name, description, startDate, endDate, status } = req.body;
  // Assume the authenticated user's id is available as req.user.userId
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyAccessToken(token as string);
    
    // check if the user is authenticated
  if (!decoded) {
    res.status(401).json({ message: "Unauthorized: User not authenticated" });
    return;
  }

  const authorUserId = decoded?.userId;
  try {
    // Wrap the creation process in a transaction so that the project, team,
    // and project-team association are created atomically.
    const result = await prisma.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: { name, description, startDate, endDate, status },
      });
      
      // Create the team for the project, using the project name as the team name
      // and setting the author as the product owner.
      const newTeam = await tx.team.create({
        data: {
          teamName: name,
          productOwnerUserId: Number(authorUserId),
          // You might want to set other fields as needed.
        },
      });
      
      // Associate the newly created team with the project
      const newProjectTeam = await tx.projectTeam.create({
        data: {
          projectId: newProject.id,
          teamId: newTeam.id,
        },
      });
      
      // Return the combined result (or any subset you want to send back)
      return { project: newProject, team: newTeam, projectTeam: newProjectTeam };
    });
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project", error: error.message });
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
