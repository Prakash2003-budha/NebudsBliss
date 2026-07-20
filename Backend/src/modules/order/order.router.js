import { Router } from "express";
import orderCtr from "./order.controller.js";
import { bodyValidator } from "../../middelware/request.validator.js";
import { OrderCreateDTO, OrderUpdateDTO } from "./order.validator.js";
import allowUser from "../../middelware/auth.middleware.js";
import { uploader } from "../../middelware/file-handeling.middleware.js";

const orderRouter = Router();

// When the order is sent as multipart/form-data (needed to attach the payment
// screenshot file), fields that are actually objects/arrays — items, location —
// arrive as JSON strings. Parse them back before the Joi validator runs.
const parseOrderJsonFields = (req, res, next) => {
    try {
        if (typeof req.body.items === "string") {
            req.body.items = JSON.parse(req.body.items);
        }
        if (typeof req.body.location === "string") {
            req.body.location = JSON.parse(req.body.location);
        }
        next();
    } catch {
        next({
            code: 400,
            message: "Invalid order data format",
            status: "INVALID_JSON_FIELD"
        });
    }
};

// Users need to be logged in to create orders and view them
orderRouter.post(
    '/orders',
    allowUser(),
    uploader().single("paymentScreenshot"),
    parseOrderJsonFields,
    bodyValidator(OrderCreateDTO),
    orderCtr.createOrder
);

// A user's own order history (must come before /orders/:id)
orderRouter.get('/orders/my', allowUser(), orderCtr.getMyOrders);

// Admin routes for managing orders
orderRouter.get('/orders', allowUser("Admin"), orderCtr.getAllOrders);
orderRouter.get('/orders/:id', allowUser(), orderCtr.getOrderDetail);
orderRouter.patch('/orders/:id', allowUser("Admin"), bodyValidator(OrderUpdateDTO), orderCtr.updateOrder);
orderRouter.delete('/orders/:id', allowUser("Admin"), orderCtr.deleteOrder);

export default orderRouter;