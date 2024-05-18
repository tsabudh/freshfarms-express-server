import { Request, Response, NextFunction } from "express";

import express from "express";

import bodyParser from "body-parser";
import cors from "cors";

import transactionRouter from "./routes/transactionRoutes";
import adminRouter from "./routes/adminRoutes";
import productRouter from "./routes/productRoutes";
import customerRouter from "./routes/customerRoutes";
import contractRouter from "./routes/contractRoutes";
import redisRouter from "./routes/redisRoutes";
import * as authController from "./controllers/authController";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.use("/api/v1/admins", adminRouter);

//- Protect following routes by checking clearance (jwt)
app.use(authController.checkClearance);

app.use("/api/v1/products", productRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/contracts", contractRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    status: "failure",
    message: "Missed the route.",
  });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    status: 'failure',
    message: error.message,
    caughtBy: 'expressGlobalErrorHandler',
    error: error
  })
})

export default app;
