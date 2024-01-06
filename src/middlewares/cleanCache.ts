import express from "express";
import * as validator from "express-validator";

import { clearHash } from "../utils/redisCache";
const cleanCache = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  await next();
  console.log("Calling clearHash() to clean cache");
  clearHash();
};

export default cleanCache;
