"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
/* ROUTE IMPORTS */
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRouter_1 = __importDefault(require("./routes/taskRouter"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const refreshTokenRoutes_1 = __importDefault(require("./routes/refreshTokenRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
/* CONFIGURATIONS */
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, helmet_1.default)());
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((0, morgan_1.default)("common"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
/* COOKIES */
app.use((0, cookie_parser_1.default)());
/* ROUTES */
app.get("/", (req, res) => {
    res.send("This is test route");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/refresh/", refreshTokenRoutes_1.default);
// Protected routes
app.use("/api/projects", projectRoutes_1.default);
app.use("/api/tasks", taskRouter_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/teams", teamRoutes_1.default);
/* SERVER */
const port = Number(process.env.PORT) || 8000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
