import { Router } from "express";
import { getProjects, createProject, getProjectById, deleteProject, getProjectDependencies } from "../controllers/projectController";
import { authMiddleware } from "../middleware/auth";
import { auth } from "google-auth-library";


const router = Router();

router.get("/",authMiddleware,getProjects);
router.post("/" ,authMiddleware,createProject);
router.get("/:projectId",authMiddleware ,getProjectById);
router.delete("/:projectId",authMiddleware ,deleteProject);
router.get("/:projectId/tasks/dependencies",authMiddleware ,getProjectDependencies);

export default router;
