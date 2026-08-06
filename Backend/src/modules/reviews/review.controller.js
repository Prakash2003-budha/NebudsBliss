import mongoose from "mongoose";
import reviewSvc from "./review.service.js";

class ReviewController {

    // Public — list all reviews for one item (and include reviewer info).
    getReviews = async (req, res, next) => {
        try {
            const itemId = req.query.itemId;
            if (!itemId) {
                throw { code: 400, message: "itemId query parameter is required", status: "MISSING_ITEM" };
            }
            if (!mongoose.Types.ObjectId.isValid(itemId)) {
                throw { code: 400, message: "Invalid item id", status: "INVALID_ITEM" };
            }

            const reviews = await reviewSvc.getReviewsByItem(itemId);

            res.json({
                data: reviews,
                message: "Reviews fetched successfully",
                status: "FETCH_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    // Authenticated — post a review. If the user has already reviewed this
    // product, their existing review is updated instead of adding a duplicate.
    createReview = async (req, res, next) => {
        try {
            const userId = req.authUser._id;
            const { item, rating, title, comment } = req.body;

            const itemExists = await reviewSvc.itemExists(item);
            if (!itemExists) {
                throw { code: 404, message: "Item not found", status: "ITEM_NOT_FOUND" };
            }

            const existing = await reviewSvc.getSingleByFilter({ item, user: userId });

            if (existing) {
                const updated = await reviewSvc.updateReviewById(existing._id, {
                    rating,
                    title: title || "",
                    comment,
                });
                await reviewSvc.resyncItemRating(item);

                res.json({
                    data: updated,
                    message: "Your review has been updated",
                    status: "UPDATE_SUCCESS",
                    option: null
                });
            } else {
                const review = await reviewSvc.createReview({
                    item,
                    user: userId,
                    rating,
                    title: title || "",
                    comment,
                });
                await reviewSvc.resyncItemRating(item);

                res.json({
                    data: review,
                    message: "Review posted successfully",
                    status: "CREATE_SUCCESS",
                    option: null
                });
            }
        } catch (exception) {
            next(exception);
        }
    }

    // Authenticated — owner can remove their own review; admin can remove any.
    deleteReview = async (req, res, next) => {
        try {
            const review = await reviewSvc.getSingleByFilter({ _id: req.params.id });
            if (!review) {
                throw { code: 404, message: "Review not found", status: "REVIEW_NOT_FOUND" };
            }

            const isOwner = review.user && review.user._id
                && String(review.user._id) === String(req.authUser._id);
            const isAdmin = req.authUser.role === "Admin";

            if (!isOwner && !isAdmin) {
                throw { code: 403, message: "You are not allowed to delete this review", status: "UNAUTHORIZED" };
            }

            const itemId = review.item;
            await reviewSvc.deleteReviewById(req.params.id);
            await reviewSvc.resyncItemRating(itemId);

            res.json({
                data: null,
                message: "Review deleted successfully",
                status: "DELETE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }
}

const reviewCtr = new ReviewController();
export default reviewCtr;