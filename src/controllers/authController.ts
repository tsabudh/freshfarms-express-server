import mongoose from "mongoose";

import express from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";

import { generateJWKS, verifyJWT } from "../utils/jwtUtils";

import Admin from "../models/Admin";
import AppError from "../utils/appError";
import { signJWT } from "../utils/jwtUtils";
import Customer from "../models/Customer";

export const validateAdminAccount = async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username }).select(
      "+password"
    );
    if (admin && bcrypt.compareSync(password, admin.password)) {
      //- Setting up res.locals for loginAdmin middleware
      res.locals.currentUser = admin.id;
      res.locals.userRole = "admin";

      next();
    } else {
      throw new Error("Account not found. Incorrect password or username.");
    }
  } catch (error: any) {
    console.log(error);
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};
export const validateCustomerAccount = async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const { username, password } = req.body;
    const customer = await Customer.findOne({ username: username }).select(
      "+password"
    );
    if (customer && bcrypt.compareSync(password, customer.password)) {
      //- Setting up res.locals for login customer middleware
      res.locals.currentUser = customer.id;
      res.locals.userRole = "customer";
      next();
    } else {
      throw new Error("Account not found. Incorrect password or username.");
    }
  } catch (error: any) {
    console.log(error);
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const loginAccount = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const payload = {
      currentUser: res.locals.currentUser,
      userRole: res.locals.userRole,
    };


    const token = signJWT(payload);

    if (!token) throw new AppError("Could not sign token.", 400);

    let user;
    if (payload.userRole == 'admin') {
      user = await Admin.findById(payload.currentUser)
    } else if (payload.userRole == 'customer') {
      user = await Customer.findById(payload.currentUser)
    }

    res.status(200).json({
      status: "success",
      user,
      token,
    });

  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      status: "failure",
      message: error.message,
    });
  }
};

export const checkAuthentication = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {

  try {
    const bearerHeader = req.headers.authorization;

    if (bearerHeader) {
      const bearerToken = bearerHeader.split(" ")[1];

      const returnedObject: any = verifyJWT(bearerToken);
      // returnedObject = JSON.parse(returnedObject as string);


      if (returnedObject instanceof Error) {
        return res.status(401).json({
          status: "failure",
          message: returnedObject.message,
        });
      }

      const currentUser = (returnedObject as JwtPayload).currentUser;
      const userRole = (returnedObject as JwtPayload).userRole;

      let user;
      if (userRole == 'admin') {
        user = await Admin.findById(currentUser)
      } else if (userRole == 'customer') {
        user = await Customer.findById(currentUser)
      }

      if (!user) {
        console.log(`${userRole} not found`)
        throw new AppError(`${userRole.replace(/\b\w/g, (char) => char.toUpperCase())} of given id does not exists!`, 404)
      }
      res.locals.currentUser = currentUser;
      res.locals.userRole = userRole;
      next();
    } else {
      return res.send({
        status: "failure",
        message: "Login first",
      });
    }
  } catch (error: any) {

    console.error(error);
    return next(error); 
  }

};

export const restrictTo =
  (...userRoles: String[]) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const userRole = res.locals.userRole;

      // Limit routes to customer
      if (!userRoles.includes(res.locals.userRole)) {
        return next(
          new AppError(
            "Permission denied. Please contact your administrator.",
            403
          )
        );
      }

      next();
    };

export const logoutAccount = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.send({
    status: "success",
    token: "Invalid Token",
  });
};

export const refreshJWTToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const bearerHeader = req.headers.authorization;

    if (!bearerHeader) {
      throw new AppError('Authorization not provided!', 400)
    }
    const bearerToken = bearerHeader.split(" ")[1];

    const returnedObject: any = verifyJWT(bearerToken);
    // returnedObject = JSON.parse(returnedObject as string);


    if (returnedObject instanceof Error) {
      res.status(401).json({
        status: "failure",
        message: returnedObject.message,
      });
      throw new AppError(returnedObject.message, 404);
    }


    const payload = {
      currentUser: res.locals.currentUser,
      userRole: res.locals.userRole,
    };


    const token = signJWT(payload);
    if (!token) throw new AppError("Could not sign token.", 400);

    let user;
    if (payload.userRole == 'admin') {
      user = await Admin.findById(payload.currentUser)
    }
    else if (payload.userRole == 'customer') {
      user = await Customer.findById(payload.currentUser)
    }

    if (!user) throw new AppError('You need to log in again...', 400);

    res.status(200).json({
      status: "success",
      user,
      token,
    });

  } catch (error: any) {
    res.status(400).json({
      status: "failure",
      message: error.message,
    });
  }
};
