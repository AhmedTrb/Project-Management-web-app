import express from "express";
import { getAllTeams } from "../controllers/teamController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/",authMiddleware,getAllTeams );


export default router;