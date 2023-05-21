const Admin = require("../model/adminModel");

const createAdmin = async (req, res, next) => {
  let adminDetails = req.body;
  console.log(adminDetails);

  try {
    let newAdmin = new Admin(adminDetails);

    console.log("hello");
    console.log(newAdmin);

    newAdmin = await newAdmin.save();
    console.log("done");

    res.send({
      status: "success",
      data: newAdmin,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};





   
    module.exports = { createAdmin };