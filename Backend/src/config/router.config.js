import { Router } from "express";
import authRouter from "../modules/auth/auth.router.js"
import itemRouter from "../modules/Items/item.router.js";
import posterRouter from "../modules/poster/Poster.router.js";
import orderRouter from "../modules/order/order.router.js";
import heroSlideRouter from "../modules/heroSlide/HeroSlide.router.js";
import bestSellerRouter from "../modules/bestSeller/BestSeller.router.js";

const router = Router();
router.use(authRouter)
router.use(itemRouter)
router.use(posterRouter)
router.use(orderRouter)
router.use(heroSlideRouter)
router.use(bestSellerRouter)

export default router