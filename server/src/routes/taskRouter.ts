import { Router } from "express";
import { getProjectTasks, createTask, updateTaskStatus, deleteTask, getTaskById , getUserTasks} from "../controllers/taskController";
import { authMiddleware } from "../middleware/auth";
import { assignUserToTask, getTaskAssignees, removeUserFromTask } from "../controllers/taskAssignmentController";

const router = Router();

router.use(authMiddleware);

router.get("/:projectId",getProjectTasks);
router.post("/:projectId", createTask);
router.patch("/:taskId/status",updateTaskStatus);
router.get("/",getUserTasks);
router.delete("/:taskId" ,deleteTask);
router.get("/:taskId" ,getTaskById);

// task assignments
router.post('/assign/task', assignUserToTask);
router.delete('/:taskId/users/:userId', removeUserFromTask);
router.get('/:taskId/assignees', getTaskAssignees);
export default router;