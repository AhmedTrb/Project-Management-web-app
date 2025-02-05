import express from 'express';
import {
  getAuthenticatedUser
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();


router.post('/authenticated',authMiddleware,getAuthenticatedUser);


export default router;