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
exports.initMessageSocket = initMessageSocket;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function initMessageSocket(io) {
    io.on("connection", (socket) => {
        // Get userId from auth data
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            socket.disconnect();
            return;
        }
        console.log("Client connected:", socket.id, "User:", userId);
        socket.on("joinTeam", (teamId) => {
            socket.join(`team_${teamId}`);
            console.log(`Socket ${socket.id} joined team_${teamId}`);
        });
        socket.on("sendMessage", (payload) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { content, teamId, userId } = payload;
                // Find team member
                const teamMember = yield prisma.teamMember.findFirst({
                    where: {
                        userId,
                        teamId,
                    },
                });
                if (!teamMember) {
                    throw new Error("User is not a member of this team");
                }
                // Create message
                const message = yield prisma.message.create({
                    data: {
                        text: content,
                        teamId: teamId,
                        userId: userId,
                        teamMemberId: teamMember.id,
                    },
                    include: {
                        user: {
                            select: {
                                username: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                });
                // Format message for client
                const messagePayload = {
                    id: message.id,
                    text: message.text,
                    createdAt: message.createdAt,
                    senderId: userId,
                    senderName: message.user.username,
                    senderAvatar: message.user.profilePictureUrl,
                };
                // Broadcast to team room
                io.to(`team_${teamId}`).emit("newMessage", messagePayload);
            }
            catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", {
                    message: error instanceof Error ? error.message : "Failed to send message",
                });
            }
        }));
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
}
