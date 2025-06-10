import { Server as IOServer, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SendMessagePayload {
  content: string;
  teamId: number;
  userId: number;
}

export function initMessageSocket(io: IOServer) {
  io.on("connection", (socket: Socket) => {
    // Get userId from auth data
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log("Client connected:", socket.id, "User:", userId);

    socket.on("joinTeam", (teamId: number) => {
      socket.join(`team_${teamId}`);
      console.log(`Socket ${socket.id} joined team_${teamId}`);
    });

    socket.on("sendMessage", async (payload: SendMessagePayload) => {
      try {
        const { content, teamId, userId } = payload;

        // Find team member
        const teamMember = await prisma.teamMember.findFirst({
          where: {
            userId,
            teamId,
          },
        });

        if (!teamMember) {
          throw new Error("User is not a member of this team");
        }

        // Create message
        const message = await prisma.message.create({
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
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", {
          message:
            error instanceof Error ? error.message : "Failed to send message",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}
