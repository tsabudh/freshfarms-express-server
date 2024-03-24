import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import { createOne, deleteOne, getAll } from '../controllers/controllerFactory';
import Contract from '../models/Contract';
import catchAsync from '../utils/catchAsync';

export const getAllContracts = getAll(Contract);

export const createContract = createOne(Contract);

export const deleteContract = deleteOne(Contract);

export const markTodaysDelivery = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const details = req.body;
    const toUpdate = details.contracts;
    console.log(toUpdate);
    await Contract.updateMany(
        {
            _id: { $in: toUpdate }
        },
        {
            $push: { commencedDate: Date.now() }
        });


    res.json({
        status: 'success'
    })

});