import catchAsync from '../utils/catchAsync';
import AppError from "../utils/appError";
import mongoose, { Model, Schema, Query, DocumentQuery } from 'mongoose';
import { Request, Response, NextFunction } from 'express';


export const deleteOne = (Model: Model<Schema>) =>

  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError(`Could not find ${Model.modelName} with that ID"`, 404));
    }

    res.status(204).json({
      status: "success",
      message: `The ${Model.modelName} was deleted`,
    });
  });

export const updateOne = (Model: Model<Schema>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError(`Could not find ${Model.modelName} document with that ID`, 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });

    next();
  });

export const createOne = (Model: Model<Schema>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });

    next();
  });

// Define a type with an index signature
type AnyObject = {
  [key: string]: any;
};

export const getOne = (Model: Model<Schema>, popOptions: AnyObject) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query: mongoose.Query<DocumentQuery> = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError(`Could not find ${Model.modelName} with that ID`, 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });

    next();
  });

export const getAll = (Model: Model<Schema>) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.find();

    if (!doc) throw new AppError('Document not found', 400);

    //SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });


export const getMyDetails = (Model: Model<Schema>) => catchAsync(


  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {
      let userId = res.locals.currentUser;
      const userRole = res.locals.userRole;



      let myDetails = await Model.findById(userId);
      res.status(200).json({
        status: "success",
        data: myDetails,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'failure',
        message: error.message
      })
    }

  }

)