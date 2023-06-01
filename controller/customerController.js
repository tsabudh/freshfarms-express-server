const mongoose = require("mongoose");

const Customer = require("./../model/customerModel");

const addCustomer = async (req, res, next) => {
  try {
    let newCustomer = await Customer.create(req.body);
    res.send({
      status: "success",
      data: newCustomer,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const name = req.query.name;
    const phone = req.query.phone;
    const nameExpression = new RegExp(name);
    const phoneExpression = new RegExp(`${phone}`);

    let filter = {};
    if (name) filter.name = { $regex: nameExpression, $options: "i" };
    if (name) filter.phone = { $regex: phoneExpression };

    let customers = await Customer.find().limit(limit).sort({ name: 1 });
    res.send({
      status: "success",
      data: customers,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    res.send({
      status: "success",
      data: customer,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

const updateCustomer = async (req, res, next) => {
  const customerId = req.params.id;

  const newDetails = req.body;
  console.log(newDetails);

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      newDetails,
      {
        returnDocument: "after",
      }
    );
    res.send({
      status: "success",
      data: updatedCustomer,
    });
  } catch (error) {
    const customer = await Customer.findById(customerId);

    res.send({
      status: "failure",
      data: {
        warning: "UPDATE FAILED",
        customer: customer,
      },
      message: error.message,
    });
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    await Customer.findByIdAndDelete(customerId);
    res.send();
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

module.exports = {
  getAllCustomers,
  addCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};
