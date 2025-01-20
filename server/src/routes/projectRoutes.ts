import { Router } from "express";
import { getProjects, createProject, getProjectById } from "../controllers/projectController";

const router = Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProjectById);

export default router;
