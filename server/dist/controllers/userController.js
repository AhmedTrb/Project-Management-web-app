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
exports.getAllUsers = exports.getAuthenticatedUser = exports.googleSignup = void 0;
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const google_auth_1 = require("../utils/google-auth");
const prisma = new client_1.PrismaClient();
const googleSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        // Verify Google token
        const googleUser = yield (0, google_auth_1.authenticateGoogleToken)(token);
        // Check if user exists
        let user = yield prisma.user.findUnique({
            where: { email: googleUser.email }
        });
        // If not, create new user
        if (!user) {
            user = yield prisma.user.create({
                data: {
                    googleId: googleUser.googleId,
                    email: googleUser.email,
                    username: googleUser.name || googleUser.email.split('@')[0],
                }
            });
        }
        // Generate JWT
        const authToken = (0, jwt_1.generateAccessToken)(user.userId.toString());
        res.status(200).json({
            user: {
                id: user.userId,
                username: user.username,
                email: user.email
            },
            token: authToken
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Google authentication failed' });
    }
});
exports.googleSignup = googleSignup;
const getAuthenticatedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Extract token from HTTP-only cookie
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt;
        if (!token)
            return res.status(401).json({ message: "No token provided" });
        // Verify the token
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.userId))
            return res.status(401).json({ message: "Unauthorized" });
        // Fetch user from database
        const foundUser = yield prisma.user.findUnique({
            where: { userId: decoded.userId },
        });
        if (!foundUser)
            return res.status(404).json({ message: "User not found" });
        res.json(foundUser);
    }
    catch (error) {
        console.error("Error fetching authenticated user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAuthenticatedUser = getAuthenticatedUser;
// get all user 
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving users" });
    }
});
exports.getAllUsers = getAllUsers;
