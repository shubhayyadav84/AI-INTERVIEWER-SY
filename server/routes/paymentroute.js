import express from "express";
import isAuth from "../middleware/isauth.js";
import { createOrder, verifyPayment } from "../controllers/paymentcontroller.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", isAuth, createOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);

export default paymentRouter;
