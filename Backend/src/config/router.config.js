import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js"
import itemRouter from "../modules/Items/item.router.js";
import posterRouter from "../modules/poster/Poster.router.js";

const router = Router();
router.use(authRouter)
router.use(itemRouter)
router.use(posterRouter)

export default router