import express from "express";
import { register, login, logout, sendOtp, verifyOtp } from "../controllers/authController.js";
import {authenticateToken }  from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
