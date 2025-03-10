"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.localSignup = exports.localLogin = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const prisma = new client_1.PrismaClient();
const localLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user in database
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' }); // unauthorized
        }
        // evaluate password 
        const isMatch = yield (0, password_1.comparePassword)(password, user.password || '');
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate access & refresh tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user.userId.toString());
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.userId.toString());
        // Store the refresh token in an HTTP-only cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true, // Prevents client-side access
            secure: true, // Ensures cookie is only sent over HTTPS (required in production)
            sameSite: 'none', // Required for cross-origin requests
            path: '/api/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        // Send the access token in response
        res.json({
            user: user,
            token: accessToken
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});
exports.localLogin = localLogin;
const localSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: {
                email
            }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const hashedPassword = yield (0, password_1.hashPassword)(password);
        // Create new user
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                profilePictureUrl: "https://avatar.iran.liara.run/public"
            }
        });
        // Generate JWT
        const token = (0, jwt_1.generateAccessToken)(user.userId.toString());
        res.status(201).json({
            user: {
                id: user.userId,
                username: user.username,
                email: user.email
            },
            token
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Signup failed', message: error.message });
    }
});
exports.localSignup = localSignup;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('jwt');
    res.json({ message: 'Logged out' });
});
exports.logout = logout;
