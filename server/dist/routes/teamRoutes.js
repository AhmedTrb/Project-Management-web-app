"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamController_1 = require("../controllers/teamController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/", auth_1.authMiddleware, teamController_1.getAllTeams);
router.post("/members", auth_1.authMiddleware, teamController_1.addTeamMember);
router.delete("/:teamId/members/:userId", auth_1.authMiddleware, teamController_1.removeTeamMember);
router.patch("/:teamId/members/:userId/role", auth_1.authMiddleware, teamController_1.updateTeamMemberRole);
exports.default = router;
