import catchAsync from '../utils/catchAsync';
import AppError from "../utils/appError";
import  { Model, Schema, Query,Document, PopulateOptions } from 'mongoose';
import { Request, Response, NextFunction } from 'express';


export const deleteOne = <T extends Document>(Model: Model<T>) =>

  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params['id']);

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
    const doc = await Model.findByIdAndUpdate(req.params['id'], req.body, {
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

export const createOne = <T extends Document>(Model: Model<T>) =>
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



export const getOne = <T extends Document>(Model: Model<T>, popOptions: PopulateOptions) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let query: Query<T | null, T>= Model.findById(req.params['id']);

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

export const getAll = <T extends Document>(Model: Model<T>) =>
  catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
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


export const getMyDetails = <T extends Document>(Model: Model<T>) => catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      let userId = res.locals.currentUser;

      let myDetails = await Model.findById(userId);
      res.status(200).json({
        status: "success",
        data: myDetails,
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'failure',
        message: error.message
      });
    }
  }
);