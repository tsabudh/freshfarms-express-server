import { Request, Response, NextFunction } from "express";
import multer from 'multer';

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'src/localData');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });

  const upload = multer({
    storage: multerStorage,
  });