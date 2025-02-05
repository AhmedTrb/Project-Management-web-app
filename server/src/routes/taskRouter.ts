import { Router } from "express";
import { getProjectTasks, createTask, updateTaskStatus, deleteTask, getTaskById , getUserTasks} from "../controllers/taskController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/:projectId",authMiddleware,getProjectTasks);
router.post("/:projectId", authMiddleware ,createTask);
router.patch("/:taskId/status",authMiddleware, updateTaskStatus);
router.get("/user",authMiddleware, getUserTasks);
router.delete("/:taskId",authMiddleware ,deleteTask);
router.get("/:taskId" ,authMiddleware,getTaskById);

export default router;