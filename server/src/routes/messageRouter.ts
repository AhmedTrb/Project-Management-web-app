import express from "express";
import { getTeamMessages } from "../controllers/messageController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/:teamId", authMiddleware, getTeamMessages);

export default router;
