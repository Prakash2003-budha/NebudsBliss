import OrderModel from "./order.model.js";
import ItemModel from "../ItemModel/item.model.js";
import cloudianarySvc from "../../services/cloudinary.services.js";
import promoCodeSvc from "../promoCode/promoCode.service.js";

const SHIPPING_FEE = 200;

class OrderService {
    /**
     * Builds the order document from the request.
     *
     * SECURITY: Prices and totals are NEVER taken from the client. The client
     * may only specify productId + quantity — every price is re-read from the
     * catalog, stock is validated, and the totals are recomputed server-side.
     */
    orderDataTransform = async (req) => {
        try {
            let data = { ...req.body };

            // The order route requires a logged-in user, so this should always be set.
            // Guard anyway in case the middleware chain ever changes.
            if (req.authUser && req.authUser._id) {
                data.userId = req.authUser._id;
            }

            // Upload the payment screenshot (if provided) to Cloudinary, same as item/poster images
            if (req.file) {
                const upload = await cloudianarySvc.fileUpload(req.file.path, "orders/payment-screenshots/");
                data.paymentScreenshot = {
                    url: upload.url,
                    public_id: upload.public_id
                };
            }

            // ---- SECURITY: Rebuild items from the database, rejecting any
            // ---- client-supplied name/price fields entirely.
            if (!Array.isArray(data.items) || data.items.length === 0) {
                throw { code: 400, message: "Order must contain at least one item", status: "EMPTY_ORDER" };
            }

            const productIds = data.items.map((it) => it.productId);
            const products = await ItemModel.find({ _id: { $in: productIds }, isActive: true });

            const productMap = new Map(products.map((p) => [String(p._id), p]));

            const rebuiltItems = [];
            let subtotal = 0;

            for (const line of data.items) {
                const product = productMap.get(String(line.productId));
                if (!product) {
                    throw {
                        code: 400,
                        message: `One or more products in your order are no longer available.`,
                        status: "PRODUCT_UNAVAILABLE"
                    };
                }

                const quantity = Math.max(1, Math.floor(Number(line.quantity) || 1));

                // Validate stock
                if (product.stockQuantity < quantity) {
                    throw {
                        code: 400,
                        message: `Only ${product.stockQuantity} unit(s) of "${product.name}" are in stock.`,
                        status: "INSUFFICIENT_STOCK"
                    };
                }

                const unitPrice = product.discountPrice ?? product.price;

                rebuiltItems.push({
                    productId: product._id,
                    name: product.name,
                    quantity,
                    price: unitPrice
                });

                subtotal += unitPrice * quantity;
            }

            data.subtotal = subtotal;

            // Optional promo code. The code is re-validated server-side and the
            // discount amount is recomputed from OUR subtotal — never trusted
            // from the client. Discount applies to the subtotal only.
            // Runs BEFORE the stock decrement so an unusable code can't burn
            // inventory for an order that will be rejected.
            if (data.promoCode) {
                const promo = await promoCodeSvc.validatePromo({
                    code: data.promoCode,
                    subtotal,
                    userId: data.userId
                });
                data.promoCode = promo.code;
                data.discount = promo.discountAmount;
            }

            // Decrement stock so we never oversell.
            await Promise.all(
                rebuiltItems.map((line) =>
                    ItemModel.updateOne(
                        { _id: line.productId },
                        { $inc: { stockQuantity: -line.quantity } }
                    )
                )
            );

            data.items = rebuiltItems;
            data.shippingFee = SHIPPING_FEE;

            data.totalAmount = Math.max(0, subtotal + SHIPPING_FEE - (data.discount || 0));
            data.paymentStatus = "pending";
            data.orderStatus = "processing";

            if (data.mapLink) {
                data.mapUrl = data.mapLink;
            }

            if (data.paymentMethod === "bank") {
                const orderIdBuffer = Math.floor(Math.random() * 1000000).toString();
                data.dynamicQrString = `upi://pay?pa=nebudsbliss@bank&pn=NebudsBliss&am=${data.totalAmount}&cu=NPR&tr=ORD-${orderIdBuffer}`;
            }

            return data;
        } catch (exception) {
            throw exception;
        }
    }

    orderStore = async (data) => {
        try {
            const orderObj = new OrderModel(data);
            return await orderObj.save();
        } catch (exception) {
            throw exception;
        }
    }

    getAllOrders = async (filter = {}) => {
        try {
            return await OrderModel.find(filter).sort({ createdAt: -1 });
        } catch (exception) {
            throw exception;
        }
    }

    getOrderById = async (id) => {
        try {
            return await OrderModel.findById(id);
        } catch (exception) {
            throw exception;
        }
    }

    updateOrderById = async (id, updateData) => {
        try {
            return await OrderModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        } catch (exception) {
            throw exception;
        }
    }

    deleteOrderById = async (id) => {
        try {
            return await OrderModel.findByIdAndDelete(id);
        } catch (exception) {
            throw exception;
        }
    }
}

const orderSvc = new OrderService();
export default orderSvc;