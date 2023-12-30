import mongoose from "mongoose";
import express from "express";
import Product from "../models/Product";

export const addProduct = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let newProduct = new Product(req.body);
    newProduct = await newProduct.save();
    res.send({
      status: "success",
      data: newProduct,
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const updateManyProducts = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const getProduct = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const productId = req.params.id;

    const query = Product.findById(productId);
    const product = await query;
    if (!product) throw new Error("Product not found with that ID");
    res.send({
      status: "success",
      data: product,
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const updateProduct = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const getAllProducts = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const products = await Product.find();
    res.json({
      status: "success",
      data: products,
    });
  } catch (error: any) {
    console.log(error);
    res.json({
      status: "failure",
      message: error.message,
    });
  }
};
