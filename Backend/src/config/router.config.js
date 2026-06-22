import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js"
import itemRouter from "../modules/Items/item.router.js";

const router = Router();
router.use(authRouter)
router.use(itemRouter)

export default router