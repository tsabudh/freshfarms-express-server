import { Request, Response, NextFunction } from "express";

import mongoose from 'mongoose';

import Message from "../models/Message";


export const getMyMessages = async (req: Request, res: Response, next: NextFunction) => {


    try {
        let adminId = res.locals.currentUser;
       
        console.log(adminId);
        let messages = await Message.find({
            $or: [
                { sender: adminId },
                { recipient: adminId }
            ]
        });
        // messages = await Message.find();

        res.status(200).json({
            status: "success",
            data: messages,
        });
    } catch (error: any) {
        res.status(400).json({
            status: 'failure',
            message: error.message
        })
    }

}