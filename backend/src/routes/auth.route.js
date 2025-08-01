import express from "express";
// Import the new verifyOtp function from your controller
import { checkAuth, login, logout, signup, updateProfile, verifyOtp } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

// NEW: Add a new route for OTP verification
router.post("/verify-otp", verifyOtp);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;