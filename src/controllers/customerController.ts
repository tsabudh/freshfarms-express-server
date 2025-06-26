import express from "express";
import Customer, { ICustomer } from "../models/Customer";
import { getMyDetails } from '../controllers/controllerFactory';

export const addCustomer = async (
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
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
  _next: express.NextFunction
) => {
  try {
    // const limit = Number(req.query.limit as string);
    const name = req.query['name'] as string;
    const phone = req.query['phone'] as string;
    const nameExpression = new RegExp(name);
    const phoneExpression = new RegExp(`${phone}`);

    interface Tfilter {
      name?: any;
      phone?: any;
    }
    let filter: Tfilter = {};

    if (name) filter.name = { $regex: nameExpression, $options: "i" };
    if (name) filter.phone = { $regex: phoneExpression };

    let customers: ICustomer[]  = await Customer.find();
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
  _next: express.NextFunction
) => {
  try {
    const customerId = req.params['id'];
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
  _next: express.NextFunction
) => {
  const customerId = req.params['id'];

 
  const newDetails = req.body;

  try {
    
   
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      newDetails,
      {
        returnDocument: "after",
      }
    );

    if (!updateCustomer) throw new Error('Customer update failed')
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
  _next: express.NextFunction
) => {
  try {
    const customerId = req.params['id'];
    await Customer.findByIdAndDelete(customerId);
    res.status(204).send();
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};


export const getMyDetailsAsCustomer = getMyDetails(Customer);

export const updateMyDetails = async (
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  const customerId = res.locals.currentUser;
  const newDetails = req.body;
  try {

   
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      newDetails,
      {
        returnDocument: "after",
        new:true,
      }
    );

    if (!updatedCustomer) throw new Error('Customer update failed')
    res.send({
      status: "success",
      data: updatedCustomer,
    });
  } catch (error: any) {
    console.log(error);
    const customer = await Customer.findById(customerId);

    res.status(500).send({
      status: "failure",
      data: {
        warning: "UPDATE FAILED",
        customer: customer,
      },
      message: error.message,
    });
  }
};