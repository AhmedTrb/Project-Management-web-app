import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  
    try {
        const projects = await prisma.project.findMany();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: "error retrieving projects" });
    }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
    const { name, description, startDate, endDate, status } = req.body;
    try {
        const newProject = await prisma.project.create({ data: { name, description, startDate, endDate, status } });
        res.json(newProject);
    } catch (error) {
        res.status(500).json({ message: "error creating project", error: error });
    }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await prisma.project.delete({ where: { id: Number(id) } });
        await prisma.task.deleteMany({ where: { projectId: Number(id) } });
        await prisma.projectTeam.deleteMany({ where: { projectId: Number(id) } });
        res.json({ message: "project deleted" });
    } catch (error) {
        res.status(500).json({ message: "error deleting project", error: error });
    }
}

