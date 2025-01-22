import { Router } from "express";
import { getTasks, createTask, updateTaskStatus, deleteTask, getTaskById } from "../controllers/taskController";

const router = Router();

router.get("/:projectId", getTasks);
router.post("/:projectId", createTask);
router.patch("/:taskId/status", updateTaskStatus);
router.delete("/:taskId", deleteTask);
router.get("/:taskId", getTaskById);

export default router;