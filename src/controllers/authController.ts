import mongoose from "mongoose";

import express from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

import Admin from "../models/Admin";

export const validateAccount = async function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username }).select('+password');
    if (admin && bcrypt.compareSync(password, admin.password)) {
      //- Setting up res.locals for loginAdmin middleware
      res.locals.currentUser = admin.id;
      next();
    } else {
      console.log("Account not found. Incorrect password or username.");
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

export const loginAccount = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const payload = {
    currentUser: res.locals.currentUser,
    issuedAt: Date.now(),
  };
  let token = jwt.sign(payload, (process.env.JWT_SECRET_KEY as string), function (error, token) {
    if (error) {
      console.log(error);
    }
    if (token) {
      res.send({
        status: "success",
        token: token,
      });
    }
  });
};

export const checkClearance = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader) {
    const bearerToken = bearerHeader.split(" ")[1];

    jwt.verify(bearerToken, (process.env.JWT_SECRET_KEY as string), (error, decodedToken) => {
      if (error) {
        console.log(error);
        res.send({
          status: "failure",
          message: error.message,
        });
        return;
      }
      // console.log(JSON.parse(decodedToken))
      console.log((decodedToken as JwtPayload).currentUser)
      res.locals.currentUser = (decodedToken as JwtPayload).currentUser;
      next();
    });
  } else {
    res.send({
      status: "failure",
      message: "Login first",
    });
  }
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
// module.exports = {
//   validateAccount,
//   loginAccount,
//   checkClearance,
//   logoutAccount,
// };
