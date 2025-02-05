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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.handleRefreshToken = void 0;
const jwt_1 = require("../utils/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Refresh Token Route
const handleRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cookies = req.cookies;
        // Check if the refresh token exists in the cookies
        if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt)) {
            console.error('Refresh token not found in cookies');
            return res.status(401).json({ error: 'Unauthorized access' }); // Unauthorized - no refresh token found
        }
        const refreshToken = cookies.jwt;
        // Verify the refresh token
        const decoded = yield (0, exports.verifyRefreshToken)(refreshToken);
        // If verification fails, return forbidden status
        if (!decoded) {
            console.error('Invalid or expired refresh token');
            return res.sendStatus(403); // Forbidden - invalid or expired token
        }
        // If the token is valid, issue a new access token
        const accessToken = (0, jwt_1.generateAccessToken)(decoded.userId);
        // Return the new access token in the response
        return res.json({ accessToken });
    }
    catch (error) {
        // If headers are not already sent, respond with a 500 error
        if (!res.headersSent) {
            return res.status(500).send('Internal server error');
        }
    }
});
exports.handleRefreshToken = handleRefreshToken;
// Utility function to verify the refresh token 
const verifyRefreshToken = (token) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return reject(null); // If the token is invalid or expired, return null
            }
            resolve(decoded);
        });
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
