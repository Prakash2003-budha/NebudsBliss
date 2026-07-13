import { Router } from "express";
import orderCtr from "./order.controller.js";
import { bodyValidator } from "../../middelware/request.validator.js";
import { OrderCreateDTO, OrderUpdateDTO } from "./order.validator.js";
import allowUser from "../../middelware/auth.middleware.js";

const orderRouter = Router();

// Users need to be logged in to create orders and view them
orderRouter.post('/orders', allowUser(), bodyValidator(OrderCreateDTO), orderCtr.createOrder);

// Admin routes for managing orders
orderRouter.get('/orders', allowUser("Admin"), orderCtr.getAllOrders);
orderRouter.get('/orders/:id', allowUser(), orderCtr.getOrderDetail);
orderRouter.patch('/orders/:id', allowUser("Admin"), bodyValidator(OrderUpdateDTO), orderCtr.updateOrder);
orderRouter.delete('/orders/:id', allowUser("Admin"), orderCtr.deleteOrder);

export default orderRouter;