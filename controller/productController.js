const mongoose = require("mongoose");
const Product = require("../model/productModel");

const addProduct = async (req, res, next) => {
  try {
    const produceDetails = req.body;
    let newProduct = new Product(req.body);
    newProduct = await newProduct.save();
    res.send({
      status: "success",
      data: newProduct,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

module.exports = {addProduct}