import { Router } from "express";
import { getTasks, createTask, updateTaskStatus } from "../controllers/taskController";

const router = Router();

router.get("/:projectId", getTasks);
router.post("/:projectId", createTask);
router.patch("/:taskId/status", updateTaskStatus);

export default router;