import express from 'express';
import { handleRefreshToken } from '../controllers/refreshTokenController';



const router = express.Router();

router.get("/token", handleRefreshToken);

export default router;