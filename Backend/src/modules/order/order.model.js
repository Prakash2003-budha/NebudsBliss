import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: [true, "Product ID is required"]
    },
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"]
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"]
    }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    city: {
        type: String,
        required: [true, "City is required"]
    },
    note: {
        type: String
    },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    items: [OrderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "bank"],
        required: [true, "Payment method is required"]
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    orderStatus: {
        type: String,
        enum: ["processing", "shipped", "delivered", "cancelled"],
        default: "processing"
    },
    dynamicQrString: {
        type: String
    }
}, {
    timestamps: true,
    autoCreate: true,
    autoIndex: true
});

const OrderModel = mongoose.model("Order", OrderSchema);
export default OrderModel;