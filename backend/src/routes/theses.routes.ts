import { Router } from "express";
import { getTheses, deleteThesis, uploadThesis } from "../controllers/theses.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { uploadThesis as uploadMiddleware } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", getTheses);
router.delete("/:id", authenticate, requireAdmin, deleteThesis);
router.post("/upload/:id", authenticate, requireAdmin, uploadMiddleware, uploadThesis);

export default router;
