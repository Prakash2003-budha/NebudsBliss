import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, index: true },
    trackingToken: { type: String, required: false, unique: true, sparse: true, index: true },
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        minLength: [2, "Full name must be at least 2 characters long"],
        maxLength: [100, "Full name cannot exceed 100 characters"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        minLength: [10, "Phone number must be at least 10 characters long"],
        maxLength: [15, "Phone number cannot exceed 15 characters"]
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        maxlength: [254, "Email cannot exceed 254 characters"]
    },
    address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
        minLength: [5, "Address must be at least 5 characters long"],
        maxLength: [250, "Address cannot exceed 250 characters"]
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
        minLength: [2, "City must be at least 2 characters long"],
        maxLength: [80, "City cannot exceed 80 characters"]
    },
    note: {
        type: String,
        trim: true,
        maxlength: [500, "Order note cannot exceed 500 characters"]
    },
    location: { lat: Number, lng: Number },
    mapUrl: {
        type: String,
        trim: true,
        maxlength: [2048, "Map link cannot exceed 2048 characters"]
    }, // Stores the Google Maps link
    items: [OrderItemSchema],
    subtotal: Number,
    shippingFee: Number,
    // Optional applied promo code — the code itself is stored (uppercase)
    // along with the exact rupee discount that was granted.
    promoCode: { type: String, trim: true, maxlength: [30, "Promo code cannot exceed 30 characters"] },
    discount: Number,
    totalAmount: Number,
    paymentMethod: { type: String, enum: ["cash", "bank"], required: true },
    // Optional proof-of-payment screenshot, mainly for bank transfers.
    // Uploaded through the same Cloudinary flow used for item/poster images.
    paymentScreenshot: {
        url: { type: String },
        public_id: { type: String }
    },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    orderStatus: { type: String, enum: ["processing", "shipped", "delivered", "cancelled"], default: "processing" },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);