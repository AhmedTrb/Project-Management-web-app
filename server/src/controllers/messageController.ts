import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTeamMessages = async (req: Request, res: Response) => {
  const teamId = Number(req.params.teamId);

  const limit = 50; 

  try {
    const messages = await prisma.message.findMany({
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
  } catch (err) {
    console.error("Error fetching team messages:", err); // More descriptive error logging
    res.status(500).json({ message: "Could not fetch messages" });
  }
};
