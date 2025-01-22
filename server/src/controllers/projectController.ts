import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  
    try {
        const projects = await prisma.project.findMany();
        res.json(projects);
    } catch (error:any) {
        res.status(500).json({ message: "error retrieving projects", error: error.message });
    }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
    const { name, description, startDate, endDate, status } = req.body;
    try {
        const newProject = await prisma.project.create({ data: { name, description, startDate, endDate, status } });
        res.json(newProject);
    } catch (error:any) {
        res.status(500).json({ message: "error creating project", error: error.message });
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
