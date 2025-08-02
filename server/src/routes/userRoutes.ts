import express from 'express';
import {
  getAllUsers,
  getAuthenticatedUser
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /users/authenticated:
 *   post:
 *     summary: Get the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user info
 *       401:
 *         description: Unauthorized
 */
router.post('/authenticated',authMiddleware,getAuthenticatedUser);
router.get('/',authMiddleware,getAllUsers);


export default router;