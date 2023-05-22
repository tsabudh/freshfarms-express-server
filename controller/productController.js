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

const updateManyProducts = async (req, res, next) => {
  try {
    const db = mongoose.connection.db;

    let results = await Product.find({}, { name: 1 });

    results.forEach((doc, index, array) => {
      Product.findOneAndUpdate(
        { _id: doc.id },
        {
          $set: { name: `${doc.name.trimEnd()}` },
        }
      ).exec();
    });

    res.send({
      status: "success",
      data: results,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

const getProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    const query = Product.findById(productId);
    const product = await query;

    res.send({
      status: "success",
      data: product,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const updateDetails = req.body;
    const query = Product.findByIdAndUpdate(productId, updateDetails, {
      new: true,
    });
    const product = await query;

    res.send({
      status: "success",
      data: product,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

module.exports = { addProduct, updateManyProducts, getProduct, updateProduct };
