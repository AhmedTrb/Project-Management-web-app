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
exports.getTeamMessages = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getTeamMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teamId = Number(req.params.teamId);
    const limit = 50;
    try {
        const messages = yield prisma.message.findMany({
            where: { teamId },
            orderBy: { createdAt: "asc" },
            take: limit, // Take only the specified number of messages
            include: {
                user: {
                    select: {
                        username: true,
                        profilePictureUrl: true
                    }
                }
            }
        });
        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            createdAt: msg.createdAt,
            senderId: msg.userId,
            senderName: msg.user.username,
            senderAvatar: msg.user.profilePictureUrl || null,
            teamId: msg.teamId
        }));
        res.status(200).json(formattedMessages);
    }
    catch (err) {
        console.error("Error fetching team messages:", err); // More descriptive error logging
        res.status(500).json({ message: "Could not fetch messages" });
    }
});
exports.getTeamMessages = getTeamMessages;
