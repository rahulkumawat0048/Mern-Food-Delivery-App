import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders,getOrderById,placeOrder, sendDeliverOtp, updateOrderStatus, verifyDeliverOtp } from "../controllers/order.controller.js";

const orderRouter=express.Router()

orderRouter.post("/place-order",isAuth,placeOrder)
orderRouter.get("/my-orders",isAuth,getMyOrders)
orderRouter.get("/get-assignments",isAuth,getDeliveryBoyAssignment)
orderRouter.get("/get-current-order",isAuth,getCurrentOrder)
orderRouter.post("/send-delivery-otp",isAuth,sendDeliverOtp)
orderRouter.post("/verify-delivery-otp",isAuth,verifyDeliverOtp)


orderRouter.get("/accept-order/:assignmentId",isAuth,acceptOrder)
orderRouter.post("/update-status/:orderId/:shopId",isAuth,updateOrderStatus)
orderRouter.get("/get-order-by-id/:orderId",isAuth,getOrderById)



export default orderRouter