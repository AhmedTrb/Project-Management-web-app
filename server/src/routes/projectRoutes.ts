import { Router } from "express";
import { getProjects, createProject, getProjectById, deleteProject, getProjectDependencies, getProjectTeamMembers } from "../controllers/projectController";
import { authMiddleware } from "../middleware/auth";


const router = Router();

router.get("/",authMiddleware,getProjects);
router.post("/" ,authMiddleware,createProject);
router.get("/:projectId",authMiddleware ,getProjectById);
router.delete("/:projectId",authMiddleware ,deleteProject);
router.get("/:projectId/tasks/dependencies",authMiddleware ,getProjectDependencies);
router.get("/:projectId/team",authMiddleware,getProjectTeamMembers);

export default router;
