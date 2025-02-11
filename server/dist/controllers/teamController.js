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
exports.updateTeamMemberRole = exports.removeTeamMember = exports.addTeamMember = exports.getAllTeams = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const types_1 = require("../utils/types");
const prisma = new client_1.PrismaClient();
// Get all teams that the user is a member of
const getAllTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const teams = yield prisma.team.findMany({
            where: {
                members: {
                    some: {
                        userId: Number(decoded.userId)
                    }
                }
            },
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
                },
                projects: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            }
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
    var _a;
    const { teamId, userId, role = types_1.TeamMemberRole.MEMBER } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Check if the requesting user is a team admin
        const requestingUserMembership = yield prisma.teamMember.findFirst({
            where: {
                teamId: Number(teamId),
                userId: Number(decoded.userId),
                role: types_1.TeamMemberRole.OWNER
            }
        });
        if (!requestingUserMembership) {
            return res.status(403).json({ error: 'Only team admins can add members' });
        }
        // Check if user is already a member
        const existingMember = yield prisma.teamMember.findFirst({
            where: {
                teamId: Number(teamId),
                userId: Number(userId)
            }
        });
        if (existingMember) {
            return res.status(409).json({ error: 'User is already a team member' });
        }
        // Add the new team member
        const newTeamMember = yield prisma.teamMember.create({
            data: {
                teamId: Number(teamId),
                userId: Number(userId),
                role
            },
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
        });
        res.status(201).json(newTeamMember);
    }
    catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({ error: 'Failed to add team member' });
    }
});
exports.addTeamMember = addTeamMember;
// Remove a member from a team
const removeTeamMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { teamId, memberId } = req.params;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Check if the requesting user is a team admin
        const requestingUserMembership = yield prisma.teamMember.findFirst({
            where: {
                teamId: Number(teamId),
                userId: Number(decoded.userId),
                role: types_1.TeamMemberRole.OWNER
            }
        });
        if (!requestingUserMembership) {
            return res.status(403).json({ error: 'Only team admins can remove members' });
        }
        // Prevent removing the last admin
        const adminCount = yield prisma.teamMember.count({
            where: {
                teamId: Number(teamId),
                role: types_1.TeamMemberRole.OWNER
            }
        });
        const memberToRemove = yield prisma.teamMember.findFirst({
            where: {
                teamId: Number(teamId),
                userId: Number(memberId)
            }
        });
        if (adminCount === 1 && (memberToRemove === null || memberToRemove === void 0 ? void 0 : memberToRemove.role) === types_1.TeamMemberRole.OWNER) {
            return res.status(400).json({ error: 'Cannot remove the last admin from the team' });
        }
        // Remove the team member
        yield prisma.teamMember.delete({
            where: {
                id: memberToRemove === null || memberToRemove === void 0 ? void 0 : memberToRemove.id
            }
        });
        res.status(200).json({ message: 'Team member removed successfully' });
    }
    catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ error: 'Failed to remove team member' });
    }
});
exports.removeTeamMember = removeTeamMember;
// update team member role
const updateTeamMemberRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { teamId, memberId } = req.params;
    const { newRole } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Check if the requesting user is a team admin
        const requestingUserMembership = yield prisma.teamMember.findFirst({
            where: {
                teamId: Number(teamId),
                userId: Number(decoded.userId),
                role: types_1.TeamMemberRole.OWNER
            }
        });
        if (!requestingUserMembership) {
            return res.status(403).json({ error: 'Only team admins can update member roles' });
        }
        const memberToUpdate = yield prisma.teamMember.findFirst({
            where: {
                teamId: Number(teamId),
                userId: Number(memberId)
            }
        });
        if (!memberToUpdate) {
            return res.status(404).json({ error: 'Team member not found' });
        }
        // Prevent removing the last admin
        if (memberToUpdate.role === types_1.TeamMemberRole.OWNER && newRole !== types_1.TeamMemberRole.OWNER) {
            const adminCount = yield prisma.teamMember.count({
                where: {
                    teamId: Number(teamId),
                    role: types_1.TeamMemberRole.OWNER
                }
            });
            if (adminCount === 1) {
                return res.status(400).json({ error: 'Cannot remove the last admin from the team' });
            }
        }
        const updatedMember = yield prisma.teamMember.update({
            where: {
                id: memberToUpdate.id
            },
            data: {
                role: newRole
            },
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
        });
        res.status(200).json(updatedMember);
    }
    catch (error) {
        console.error('Error updating team member role:', error);
        res.status(500).json({ error: 'Failed to update team member role' });
    }
});
exports.updateTeamMemberRole = updateTeamMemberRole;
