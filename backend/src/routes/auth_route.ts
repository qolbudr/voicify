import { Router } from "express";
import { google } from "../controllers/auth.controller";

const router = Router();
router.post("/google", google);

export default router;