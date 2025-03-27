import express from "express";
import { createChallenge, getUserChallenges, submitGuess, getLeaderboard, startRandomChallenge } from "../controllers/challenge.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Routes protégées
router.post("/create", protectRoute, createChallenge);
router.get("/user", protectRoute, getUserChallenges);
router.post("/submit-guess/:challengeId", protectRoute, submitGuess);
router.get("/leaderboard", getLeaderboard);
router.post("/start-random", protectRoute, startRandomChallenge);

export default router; 