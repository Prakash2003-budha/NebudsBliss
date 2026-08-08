import { Router } from "express";
import reviewCtr from "./review.controller.js";
import { bodyValidator } from "../../middelware/request.validator.js";
import { ReviewCreateDTO } from "./review.validator.js";
import allowUser from "../../middelware/auth.middleware.js";

const reviewRouter = Router();

// Public
reviewRouter.get('/reviews', reviewCtr.getReviews);

// Admin only — all reviews across the store (used by the admin panel).
reviewRouter.get('/reviews/all', allowUser("Admin"), reviewCtr.getAllReviews);

// Authenticated (any logged-in user)
reviewRouter.post('/reviews', allowUser(), bodyValidator(ReviewCreateDTO), reviewCtr.createReview);
reviewRouter.delete('/reviews/:id', allowUser(), reviewCtr.deleteReview);

export default reviewRouter;