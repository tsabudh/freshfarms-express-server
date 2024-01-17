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
    let token = jwt.sign(payload, "secretKey");

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
  console.log(myDetails);
  res.status(200).json({
    status: "success",
    data: myDetails,
  });
};

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/localData");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

export const uploadFile = upload.single("photo");

export const uploadPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.file)
    let file = req.file;

    let result = await s3uploadV2(file)

    res.json({
      status: "success",
      result
    });
  } catch (error) {
    console.log(error);
  }

};
export const resizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) return next(new Error('File not provided!'));

    if (!req.file.mimetype.startsWith('image')) return next(new Error('Please provide an image file.'))

    req.file.mimetype = 'image/webp';
    req.file.originalname = 'userphoto.webp';

    console.log(req.file);
    // const buf = await fs.promises.readFile(req.file.path);

    req.file.buffer = await sharp(req.file.buffer)
      .resize({ height: 500, width: 500, kernel: sharp.kernel.nearest })
      // .toFormat("webp")
      .webp({ quality: 90 })
      .toBuffer()



    next();
  } catch (error) {

    console.log(error);
    res.status(400).json({
      status: 'failure',
      message: error.message
    })
  }
};
