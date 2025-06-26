import { Request, Response, NextFunction } from "express";


import Message from "../models/Message";


export const getMyMessages = async (_req: Request, res: Response, _next: NextFunction) => {


    try {
        let adminId = res.locals.currentUser;
       
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