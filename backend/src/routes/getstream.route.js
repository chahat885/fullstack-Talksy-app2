import express from "express";
import { generateToken } from "../controllers/getStream.controller.js";

const router = express.Router();

// This route handles POST requests to generate a user token.
// The URL will be /api/getstream/generate-token
router.post('/generate-token', generateToken);

export default router;
