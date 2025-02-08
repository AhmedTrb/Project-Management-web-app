import express from 'express';
import {
  getAllUsers,
  getAuthenticatedUser
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();


router.post('/authenticated',authMiddleware,getAuthenticatedUser);
router.get('/',authMiddleware,getAllUsers);


export default router;