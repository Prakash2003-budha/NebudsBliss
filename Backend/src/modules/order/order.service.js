import OrderModel from "./order.model.js";
class OrderService {
    orderDataTransform = async (req) => {
        try {
            let data = { ...req.body };
            
            // Backend recalculation of totals for security
            const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shippingFee = data.items.length > 0 ? 200 : 0;
            
            data.subtotal = subtotal;
            data.shippingFee = shippingFee;
            data.totalAmount = subtotal + shippingFee;
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