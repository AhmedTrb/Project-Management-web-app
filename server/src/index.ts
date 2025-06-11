import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { initMessageSocket } from "./sockets/messageSocket";

/* ROUTE IMPORTS */
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRouter";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import refreshTokenRoutes from "./routes/refreshTokenRoutes";
import teamRoutes from "./routes/teamRoutes";
import { PrismaClient } from "@prisma/client";
import messageRoutes from "./routes/messageRouter";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true, 
}));

const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* SOCKET.IO */
initMessageSocket(io);


/* COOKIES */
app.use(cookieParser());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is test route");
});

app.use("/api/auth", authRoutes);
app.use("/api/refresh/",refreshTokenRoutes);

// Protected routes
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/messages", messageRoutes);


/* SERVER */
const port = Number(process.env.PORT) || 8000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});




