import { Router } from "express";
import { getProjects, createProject, getProjectById, deleteProject, getProjectDependencies } from "../controllers/projectController";

const router = Router();

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:projectId", getProjectById);
router.delete("/:projectId", deleteProject);
router.get("/:projectId/tasks/dependencies", getProjectDependencies);

export default router;
