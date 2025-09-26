import { Router } from "express";
import { generateTTS } from "../controllers/speech.controller";

const router = Router();
router.post("/generate", generateTTS);

export default router;