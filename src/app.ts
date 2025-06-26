import { Request, Response, NextFunction } from "express";

import express from "express";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import transactionRouter from "./routes/transactionRoutes";
import adminRouter from "./routes/adminRoutes";
import productRouter from "./routes/productRoutes";
import customerRouter from "./routes/customerRoutes";
import contractRouter from "./routes/contractRoutes";
import messageRouter from "./routes/messageRoutes";
import oAuthRouter from "./routes/oauthRoutes";

import AppError from "./utils/appError";
import { healthChecker } from "./utils/utils";


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

app.get("/api/health-check", healthChecker);

app.all("*", (_req: Request, res: Response, _next: NextFunction) => {
  res.status(400).json({
    status: "failure",
    message: "Missed the route.",
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {

  // If the error is an instance of AppError, use its properties
  if (error instanceof AppError) {

    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      caughtBy: 'expressGlobalErrorHandler',
      error: error
    });
  }
  return res.status(400).json({
    status: 'failure',
    message: error.message,
    caughtBy: 'expressGlobalErrorHandler',
    error: error
  })
})





export default app;
