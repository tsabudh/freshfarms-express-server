import { Request, Response, NextFunction } from "express";

import express from "express";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import WebSocket from "ws";
import http from "http";
import transactionRouter from "./routes/transactionRoutes";
import adminRouter from "./routes/adminRoutes";
import productRouter from "./routes/productRoutes";
import customerRouter from "./routes/customerRoutes";
import contractRouter from "./routes/contractRoutes";
import messageRouter from "./routes/messageRoutes";
import oAuthRouter from "./routes/oauthRoutes";

import * as authController from "./controllers/authController";
import AppError from "./utils/appError";


const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true              
}));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use("/api/v1/admins", adminRouter);

app.use("/api/v1/customers", customerRouter);


app.use("/api/v1/products", productRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/contracts", contractRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/auth/", oAuthRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    status: "failure",
    message: "Missed the route.",
  });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {

  // If the error is an instance of AppError, use its properties
  if (error instanceof AppError) {

    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      caughtBy: 'expressGlobalErrorHandler',
      error: error
    });
  }
  res.status(400).json({
    status: 'failure',
    message: error.message,
    caughtBy: 'expressGlobalErrorHandler',
    error: error
  })
})





export default app;
