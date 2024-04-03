import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import { createOne, deleteOne, getAll } from '../controllers/controllerFactory';
import Contract from '../models/Contract';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getAllContracts = getAll(Contract);

export const createContract = createOne(Contract);

export const deleteContract = deleteOne(Contract);

export const markTodaysDelivery = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const details = req.body;
    const commencedDate = res.locals.commencedDate;
    const toUpdate = res.locals.toUpdate;

    console.log('   STILL UPDATING');

    let results = await Contract.updateMany(
        {
            _id: { $in: toUpdate }
        },
        {
            $push: { commencedDate }
        });


    res.json({
        status: 'success',
        data: results
    })

});
export const confirmDeliveries = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const details = req.body;
    const toUpdate = details.contracts;
    const date = details.date;
    const confirmationStatus = details.confirmed;
    let commencedDate;

    // console.log(date);
    // if(details.confirmed == true) next();

    if (!date) {
        commencedDate = Date.now();
    } else {
        commencedDate = (new Date(date));
        if ((commencedDate).toString() === "Invalid Date") {
            throw new AppError('Invalid date provided.', 400);
        };
    }

    if (!confirmationStatus) {
        console.log('Confirmation status not provided.')
        let alreadyDeliveredContracts = await Contract.find({
            commencedDate: {
                $gte: new Date().toDateString(),
                $lte: new Date(),
            }
        });
        if (!alreadyDeliveredContracts) {
            throw new AppError('Unable to check delivery status. Try again', 500)
        }

        if (alreadyDeliveredContracts.length >= 0) {
            console.log('Sending back response.')
           return res.status(422).json({
                status: "failure",
                message: "confirmation required",
                alreadyDeliveredContracts
            })
        }
    }



    // Passing information to next middleware
    res.locals.commencedDate = commencedDate;
    res.locals.toUpdate = toUpdate;
    next();
    // if (confirmationStatus == true) {
    //     return next();
    // }




});