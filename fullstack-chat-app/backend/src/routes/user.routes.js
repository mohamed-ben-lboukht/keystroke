import express from "express";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.js";
import { getLeaderboard } from "../controllers/challenge.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/profile/:userId", getUserProfile);
router.put("/update", protectRoute, updateUserProfile);
router.get("/leaderboard", getLeaderboard);

export default router; 