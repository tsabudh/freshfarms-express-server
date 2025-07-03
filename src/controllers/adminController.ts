import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import Admin from '../models/Admin';
import { s3, s3upload } from '../utils/s3Service';
import { getMyDetails } from './controllerFactory';
import { signJWT } from '../utils/jwtUtils';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export const signupAdmin = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    let adminDetails = req.body;
    let newAdmin = new Admin(adminDetails);

    newAdmin = await newAdmin.save();
    //- setting up currentUser for logging in admin after successful signup
    const payload = {
      currentUser: newAdmin._id,
      issuedAt: Date.now(),
    };

    const token = signJWT(payload);

    res.send({
      status: 'success',
      data: newAdmin,
      token: token,
    });
  } catch (error: any) {
    res.send({
      status: 'failure',
      message: error.message,
    });
  }
};
export const getMyDetailsAsAdmin = getMyDetails(Admin);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

export const uploadFile = upload.single('profilePhoto');

export const uploadPhotoToS3 = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let file = req.file;
    //- Return error if file is not provided
    if (!file) return next(new Error('File not provided!'));

    // let result = await s3uploadV2(file);
    let result = await s3upload(file, 'admin');

    res.json({
      status: 'success',
      result,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const resizeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //- Return error if file is not provided
    if (!req.file) return next(new Error('File not provided!'));

    //- Return error if file type of image is not provided
    if (!req.file.mimetype.startsWith('image'))
      return next(new Error('Please provide an image file.'));

    //- Make changes to file extension and name
    req.file.mimetype = 'image/webp';
    req.file.originalname = `${res.locals.currentUser}-profile-picture.webp`;

    //- Change quality and format and attach it as req.file.buffer for s3UploadV2 function
    req.file.buffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ height: 500, width: 500, kernel: sharp.kernel.nearest })
      .toFormat('webp')
      .webp({ quality: 100 })
      .toBuffer();

    //- Set profile picture to admin
    await Admin.updateOne(
      { _id: res.locals.currentUser },
      {
        profilePicture: req.file.originalname,
      },
    );
    next();
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: 'failure',
      message: error.message,
    });
  }
};

export const updateMe = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    let id = res.locals.currentUser;
    let newDetails = req.body;
    let result = await Admin.findOneAndUpdate({ _id: id }, newDetails, { new: true });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      status: 'failure',
      message: error.message,
    });
  }
};
export const getAllAdmins = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await Admin.find();
    res.json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    console.log(error);
    res.json({
      status: 'failure',
      message: error.message,
    });
  }
};

export const streamProfilePicture = async (req: Request, res: Response, _next: NextFunction) => {
  const bucket = process.env['AWS_BUCKET_NAME'];
  const { filename } = req['params'];
  const currentUser = res.locals['currentUser'];

  if (!bucket) return res.status(500).json({ message: 'AWS_BUCKET_NAME is not defined' });

  // const key = `admins/profilePicture/${currentUser}-profile-picture.webp`; // Adjust if dynamic based on role
  const key = `admins/profilePicture/${filename}`; // Adjust if dynamic based on role
  console.log(key);
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const data = await s3.send(command);
    res.setHeader('Content-Type', data.ContentType || 'image/webp');

    const body = data.Body;

    if (!body) {
      return res.status(404).send('File not found');
    }
    if (body instanceof Readable) {
      return body.pipe(res);
    } else {
      return Readable.from(body as any).pipe(res);
    }
  } catch (err) {
    console.error('❌ S3 fetch error:', err);
    return res.status(404).json({ message: 'Profile picture not found' });
  }
};
