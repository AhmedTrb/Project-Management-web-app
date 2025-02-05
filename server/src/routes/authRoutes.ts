import express from 'express';
import { localSignup, localLogin, logout } from '../controllers/authController';


const router = express.Router();

router.post('/signup', localSignup);
router.post('/login', localLogin);
router.post('/logout', logout );

export default router;