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

    // Order history for the currently logged-in user (any role)
    getMyOrders = async (req, res, next) => {
        try {
            const filter = { userId: req.authUser._id };
            if (req.query.status) {
                filter.orderStatus = req.query.status;
            }

            const orders = await orderSvc.getAllOrders(filter);

            res.json({
                data: orders,
                message: "Your orders fetched successfully",
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

            // Only the order's owner or an Admin can view its details
            const isOwner = order.userId && order.userId.toString() === req.authUser._id.toString();
            if (!isOwner && req.authUser.role !== "Admin") {
                throw {
                    code: 403,
                    message: "You do not have permission to view this order.",
                    status: "UNAUTHORIZED"
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