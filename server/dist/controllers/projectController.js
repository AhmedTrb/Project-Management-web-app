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
exports.getProjectDependencies = exports.getProjectById = exports.deleteProject = exports.createProject = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
    }
    const userId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
    try {
        const projects = yield prisma.project.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving projects", error: error.message });
    }
});
exports.getProjects = getProjects;
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, description, startDate, endDate, status } = req.body;
    // Assume the authenticated user's id is available as req.user.userId
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    // check if the user is authenticated
    if (!decoded) {
        res.status(401).json({ message: "Unauthorized: User not authenticated" });
        return;
    }
    const authorUserId = decoded === null || decoded === void 0 ? void 0 : decoded.userId;
    try {
        // Wrap the creation process in a transaction so that the project, team,
        // and project-team association are created atomically.
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Create the project
            const newProject = yield tx.project.create({
                data: { name, description, startDate, endDate, status },
            });
            // Create the team for the project, using the project name as the team name
            // and setting the author as the product owner.
            const newTeam = yield tx.team.create({
                data: {
                    teamName: name,
                    productOwnerUserId: Number(authorUserId),
                    // You might want to set other fields as needed.
                },
            });
            // Associate the newly created team with the project
            const newProjectTeam = yield tx.projectTeam.create({
                data: {
                    projectId: newProject.id,
                    teamId: newTeam.id,
                },
            });
            // Return the combined result (or any subset you want to send back)
            return { project: newProject, team: newTeam, projectTeam: newProjectTeam };
        }));
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ message: "Error creating project", error: error.message });
    }
});
exports.createProject = createProject;
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        yield prisma.project.delete({ where: { id: Number(projectId) } });
        res.json({ message: "project deleted successfully" });
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
const getProjectDependencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const tasks = yield prisma.task.findMany({ where: { projectId: Number(projectId) } });
        const taskIds = tasks.map(task => task.id);
        const dependencies = yield prisma.taskDependency.findMany({ where: { dependentTaskId: { in: taskIds }, prerequisiteTaskId: { in: taskIds } } });
        res.json(dependencies);
    }
    catch (error) {
        res.status(500).json({ message: "error retrieving project dependencies", error: error.message });
    }
});
exports.getProjectDependencies = getProjectDependencies;
