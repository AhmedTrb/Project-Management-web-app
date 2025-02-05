"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    //if (process.env.STATUS === 'development') return next();
    if (!token) {
        return res.status(401).json({ error: 'No token provided' }); // unauthorized
    }
    const decoded = (0, jwt_1.verifyAccessToken)(token);
    if (!decoded)
        return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
};
exports.authMiddleware = authMiddleware;
