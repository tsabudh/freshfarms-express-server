import { Request, Response, NextFunction } from "express";
import multer from "multer";
import sharp from "sharp";
import * as fs from "fs";

import * as jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { s3uploadV2 } from "../utils/s3Service";

export const signupAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let adminDetails = req.body;
    let newAdmin = new Admin(adminDetails);

    newAdmin = await newAdmin.save();
    //- setting up currentUser for logging in admin after successful signup
    // res.locals.currentUser = newAdmin._id;
    const payload = {
      currentUser: newAdmin._id,
      issuedAt: Date.now(),
    };

    console.log(payload);
    let token = jwt.sign(payload, (process.env.JWT_SECRET_KEY as string));

    res.send({
      status: "success",
      data: newAdmin,
      token: token,
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

export const getMyDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let adminId = res.locals.currentUser;
  let myDetails = await Admin.findById(adminId);
  res.status(200).json({
    status: "success",
    data: myDetails,
  });
};



const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

export const uploadFile = upload.single("profilePhoto");

export const uploadPhotoToS3 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    console.log(req.file);
    let file = req.file;

    let result = await s3uploadV2(file);

    res.json({
      status: "success",
      result
    });
  } catch (error) {
    console.log(error);
    next(error);
  }

};
export const resizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(res.locals.currentUser);

    //- Return error if file is not provided
    if (!req.file) return next(new Error('File not provided!'));

    //- Return error if file type of image is not provided
    if (!req.file.mimetype.startsWith('image')) return next(new Error('Please provide an image file.'))

    //- Make changes to file extension and name
    req.file.mimetype = 'image/webp';
    req.file.originalname = `${res.locals.currentUser}-profile-picture.webp`;

    console.log(req.file);

    //- Change quality and format and attach it as req.file.buffer for s3UploadV2 function
    req.file.buffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ height: 500, width: 500, kernel: sharp.kernel.nearest })
      .toFormat("webp")
      .webp({ quality: 100 })
      .toBuffer()

    //- Set profile picture to admin
    await Admin.updateOne({ _id: res.locals.currentUser }, {
      profilePicture: req.file.originalname
    })
    next();
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: 'failure',
      message: error.message
    })
  }
};

export const updateMe = async (req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    let id = res.locals.currentUser;
    let newDetails = req.body;
    let result = await Admin.findOneAndUpdate({ _id: id }, newDetails, { new: true })

    res.status(200).json({
      status: 'success',
      data: result
    })
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: 'failure',
      message: error.message
    })
  }

}