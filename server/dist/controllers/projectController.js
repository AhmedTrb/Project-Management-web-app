"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectById = exports.deleteProject = exports.createProject = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projects = yield prisma.project.findMany();
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving projects", error: error.message });
    }
});
exports.getProjects = getProjects;
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, startDate, endDate, status } = req.body;
    try {
        const newProject = yield prisma.project.create({ data: { name, description, startDate, endDate, status } });
        res.json(newProject);
    }
    catch (error) {
        res.status(500).json({ message: "error creating project", error: error.message });
    }
});
exports.createProject = createProject;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.project.delete({ where: { id: Number(id) } });
        yield prisma.task.deleteMany({ where: { projectId: Number(id) } });
        yield prisma.projectTeam.deleteMany({ where: { projectId: Number(id) } });
        res.json({ message: "project deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "error deleting project", error: error.message });
    }
});
exports.deleteProject = deleteProject;
const getProjectById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const project = yield prisma.project.findUnique({ where: { id: Number(projectId) } });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving project", error: error.message });
    }
});
exports.getProjectById = getProjectById;
