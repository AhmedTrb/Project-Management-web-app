import express from 'express';
import { 
  localSignup, 
  localLogin, 
  googleSignup ,
  getAuthenticatedUser
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/signup', localSignup);
router.post('/login', localLogin);
router.post('/google-signup', googleSignup);
router.post('/authenticated', getAuthenticatedUser);


export default router;