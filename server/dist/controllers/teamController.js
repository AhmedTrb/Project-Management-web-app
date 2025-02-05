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
exports.updateTeam = exports.removeTeamMember = exports.addTeamMember = exports.getAllTeams = void 0;
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
    }
    catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});
exports.getAllTeams = getAllTeams;
// Add a member to a team
const addTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId } = req.params;
    const { userId } = req.body;
    try {
        const updatedUser = yield prisma.user.update({
            where: { userId: parseInt(userId) },
            data: {
                teamId: parseInt(teamId)
            }
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
// Update team details
const updateTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { teamId } = req.params;
    const { teamName, productOwnerUserId, projectManagerUserId } = req.body;
    try {
        const updatedTeam = yield prisma.team.update({
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
    }
    catch (error) {
        console.error('Error updating team:', error);
        res.status(500).json({ error: 'Failed to update team' });
    }
});
exports.updateTeam = updateTeam;
