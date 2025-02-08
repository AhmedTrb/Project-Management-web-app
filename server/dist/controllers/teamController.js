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
exports.getProjectTeamMembers = exports.assignUsersToTask = exports.removeTeamMember = exports.addTeamMember = exports.getAllTeams = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
// Get all teams with their members
const getAllTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded)
        return res.status(401).json({ error: 'Unauthorized' });
    const userId = decoded.userId;
    try {
        const teams = yield prisma.team.findMany({
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
    }
    catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});
exports.getAllTeams = getAllTeams;
// add a member to a team
const addTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded)
        return res.status(401).json({ error: 'Unauthorized' });
    const invitedByUserId = decoded.userId;
    const { projectId, userId } = req.body;
    try {
        const updatedUser = yield prisma.user.update({
            where: { userId: Number(userId) },
            data: {
                teamId: Number(projectId),
            },
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
});
exports.addTeamMember = addTeamMember;
// Remove a member from a team
const removeTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId, userId } = req.params;
    try {
        const updatedUser = yield prisma.user.update({
            where: {
                userId: parseInt(userId),
                teamId: parseInt(teamId) // Ensure user is in this team
            },
            data: {
                teamId: null
            }
        });
        res.status(200).json(updatedUser);
    }
    catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ error: 'Failed to remove team member' });
    }
});
exports.removeTeamMember = removeTeamMember;
const assignUsersToTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId, userIds } = req.body;
    try {
        // Validate input
        if (!taskId || !Array.isArray(userIds)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data. Task ID and array of user IDs are required.'
            });
        }
        // Check if task exists
        const task = yield prisma.task.findUnique({
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
        const validTeamMembers = task.project.projectTeams.flatMap(pt => pt.team.user.map(user => user.userId));
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
        const result = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Remove existing assignments
            yield tx.taskAssignment.deleteMany({
                where: { taskId }
            });
            // Create new assignments
            const assignments = yield Promise.all(userIds.map(userId => tx.taskAssignment.create({
                data: {
                    taskId,
                    userId
                }
            })));
            // Update the main assignee in the Task table (using the first user if available)
            if (userIds.length > 0) {
                yield tx.task.update({
                    where: { id: taskId },
                    data: { assignedUserId: userIds[0] }
                });
            }
            else {
                yield tx.task.update({
                    where: { id: taskId },
                    data: { assignedUserId: null }
                });
            }
            return assignments;
        }));
        // Send success response
        return res.status(200).json({
            success: true,
            message: 'Users assigned to task successfully',
            assignments: result
        });
    }
    catch (error) {
        console.error('Error in assignUsersToTask:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to assign users to task',
            error: error.message
        });
    }
});
exports.assignUsersToTask = assignUsersToTask;
// get project team members
const getProjectTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const teamMembers = yield prisma.user.findMany({
            where: {
                team: {
                    projectTeams: {
                        some: {
                            projectId: Number(projectId),
                        },
                    },
                },
            },
        });
        res.status(200).json(teamMembers);
    }
    catch (error) {
        console.error('Error fetching project team members:', error);
        res.status(500).json({ error: 'Failed to fetch project team members' });
    }
});
exports.getProjectTeamMembers = getProjectTeamMembers;
