import orderSvc from "./order.service.js";

class OrderController {
    createOrder = async (req, res, next) => {
        try {
            const orderData = await orderSvc.orderDataTransform(req);
            const savedOrder = await orderSvc.orderStore(orderData);

            res.json({
                data: savedOrder,
                message: "Order placed successfully",
                status: "CREATE_SUCCESS"
            });
        } catch (exception) {
            next(exception);
        }
    }

    getAllOrders = async (req, res, next) => {
        try {
            let filter = {};
            // Optional: Filter by user ID if requested, e.g., filter.userId = req.authUser._id;
            
            if (req.query.status) {
                filter.orderStatus = req.query.status;
            }

            const orders = await orderSvc.getAllOrders(filter);
            
            res.json({
                data: orders,
                message: "Orders fetched successfully",
                status: "FETCH_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    getOrderDetail = async (req, res, next) => {
        try {
            const order = await orderSvc.getOrderById(req.params.id);
            if (!order) {
                throw {
                    code: 404,
                    message: "Order not found",
                    status: "ORDER_NOT_FOUND"
                };
            }
            
            res.json({
                data: order,
                message: "Order detail fetched successfully",
                status: "FETCH_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    updateOrder = async (req, res, next) => {
        try {
            const existingOrder = await orderSvc.getOrderById(req.params.id);
            if (!existingOrder) {
                throw { code: 404, message: "Order not found", status: "ORDER_NOT_FOUND" };
            }

            const updatedOrder = await orderSvc.updateOrderById(req.params.id, req.body);

            res.json({
                data: updatedOrder,
                message: "Order updated successfully",
                status: "UPDATE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    deleteOrder = async (req, res, next) => {
        try {
            const existingOrder = await orderSvc.getOrderById(req.params.id);
            if (!existingOrder) {
                throw { code: 404, message: "Order not found", status: "ORDER_NOT_FOUND" };
            }

            await orderSvc.deleteOrderById(req.params.id);
            
            res.json({
                data: null,
                message: "Order deleted successfully",
                status: "DELETE_SUCCESS",
                option: null
            });
        } catch (exception) {
            next(exception);
        }
    }
}

const orderCtr = new OrderController();
export default orderCtr;