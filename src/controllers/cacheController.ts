import express from "express";
import { clearHash } from "../utils/redisCache";
export const deleteCache = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    clearHash();
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({
      status: "failure",
      message: error.message,
    });
  }
};
