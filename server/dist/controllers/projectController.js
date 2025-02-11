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
exports.getProjectTeamMembers = exports.getProjectDependencies = exports.getProjectById = exports.deleteProject = exports.createProject = exports.getProjects = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const types_1 = require("../utils/types");
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
            where: { team: { members: { some: { userId: Number(userId) } } } },
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
    try {
        const { name, description, startDate, endDate, status = 'PLANNING', role = types_1.TeamMemberRole.OWNER // Default role for the project creator
         } = req.body;
        // Verify authentication
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded) {
            res.status(401).json({ message: "Unauthorized: User not authenticated" });
            return;
        }
        const userId = Number(decoded.userId);
        // Validate user exists
        const user = yield prisma.user.findUnique({
            where: { userId }
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create the team first
            const team = yield tx.team.create({
                data: {
                    teamName: `${name} Team`,
                }
            });
            // 2. Create the team member entry for the project creator
            yield tx.teamMember.create({
                data: {
                    userId: userId,
                    teamId: team.id,
                    role: role,
                }
            });
            // 3. Create the project with the team association
            const project = yield tx.project.create({
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
        }));
        res.status(201).json({
            message: "Project created successfully",
            data: result
        });
    }
    catch (error) {
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
// Get project team members
const getProjectTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId } = req.params;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const project = yield prisma.project.findUnique({
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
        const isMember = project.team.members.some(member => member.userId === Number(decoded.userId));
        if (!isMember) {
            return res.status(403).json({ error: 'You must be a team member to view this information' });
        }
        res.status(200).json(project.team.members);
    }
    catch (error) {
        console.error('Error fetching project team members:', error);
        res.status(500).json({ error: 'Failed to fetch project team members' });
    }
});
exports.getProjectTeamMembers = getProjectTeamMembers;
