import express from "express";

import {clearHash}  from "../utils/redisCache";
const cleanCache = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  await next();
  clearHash();
};

export default cleanCache;
