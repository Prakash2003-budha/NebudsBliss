import mongoose from "mongoose";
import { ItemCategory } from "../../config/constants.js";

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Item name is required"],
        minLength: [2, "Name must be at least 2 characters"],
        maxLength: [100, "Name cannot exceed 100 characters"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Item description is required"],
        minLength: [10, "Description must be at least 10 characters"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    },
    discountPrice: {
        type: Number,
        min: [0, "Discount price cannot be negative"]
    },
    sku: {
        type: String,
        required: [true, "SKU (Stock Keeping Unit) is required"],
        unique: true,
        trim: true,
        uppercase: true
    },
    category: {
        type: String,
        enum: Object.values(ItemCategory),
        required: [true, "Category is required"]
    },
    brand: {
        type: String,
        trim: true
    },
    stockQuantity: {
        type: Number,
        required: [true, "Stock quantity is required"],
        min: [0, "Stock cannot be negative"],
        default: 0
    },
    images: [{
        url: String,
        optimizeUrl: String,
        public_id: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: [0, "Rating must be at least 0"],
        max: [5, "Rating cannot exceed 5"]
    },
    numberOfReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, 
    autoCreate: true,
    autoIndex: true
});

const ItemModel = mongoose.model("Item", ItemSchema);
export default ItemModel;