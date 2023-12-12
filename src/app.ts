import { Request, Response, NextFunction } from "express";

import express from "express";

import bodyParser from "body-parser";
import cors from "cors";

const {
  transactionRouter,
  productRouter,
  customerRouter,
  redisRouter,
  adminRouter,
} = require("./routes/index.js");

const { authController } = require("./controllers/index.js");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/admins", adminRouter);

app.use(authController.checkClearance);

app.use("/api/v1/products", productRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/customers", customerRouter);

app.use("/api/v1/redis", redisRouter);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.json({
    status: "failure",
    message: "Missed the route.",
  });
});

module.exports = app;
// export {}
