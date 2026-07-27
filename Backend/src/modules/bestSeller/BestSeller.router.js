import { Router } from "express";
import bestSellerCtr from "./BestSeller.controller.js";
import { uploader } from "../../middelware/file-handeling.middleware.js";
import allowUser from "../../middelware/auth.middleware.js";

const bestSellerRouter = Router();

// Public — every visitor sees the same curated posters.
bestSellerRouter.get("/best-sellers", bestSellerCtr.getAll);

// Admin only
bestSellerRouter.post("/best-sellers", allowUser("Admin"), uploader().single("image"), bestSellerCtr.create);
bestSellerRouter.put("/best-sellers/:id", allowUser("Admin"), uploader().single("image"), bestSellerCtr.update);
bestSellerRouter.delete("/best-sellers/:id", allowUser("Admin"), bestSellerCtr.remove);

export default bestSellerRouter;
