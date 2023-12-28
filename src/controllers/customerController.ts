import express from "express";
import Customer from "../models/Customer";

import mongoose, { DocumentQuery } from "mongoose";

export const addCustomer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let newCustomer = await Customer.create(req.body);
    res.send({
      status: "success",
      data: newCustomer,
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const getAllCustomers = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    // const limit = Number(req.query.limit as string);
    const name = req.query.name as string;
    const phone = req.query.phone as string;
    const nameExpression = new RegExp(name);
    const phoneExpression = new RegExp(`${phone}`);

    interface Tfilter {
      name?: any;
      phone?: any;
    }
    let filter: Tfilter = {};

    if (name) filter.name = { $regex: nameExpression, $options: "i" };
    if (name) filter.phone = { $regex: phoneExpression };

    let customers: DocumentQuery<any, any> = await Customer.find().cache();
    // .limit(limit); //!.limit not found on query type
    // .sort({ name: 1 }); //!.sort not found on query type

    res.send({
      status: "success",
      data: customers,
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const getCustomer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    res.send({
      status: "success",
      data: customer,
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const updateCustomer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
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
  } catch (error: any) {
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

export const deleteCustomer = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const customerId = req.params.id;
    await Customer.findByIdAndDelete(customerId);
    res.status(204).send();
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};
