import { Router } from "express";
import authRoute from "./auth_route";
import speechRoute from "./speech_route";
import { authMiddleware } from "../middleware/auth_middleware";

const router = Router();

router.use("/auth", authRoute);
router.use("/speech", authMiddleware, speechRoute);

export default router;