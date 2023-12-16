import { Request, Response, NextFunction } from "express";
import Admin  from "../models/Admin";

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let adminDetails = req.body;
    let newAdmin = new Admin(adminDetails);

    console.log("hello");
    console.log(newAdmin);

    newAdmin = await newAdmin.save();
    console.log("done");

    res.send({
      status: "success",
      data: newAdmin,
    });
  } catch (error:any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};


