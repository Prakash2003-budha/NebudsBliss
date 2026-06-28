import { Router } from "express";
import posterCtr from "./Poster.controller.js";
import { uploader } from "../../middelware/file-handeling.middleware.js";
import allowUser from "../../middelware/auth.middleware.js";

const posterRouter = Router();

// Public
posterRouter.get("/poster", posterCtr.getPoster);

// Admin only
posterRouter.post("/poster", allowUser("Admin"), uploader().single("image"), posterCtr.uploadPoster);
posterRouter.delete("/poster", allowUser("Admin"), posterCtr.deletePoster);

export default posterRouter;