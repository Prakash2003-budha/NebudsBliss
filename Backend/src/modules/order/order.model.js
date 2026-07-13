import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    note: String,
    location: { lat: Number, lng: Number },
    mapUrl: { type: String }, // Stores the Google Maps link
    items: [OrderItemSchema],
    subtotal: Number,
    shippingFee: Number,
    totalAmount: Number,
    paymentMethod: { type: String, enum: ["cash", "bank"], required: true },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    orderStatus: { type: String, enum: ["processing", "shipped", "delivered", "cancelled"], default: "processing" },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);