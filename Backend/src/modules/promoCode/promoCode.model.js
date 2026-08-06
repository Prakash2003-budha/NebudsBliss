import mongoose from "mongoose";

const PromoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Promo code is required"],
        unique: true,
        trim: true,
        uppercase: true,
        maxLength: [30, "Promo code cannot exceed 30 characters"]
    },
    // "percent" → percentage of the subtotal, "fixed" → flat rupee amount
    discountType: {
        type: String,
        enum: ["percent", "fixed"],
        required: [true, "Discount type is required"]
    },
    discountValue: {
        type: Number,
        required: [true, "Discount value is required"],
        min: [1, "Discount value must be at least 1"]
    },
    // Order subtotal must reach this (inclusive) before the code applies.
    minDiscountAmount: {
        type: Number,
        min: [0, "Minimum order amount cannot be negative"],
        default: 0
    },
    // Optional cap for percent codes (e.g. 10% off, max Rs. 500).
    maxDiscount: {
        type: Number,
        min: [0, "Maximum discount cannot be negative"]
    },
    // Total number of times the code can be redeemed across all users. 0 = unlimited.
    maxUses: {
        type: Number,
        min: [0, "Max uses cannot be negative"],
        default: 0
    },
    usedCount: {
        type: Number,
        min: [0, "Used count cannot be negative"],
        default: 0
    },
    // How many separate orders a single user can apply the code to.
    usagePerUser: {
        type: Number,
        min: [1, "Usage per user must be at least 1"],
        default: 1
    },
    // Track which user accounts have already redeemed the code.
    usedBy: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        default: []
    },
    validFrom: { type: Date },
    expiresAt: { type: Date },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    autoCreate: true,
    autoIndex: true
});

export default mongoose.model("PromoCode", PromoCodeSchema);