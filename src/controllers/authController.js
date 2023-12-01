const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Admin } = require("../models/");

const validateAccount = async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username });
    console.log(admin);
    if (admin && bcrypt.compareSync(password, admin.password)) {
      console.log("found and matched");
      res.locals.currentUser = admin.id;
      console.log(res.locals);
      next();
    } else {
      throw new Error("Account not found. Incorrect password or username");
      console.log("account not found/ password incorrect");
    }
  } catch (error) {
    console.log(error);
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

const loginAccount = (req, res, next) => {
  const payload = {
    currentUser: res.locals.currentUser,
    issuedAt: Date.now(),
  };
  let token = jwt.sign(payload, "secretKey", function (error, token) {
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

const checkClearance = (req, res, next) => {
  const bearerHeader = req.headers.authorization;

  if (bearerHeader) {
    const bearerToken = bearerHeader.split(" ")[1];

    jwt.verify(bearerToken, "secretKey", (error, decodedToken) => {
      if (error) {
        console.log(error);
        res.send({
          status: "failure",
          message: error.message,
        });
        return;
      }
      next();
    });
  } else {
    res.send({
      status: "failure",
      message: "Login first",
    });
  }
};

const logoutAccount = (req, res, next) => {
  res.send({
    status: "success",
    token: "Invalid Token",
  });
};
module.exports = {
  validateAccount,
  loginAccount,
  checkClearance,
  logoutAccount,
};
