import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: [true, "Item is required"],
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"]
    },
    title: {
        type: String,
        trim: true,
        default: "",
        maxLength: [80, "Review title cannot exceed 80 characters"]
    },
    comment: {
        type: String,
        required: [true, "Review comment is required"],
        minLength: [3, "Review must be at least 3 characters"],
        maxLength: [1000, "Review cannot exceed 1000 characters"],
        trim: true
    }
}, {
    timestamps: true,
    autoCreate: true,
    autoIndex: true
});

// A user may only review a given product once. Update flow reuses the same document
// instead of inserting duplicates (the UI lets a user edit their own review).
ReviewSchema.index({ item: 1, user: 1 }, { unique: true });

const ReviewModel = mongoose.model("Review", ReviewSchema);
export default ReviewModel;