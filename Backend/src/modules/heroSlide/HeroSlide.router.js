import { Router } from "express";
import heroSlideCtr from "./HeroSlide.controller.js";
import { uploader } from "../../middelware/file-handeling.middleware.js";
import allowUser from "../../middelware/auth.middleware.js";

const heroSlideRouter = Router();

// Public — every visitor sees the same slides.
heroSlideRouter.get("/hero-slides", heroSlideCtr.getAll);

// Admin only
heroSlideRouter.post("/hero-slides", allowUser("Admin"), uploader().single("image"), heroSlideCtr.create);
heroSlideRouter.put("/hero-slides/:id", allowUser("Admin"), uploader().single("image"), heroSlideCtr.replace);
heroSlideRouter.delete("/hero-slides/:id", allowUser("Admin"), heroSlideCtr.remove);

export default heroSlideRouter;
