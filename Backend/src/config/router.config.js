import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js"
import itemRouter from "../modules/Items/item.router.js";
import posterRouter from "../modules/poster/Poster.router.js";
import orderRouter from "../modules/order/order.router.js";

const router = Router();
router.use(authRouter)
router.use(itemRouter)
router.use(posterRouter)
router.use(orderRouter)

export default router