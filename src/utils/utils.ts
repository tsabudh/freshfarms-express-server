import { Request, Response } from "express";

export const healthChecker = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is running fine.",
  }); 
};