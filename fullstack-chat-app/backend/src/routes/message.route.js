import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, updateMessageStatus, getUnreadCounts } from "../controllers/message.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/unread-counts", getUnreadCounts);
router.get("/:id", getMessages);

router.post("/send/:id", sendMessage);
router.patch("/status/:messageId", updateMessageStatus);

export default router;
