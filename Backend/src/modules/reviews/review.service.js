import mongoose from "mongoose";
import ReviewModel from "../reviewModel/review.model.js";
import ItemModel from "../ItemModel/item.model.js";

class ReviewService {

    getReviewsByItem = async (itemId) => {
        try {
            return await ReviewModel.find({ item: itemId })
                .populate("user", "fullName image")
                .sort({ createdAt: -1 });
        } catch (exception) {
            throw exception;
        }
    }

    // Admin — every review in the store, with item + reviewer details.
    getAllReviews = async () => {
        try {
            return await ReviewModel.find()
                .populate("user", "fullName email image")
                .populate("item", "name images")
                .sort({ createdAt: -1 });
        } catch (exception) {
            throw exception;
        }
    }

    getSingleByFilter = async (filter) => {
        try {
            return await ReviewModel.findOne(filter)
                .populate("user", "fullName image");
        } catch (exception) {
            throw exception;
        }
    }

    itemExists = async (id) => {
        try {
            return await ItemModel.exists({ _id: id });
        } catch (exception) {
            throw exception;
        }
    }

    createReview = async (data) => {
        try {
            const review = new ReviewModel(data);
            return await review.save();
        } catch (exception) {
            throw exception;
        }
    }

    updateReviewById = async (id, updateData) => {
        try {
            return await ReviewModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        } catch (exception) {
            throw exception;
        }
    }

    deleteReviewById = async (id) => {
        try {
            return await ReviewModel.findByIdAndDelete(id);
        } catch (exception) {
            throw exception;
        }
    }

    // Recomputes the item's average rating + review count from its reviews.
    resyncItemRating = async (itemId) => {
        try {
            const agg = await ReviewModel.aggregate([
                { $match: { item: new mongoose.Types.ObjectId(itemId) } },
                { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
            ]);

            const stats = agg[0] || { avg: 0, count: 0 };

            return await ItemModel.findByIdAndUpdate(itemId, {
                averageRating: Math.round(stats.avg * 10) / 10,
                numberOfReviews: stats.count
            }, { new: true });
        } catch (exception) {
            throw exception;
        }
    }
}

const reviewSvc = new ReviewService();
export default reviewSvc;