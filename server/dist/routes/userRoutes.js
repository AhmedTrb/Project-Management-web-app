"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
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
router.post('/authenticated', auth_1.authMiddleware, userController_1.getAuthenticatedUser);
router.get('/', auth_1.authMiddleware, userController_1.getAllUsers);
exports.default = router;
