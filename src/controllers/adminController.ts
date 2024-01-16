import { Request, Response, NextFunction } from "express";
import * as jwt from 'jsonwebtoken';
import Admin from "../models/Admin";

export const signupAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let adminDetails = req.body;
    let newAdmin = new Admin(adminDetails);

    newAdmin = await newAdmin.save();
    //- setting up currentUser for logging in admin after successful signup
    // res.locals.currentUser = newAdmin._id;
    const payload = {
      currentUser: newAdmin._id,
      issuedAt: Date.now(),
    };

    console.log(payload)
    let token = jwt.sign(payload, "secretKey");

    res.send({
      status: "success",
      data: newAdmin,
      token: token
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const getMyDetails = async (req: Request, res: Response, next: NextFunction) => {
  let adminId = (res.locals.currentUser)
  let myDetails = await Admin.findById(adminId);
  console.log(myDetails)
  res.status(200).json({
    status: 'success',
    data: myDetails
  })
}
