const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Admin = require("../model/adminModel");

const validateAccount = async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username });
    console.log(admin);
    if (admin && bcrypt.compareSync(password, admin.password)) {
      console.log("found and matched");
      next();
    } else {
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

module.exports = { validateAccount };
